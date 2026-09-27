#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
server.py — 方案 A：輕量本機後端（只用標準函式庫，免安裝任何套件）

功能
----
- 提供 index.html 與靜態檔案（只綁定 127.0.0.1，外部網路連不到）
- 打開網頁時，前端會自動呼叫 /api/refresh：若資料不是今天的或已超過 3 小時，就在背景重新抓取
- 同一時間只會有一個抓取工作（執行緒鎖），並有冷卻時間，避免重複打 Hugging Face API

API
---
GET  /api/status              → 伺服器狀態（是否正在抓取、上次結果）
GET  /api/models              → 目前的 daily_models.json
POST /api/refresh[?force=1]   → 重新抓取；未加 force 時若 10 分鐘內剛抓過會直接回傳快取

用法
----
    python3 server.py                  # 預設 http://127.0.0.1:8765 並自動開啟瀏覽器
    python3 server.py --port 9000 --no-browser
"""
from __future__ import annotations

import argparse
import json
import threading
import time
import webbrowser
from datetime import datetime, timezone
from functools import partial
from http import HTTPStatus
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, unquote, urlparse

import fetch_hf

BASE_DIR = Path(__file__).resolve().parent
DATA_FILE = BASE_DIR / "daily_models.json"
COOLDOWN_AUTO = 10 * 60   # 自動更新的最短間隔（秒）
COOLDOWN_FORCE = 60       # 手動強制更新的最短間隔（秒）

_lock = threading.Lock()
_status = {"fetching": False, "last_run": None, "last_ok": None, "last_error": None, "last_duration": None}


def read_payload():
    try:
        return json.loads(DATA_FILE.read_text(encoding="utf-8"))
    except (FileNotFoundError, json.JSONDecodeError):
        return None


def do_refresh(force: bool, limit: int, top: int) -> dict:
    """在呼叫端執行緒中同步抓取；以鎖確保同時只有一個抓取。"""
    if _status["fetching"]:
        with _lock:  # 等待進行中的抓取完成，直接回傳其結果
            pass
        return {"ok": _status["last_error"] is None, "skipped": True, "message": "剛好有另一個更新在進行，已取得其結果。",
                "payload": read_payload(), "error": _status["last_error"]}
    last_ok = _status["last_ok"]
    cooldown = COOLDOWN_FORCE if force else COOLDOWN_AUTO
    if last_ok and time.time() - last_ok < cooldown:
        return {"ok": True, "skipped": True, "message": f"{int(time.time() - last_ok)} 秒前才更新過，先使用快取。", "payload": read_payload()}
    with _lock:
        _status.update(fetching=True, last_run=datetime.now(timezone.utc).isoformat(timespec="seconds"))
        t0 = time.time()
        try:
            payload = fetch_hf.run(limit=limit, top=top, out_dir=BASE_DIR)
            _status.update(last_ok=time.time(), last_error=None)
            return {"ok": True, "payload": payload}
        except fetch_hf.FetchError as e:
            _status["last_error"] = str(e)
            return {"ok": False, "error": str(e), "payload": read_payload()}
        except Exception as e:  # 不讓伺服器因未知錯誤中斷
            _status["last_error"] = f"{type(e).__name__}: {e}"
            return {"ok": False, "error": _status["last_error"], "payload": read_payload()}
        finally:
            _status.update(fetching=False, last_duration=round(time.time() - t0, 2))


class Handler(SimpleHTTPRequestHandler):
    server_version = "ModelLearning/1.0"
    limit = 60
    top = 12

    # ── 回應工具 ──
    def _json(self, obj, status=HTTPStatus.OK):
        body = json.dumps(obj, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def end_headers(self):
        if self.path.split("?")[0].endswith((".html", ".js", ".json", "/")):
            self.send_header("Cache-Control", "no-store")
        super().end_headers()

    # ── 安全檢查 ──
    def _host_ok(self) -> bool:
        """只接受以 127.0.0.1 / localhost 連線的請求（防 DNS rebinding）；
        POST 另外檢查 Origin，避免其他網站在背景觸發抓取（CSRF）。"""
        host = (self.headers.get("Host") or "").rsplit(":", 1)[0].strip("[]").lower()
        if host not in ("127.0.0.1", "localhost", "::1"):
            return False
        origin = self.headers.get("Origin")
        if self.command == "POST" and origin:
            o = urlparse(origin)
            if (o.hostname or "").lower() not in ("127.0.0.1", "localhost", "::1"):
                return False
        return True

    # 白名單：只提供網頁與資料檔，其餘（程式碼、歷史快照、紀錄檔、.git 等）一律 404
    ALLOWED_STATIC = {"/", "/index.html", "/daily_models.json", "/daily_models.js"}

    # ── 路由 ──
    def do_GET(self):
        if not self._host_ok():
            return self._json({"error": "forbidden"}, HTTPStatus.FORBIDDEN)
        path = urlparse(self.path).path
        if path == "/api/status":
            p = read_payload()
            return self._json({"server": True, "version": fetch_hf.__version__, **_status,
                               "data_generated_at": p.get("generated_at") if p else None})
        if path == "/api/models":
            p = read_payload()
            return self._json(p) if p else self._json({"empty": True, "models": None, "message": "尚無資料，請先執行 fetch_hf.py 或呼叫 /api/refresh"})
        if path == "/daily_models.js" and not (BASE_DIR / "daily_models.js").exists():
            body = b"window.DAILY_MODELS = null;  // no data yet\n"
            self.send_response(HTTPStatus.OK)
            self.send_header("Content-Type", "application/javascript; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return None
        if unquote(path) not in self.ALLOWED_STATIC:
            return self._json({"error": "not found"}, HTTPStatus.NOT_FOUND)
        return super().do_GET()

    def do_HEAD(self):  # 網頁用不到 HEAD；關閉以免被用來探測檔案是否存在
        self.send_error(HTTPStatus.METHOD_NOT_ALLOWED)

    def do_POST(self):
        if not self._host_ok():
            return self._json({"error": "forbidden"}, HTTPStatus.FORBIDDEN)
        u = urlparse(self.path)
        if u.path == "/api/refresh":
            force = parse_qs(u.query).get("force", ["0"])[0] in ("1", "true", "yes")
            return self._json(do_refresh(force, self.limit, self.top))
        return self._json({"error": "not found"}, HTTPStatus.NOT_FOUND)

    def log_message(self, fmt, *args):
        msg = fmt % args
        if "/api/" in msg or '" 4' in msg or '" 5' in msg:
            print(f"  [{datetime.now():%H:%M:%S}] {msg}", flush=True)


def main():
    ap = argparse.ArgumentParser(description="Model Learning 本機儀表板伺服器")
    ap.add_argument("--port", type=int, default=8765)
    ap.add_argument("--limit", type=int, default=60, help="每次抓取的模型數")
    ap.add_argument("--top", type=int, default=12, help="今日精選數量")
    ap.add_argument("--no-browser", action="store_true", help="不要自動開啟瀏覽器")
    a = ap.parse_args()
    Handler.limit, Handler.top = a.limit, a.top

    httpd = None
    for port in range(a.port, a.port + 20):  # 埠號被占用時自動往後找
        try:
            httpd = ThreadingHTTPServer(("127.0.0.1", port), partial(Handler, directory=str(BASE_DIR)))
            break
        except OSError:
            continue
    if httpd is None:
        raise SystemExit(f"❌ {a.port}–{a.port + 19} 埠號都被占用，請用 --port 指定其他埠號")
    url = f"http://127.0.0.1:{httpd.server_address[1]}/index.html"
    print(f"\n🌸 Model Learning 儀表板已啟動：{url}")
    print("   打開網頁時會自動檢查並更新今日資料；按 Ctrl+C 停止伺服器。\n")
    if not a.no_browser:
        threading.Timer(0.6, lambda: webbrowser.open(url)).start()
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n已停止伺服器。")
    finally:
        httpd.server_close()


if __name__ == "__main__":
    main()
