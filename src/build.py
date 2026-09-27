#!/usr/bin/env python3
"""把三份知識庫資料內嵌進 index.template.html，產生上一層的 index.html。

  taxonomy.json       ML 演算法知識樹
  stat_taxonomy.json  統計推論 × 因果推論知識樹
  workflow.json       資料分析流程知識庫
  vendor/katex/       數學公式渲染（KaTeX，MIT 授權；字型轉成 data URI 內嵌，離線可用）

修改方法：編輯上述 JSON → 執行 python3 src/build.py
公開上線時可設定環境變數 SITE_URL（例如 https://帳號.github.io/model-learning/），
分享連結時的預覽圖與網址會使用它；GitHub Actions 會自動帶入。
（會檢查兩棵樹的 id 是否全域唯一、流程頁的連結是否指向存在的節點）"""
import base64
import json
import os
import re
import sys
from pathlib import Path

SRC = Path(__file__).resolve().parent
OUT = SRC.parent / "index.html"


def load(name):
    return json.loads((SRC / name).read_text(encoding="utf-8"))


def walk(tax, tree, ids, kinds):
    """登記一棵樹的所有 id；回傳 L4 數量。"""
    leaves = 0
    def reg(i, kind):
        if i in ids:
            raise ValueError(f"重複的 id：{i}（{ids[i]} 與 {tree}）")
        ids[i] = tree
        kinds[i] = kind
    for l1 in tax["children"]:
        reg(l1["id"], "node")
        for l2 in l1["children"]:
            reg(l2["id"], "node")
            for l3 in l2["children"]:
                reg(l3["id"], "node")
                for lf in l3["leaves"]:
                    reg(lf["id"], "algo")
                    leaves += 1
    return leaves


def katex_assets():
    """讀取 KaTeX 的 CSS 與 JS；CSS 內的字型改成 woff2 data URI，讓 index.html 單檔離線可用。"""
    kd = SRC / "vendor" / "katex"
    css = (kd / "katex.min.css").read_text(encoding="utf-8")

    def font(m):
        name = m.group(1)
        data = base64.b64encode((kd / "fonts" / f"{name}.woff2").read_bytes()).decode("ascii")
        return f'src:url(data:font/woff2;base64,{data}) format("woff2")'
    css = re.sub(r'src:url\(fonts/([A-Za-z0-9_-]+)\.woff2\) format\("woff2"\)(?:,url\([^)]*\) format\("[a-z]+"\))*', font, css)
    if "url(fonts/" in css:
        raise ValueError("KaTeX CSS 仍有未內嵌的字型路徑")
    js = (kd / "katex.min.js").read_text(encoding="utf-8").replace("</", "<\\/")
    return css.replace("</", "<\\/"), js


def blob(obj):
    return json.dumps(obj, ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/")


def main() -> int:
    tax, stat, wf = load("taxonomy.json"), load("stat_taxonomy.json"), load("workflow.json")
    ids, kinds = {}, {}
    try:
        n_ml = walk(tax, "ML", ids, kinds)
        n_stat = walk(stat, "統計因果", ids, kinds)
    except ValueError as e:
        print(f"❌ {e}")
        return 1
    bad = []
    for st in wf["stages"]:
        links = list(st.get("links", []))
        for row in (st.get("routing") or {}).get("rows", []):
            links += row.get("links", [])
        for l in links:
            if kinds.get(l["id"]) != l["t"]:
                bad.append(f"{st['id']} → {l['t']}:{l['id']}")
    if bad:
        print("❌ 流程頁有連結指向不存在的節點：\n  " + "\n  ".join(bad))
        return 1
    html = (SRC / "index.template.html").read_text(encoding="utf-8")
    try:
        k_css, k_js = katex_assets()
    except (OSError, ValueError) as e:
        print(f"❌ 無法載入 KaTeX：{e}")
        return 1
    if "/*__KATEX_CSS__*/" not in html or "/*__KATEX_JS__*/" not in html:
        print("❌ 樣板中找不到 KaTeX 的插入點")
        return 1
    html = html.replace("/*__KATEX_CSS__*/", k_css, 1).replace("/*__KATEX_JS__*/", k_js, 1)
    for key, obj in (("/*__TAXONOMY__*/", tax), ("/*__STAT_TAXONOMY__*/", stat), ("/*__WORKFLOW__*/", wf)):
        if key not in html:
            print(f"❌ 樣板中找不到 {key}")
            return 1
        html = html.replace(key, blob(obj))
    site = os.environ.get("SITE_URL", "").strip()
    if site and not site.endswith("/"):
        site += "/"
    html = html.replace("__SITE_URL__", site)
    if not site:  # 本機版沒有固定網址，拿掉空的 og:url
        html = html.replace('<meta property="og:url" content="">\n', "")
    OUT.write_text(html, encoding="utf-8")
    print(f"✅ 已產生 {OUT.name}：ML {n_ml} 個演算法、統計因果 {n_stat} 個方法、流程 {len(wf['stages'])} 階段，"
          f"{OUT.stat().st_size / 1024:.0f} KB")
    return 0


if __name__ == "__main__":
    sys.exit(main())
