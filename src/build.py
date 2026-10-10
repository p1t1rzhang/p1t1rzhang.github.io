#!/usr/bin/env python3
"""Pete's website 建置：把樣板、CSS、JS 與所有資料內嵌成單一 index.html。

  data/taxonomy.json · taxonomy.en.json         ML 知識樹（中／英）
  data/stat_taxonomy.json · stat_taxonomy.en.json 統計 × 因果知識樹（中／英）
  data/workflow.json · workflow.en.json         資料分析流程（中／英）
  data/profile.json                              個人資料與案例（雙語）
  data/playbook_consulting|data|pm.json          三條職能線方法論（雙語）
  data/daily_models.js                           打包時的模型雷達快照
另外產生：robots.txt、sitemap.xml、llms.txt、llms-full.txt、work/<作品>/、methods/<方法論>/、圖示與頭像檔（見 seo.py）
用法：python3 src/build.py"""
import base64, json, os, re, sys
from pathlib import Path

SRC = Path(__file__).resolve().parent
DATA = SRC / "data"
STYLE = os.environ.get("STYLE", "ez")   # 正式網站用 3B（Ezera）風格
OUT = SRC.parent / "index.html"

def load(name):
    return json.loads((DATA / name).read_text(encoding="utf-8"))

def blob(obj):
    return json.dumps(obj, ensure_ascii=False, separators=(",", ":")).replace("<", "\\u003c")

def katex_assets():
    kd = SRC / "vendor" / "katex"
    css = (kd / "katex.min.css").read_text(encoding="utf-8")
    def font(m):
        data = base64.b64encode((kd / "fonts" / f"{m.group(1)}.woff2").read_bytes()).decode("ascii")
        return f'src:url(data:font/woff2;base64,{data}) format("woff2")'
    css = re.sub(r'src:url\(fonts/([A-Za-z0-9_-]+)\.woff2\) format\("woff2"\)(?:,url\([^)]*\) format\("[a-z]+"\))*', font, css)
    js = (kd / "katex.min.js").read_text(encoding="utf-8").replace("</", "<\\/")
    return css.replace("</", "<\\/"), js

def leaves(t):
    for a in t["children"]:
        for b in a["children"]:
            for c in b["children"]:
                yield from c["leaves"]

def check(tax, tax_en, stat, stat_en, profile, playbook):
    ids = {lf["id"] for lf in leaves(tax)} | {lf["id"] for lf in leaves(stat)}
    for zh, en, nm in ((tax, tax_en, "ML"), (stat, stat_en, "統計")):
        a = [lf["id"] for lf in leaves(zh)]; b = [lf["id"] for lf in leaves(en)]
        if a != b: raise ValueError(f"{nm} 中英文知識樹的方法 id 不一致")
    cases = {c["id"] for c in profile["cases"]}
    items = {f'{t["id"]}/{i["id"]}' for t in playbook for i in t["items"]}
    bad = []
    for c in profile["cases"]:
        for m in c.get("methods", []):
            mid = m["id"] if isinstance(m, dict) else m
            if mid not in ids: bad.append(f"案例 {c['id']} → 方法 {mid}")
        for p in c.get("playbook", []):
            if p not in items: bad.append(f"案例 {c['id']} → 方法論 {p}")
    for t in playbook:
        for i in t["items"]:
            for c in i.get("cases", []):
                if c not in cases: bad.append(f"方法論 {t['id']}/{i['id']} → 案例 {c}")
            for l in i.get("links", []):
                if l["t"] == "algo" and l["id"] not in ids: bad.append(f"方法論 {t['id']}/{i['id']} → {l['id']}")
    if bad: raise ValueError("連結指向不存在的項目：\n  " + "\n  ".join(bad))


# ───────── 公開版資料：完整拆解不放進網頁（不是隱藏，是根本不輸出） ─────────
CASE_PUBLIC = ("id", "tracks", "title", "org", "type", "period", "result", "accent", "summary", "metrics", "scqa", "myRole", "impact", "methods", "playbook", "skills", "privacy", "repo", "tail")
def _first(v):
    if isinstance(v, dict) and set(v) <= {"zh", "en"}:
        return {k: (x[:1] if isinstance(x, list) else x) for k, x in v.items()}
    return v[:1] if isinstance(v, list) else v
def public_profile(p):
    p = json.loads(json.dumps(p))
    for c in p["cases"]:
        for k in list(c):
            if k not in CASE_PUBLIC: del c[k]
        c["scqa"] = {k: v for k, v in c["scqa"].items() if k in ("s", "c", "q", "a")}   # 30 秒摘要：情境→衝突→問題→答案（答案只有一句結論，不含內部數字）
        c["metrics"] = c.get("metrics", [])[:3]
        c["myRole"] = _first(c.get("myRole"))
        c["locked"] = not c.get("repo")   # 開源專案直接連到 GitHub，不需要「來信索取」
    for sec in ("experience", "projects"):
        for e in p.get(sec, []):
            if "bullets" in e: e["bullets"] = {k: v[:3] for k, v in e["bullets"].items()} if isinstance(e["bullets"], dict) else e["bullets"][:3]   # 公開版每段經歷最多 3 點
    p.pop("resume", None)   # 完整履歷不放進公開網頁，履歷頁改成「寫信索取」
    return p

import seo   # 給搜尋引擎與 AI 助理（GEO）的內容：結構化資料、靜態頁、robots / sitemap / llms.txt

def case_sort_key(c):
    """期間字串 → (結束, 開始)。'2026.07 –' 進行中視為最新；只有年份的視為該年 0 月。"""
    import re as _re
    per = c.get("period", "")
    ym = [(int(y), int(m or 0)) for y, m in _re.findall(r"(\d{4})(?:\.(\d{1,2}))?", per)]
    if not ym: return ((0, 0), (0, 0))
    start = ym[0]
    end = (9999, 12) if _re.search(r"[–-]\s*$", per.strip()) else ym[-1]
    return (end, start)


def main():
    tax, tax_en = load("taxonomy.json"), load("taxonomy.en.json")
    stat, stat_en = load("stat_taxonomy.json"), load("stat_taxonomy.en.json")
    wf, wf_en = load("workflow.json"), load("workflow.en.json")
    profile = public_profile(load("profile.json"))
    profile["cases"].sort(key=case_sort_key, reverse=True)   # 作品依日期排序：最新（進行中）在前
    profile["cases"] = [c for c in profile["cases"] if not c.get("tail")] + sorted((c for c in profile["cases"] if c.get("tail")), key=lambda c: c["tail"])   # 指定放在最後的作品（tail 1 = 倒數第二、2 = 最後）
    playbook = [load(f"playbook_{k}.json") for k in ("consulting", "data", "pm")]
    try:
        check(tax, tax_en, stat, stat_en, profile, playbook)
    except ValueError as e:
        print("❌", e); return 1
    html = (SRC / "template.html").read_text(encoding="utf-8")
    if STYLE == "ez": html = html.replace('<html lang="zh-Hant">', '<html lang="zh-Hant" data-style="ez">', 1).replace("family=Schibsted+Grotesk:wght@400..900", "family=Noto+Serif+TC:wght@400;600;900")
    fonts_css = ""
    css = "\n".join((SRC / f).read_text(encoding="utf-8") for f in ("tokens.css", "legacy.css", "styles.css", "design.css") + (("ez.css",) if STYLE == "ez" else ()))
    if STYLE == "ez":   # 內嵌拉丁字型（Playfair Display、Inter），離線也能顯示正確字型
        fd = SRC / "vendor" / "fonts"; faces = []
        for fn, fam, w, st in (("playfair-display-latin-400-normal", "Playfair Display", 400, "normal"), ("playfair-display-latin-400-italic", "Playfair Display", 400, "italic"),
                               ("playfair-display-latin-700-normal", "Playfair Display", 700, "normal"), ("playfair-display-latin-700-italic", "Playfair Display", 700, "italic"),
                               ("inter-latin-400-normal", "Inter", 400, "normal"), ("inter-latin-500-normal", "Inter", 500, "normal"), ("inter-latin-600-normal", "Inter", 600, "normal")):
            p = fd / f"{fn}.woff2"
            if p.exists():
                faces.append(f'@font-face{{font-family:"{fam}";font-style:{st};font-weight:{w};font-display:swap;src:url(data:font/woff2;base64,{base64.b64encode(p.read_bytes()).decode()}) format("woff2");unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215}}')
        fonts_css = "\n".join(faces)   # 字型放在頁面後段：讓搜尋引擎與 AI 一打開就先讀到內容
    app = "\n".join((SRC / f).read_text(encoding="utf-8") for f in ("app_core.js", "app_kb.js", "app_pages.js", "app_home.js", "app_ez.js", "app_boot.js"))
    av = SRC / "vendor" / "avatar.jpg"   # 個人簡介頭像（大頭照）
    app = app.replace("__AVATAR_SRC__", ("data:image/jpeg;base64," + __import__("base64").b64encode(av.read_bytes()).decode()) if av.exists() else "")
    k_css, k_js = katex_assets()
    site = os.environ.get("SITE_URL", "https://p1t1rzhang.github.io/").strip() or "https://p1t1rzhang.github.io/"   # 正式網址（結構化資料與分享預覽圖需要完整網址）
    n = sum(1 for _ in leaves(tax)) + sum(1 for _ in leaves(stat))
    daily = (DATA / "daily_models.js").read_text(encoding="utf-8").replace("</", "<\\/") if (DATA / "daily_models.js").exists() else ""
    rep = {
        "/*__KATEX_CSS__*/": k_css, "/*__KATEX_JS__*/": k_js, "/*__CSS__*/": css.replace("</", "<\\/"), "/*__APP__*/": app.replace("</script", "<\\/script"),
        "/*__TAX_ZH__*/": blob(tax), "/*__TAX_EN__*/": blob(tax_en), "/*__STAT_ZH__*/": blob(stat), "/*__STAT_EN__*/": blob(stat_en),
        "/*__WF_ZH__*/": blob(wf), "/*__WF_EN__*/": blob(wf_en), "/*__PROFILE__*/": blob(profile), "/*__PLAYBOOK__*/": blob(playbook), "/*__DAILY__*/": daily, "/*__FONTS__*/": fonts_css,
        "/*__JSONLD__*/": seo.home_jsonld(profile, playbook, site, n, seo.today()).replace("</", "<\\/"), "/*__STATIC_HOME__*/": seo.static_home(profile, playbook, n),
    }
    for k, v in rep.items():
        if k not in html: print(f"❌ 樣板中找不到 {k}"); return 1
        html = html.replace(k, v, 1)
    og = SRC / "vendor" / "og-image.jpg"
    if og.exists(): (OUT.parent / "og-image.jpg").write_bytes(og.read_bytes())   # 分享預覽圖放在網頁旁邊
    html = html.replace("__SITE_URL__", site).replace("__N_METHODS__", str(n))
    OUT.write_text(html, encoding="utf-8")
    seo.write_all(OUT.parent, profile, playbook, site, n, SRC / "vendor")   # robots、sitemap、llms(-full).txt、作品與方法論靜態頁、圖示
    print(f"✅ 已產生 {OUT.name}：{sum(1 for _ in leaves(tax))} + {sum(1 for _ in leaves(stat))} 個方法、{len(profile['cases'])} 個案例、"
          f"{sum(len(t['items']) for t in playbook)} 張方法論卡，{OUT.stat().st_size/1024:.0f} KB")
    return 0

if __name__ == "__main__":
    sys.exit(main())
