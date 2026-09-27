#!/bin/bash
# ─────────────────────────────────────────────────────────────
# 方案 A（輕量後端）：在 Finder 按兩下即可
#   啟動本機伺服器 → 自動開啟瀏覽器 → 網頁打開時自動在背景更新今日資料
#   關閉這個終端機視窗（或按 Ctrl+C）即停止伺服器。
# ─────────────────────────────────────────────────────────────
cd "$(dirname "$0")" || exit 1
PY="$(command -v python3 || true)"
if [ -z "$PY" ]; then
  echo "❌ 找不到 python3。請先安裝 Python 3：https://www.python.org/downloads/ 或 brew install python"
  read -n 1 -s -r -p "按任意鍵關閉…"; exit 1
fi
exec "$PY" server.py "$@"
