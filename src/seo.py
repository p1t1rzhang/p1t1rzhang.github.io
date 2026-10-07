"""給搜尋引擎與 AI 助理（GEO）讀的內容：結構化資料、靜態頁、robots / sitemap / llms.txt。

原則：
- 只用 public_profile() 之後的公開資料，完整拆解與內部數字一律不輸出。
- 所有句子都從 src/data 產生，不另外寫 Pete 沒做過的事。
- 不執行 JavaScript 也讀得到：首頁內嵌靜態摘要，每個作品與方法論另有一個輕量的獨立網址。
"""
import datetime, json, re
from pathlib import Path

def _zh(v): return v.get("zh") if isinstance(v, dict) else v
def _en(v): return v.get("en") if isinstance(v, dict) else v
def _l(v, lang): return (v.get(lang) if isinstance(v, dict) else v) or ""
def _esc(s): return (str(s or "")).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace('"', "&quot;")
def _list(v, lang):
    x = _l(v, lang)
    return x if isinstance(x, list) else ([x] if x else [])

def today():
    return datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=8))).date().isoformat()

def _ym(period):
    m = re.search(r"(\d{4})(?:\.(\d{1,2}))?", period or "")
    return (f"{m.group(1)}-{int(m.group(2)):02d}" if m.group(2) else m.group(1)) if m else None

# ───────── 介面文字 ─────────
L = {
  "zh": {"home": "首頁", "work": "作品案例", "methods": "方法論", "about": "關於我", "contact": "聯絡", "scqa": "30 秒摘要",
         "s": "情境", "c": "衝突", "q": "問題", "a": "答案", "role": "我的角色", "impact": "成果", "playbook": "用到的方法論",
         "skills": "工具與技能", "repo": "在 GitHub 看程式碼", "ask": "完整案例拆解可來信索取", "open": "打開互動版網站",
         "more": "其他作品", "when": "什麼時候用", "steps": "怎麼做", "example": "實際例子", "pitfalls": "常見陷阱", "cases": "相關作品",
         "principles": "原則", "faq": "常見問題", "edu": "學歷", "exp": "經歷", "facts": "基本資料", "lang": "English",
         "site": "Pete's website", "by": "作者：張方燡 Pete", "updated": "更新"},
  "en": {"home": "Home", "work": "Work", "methods": "Playbooks", "about": "About", "contact": "Contact", "scqa": "30-second summary",
         "s": "Situation", "c": "Complication", "q": "Question", "a": "Answer", "role": "My role", "impact": "Outcome", "playbook": "Playbooks used",
         "skills": "Tools & skills", "repo": "View the code on GitHub", "ask": "Full write-up available by email", "open": "Open the interactive site",
         "more": "More work", "when": "When to use it", "steps": "How", "example": "Real example", "pitfalls": "Common pitfalls", "cases": "Related work",
         "principles": "Principles", "faq": "FAQ", "edu": "Education", "exp": "Experience", "facts": "Facts", "lang": "中文",
         "site": "Pete's website", "by": "By Fang-I (Pete) Zhang", "updated": "Updated"},
}

def _sec(tag, title, inner, wrap="ul", cls=""):
    """有內容才輸出：<h2>標題</h2><ul>內容</ul>"""
    if not inner: return ""
    c = f' class="{cls}"' if cls else ""
    return f"<{tag}>{title}</{tag}>" + (f"<{wrap}{c}>{inner}</{wrap}>" if wrap else inner)

def n_methods(tax, stat, leaves):
    return sum(1 for _ in leaves(tax)) + sum(1 for _ in leaves(stat))

# ───────── 常見問題：全部由資料組出來 ─────────
def faq(p, lang, n):
    P = p["person"]; zh = lang == "zh"
    facts = {_en(f["k"]): _l(f["v"], lang) for f in P["facts"]}
    sep = "、" if zh else "; "
    cases = sep.join(_l(c["title"], lang).split("：")[0].split(":")[0] for c in p["cases"])
    skills = []
    for g in p.get("skills", []):
        it = g["items"]; skills += (_l(it, lang) if isinstance(it, dict) else it)
    contact = sep.join(f'{c["label"]}（{c["text"]}）' if zh else f'{c["label"]} ({c["text"]})' for c in P["contact"])
    name = "張方燡 Pete" if zh else "Fang-I (Pete) Zhang"
    if zh:
        return [
          (f"{name} 是誰？", f"{name}，{_zh(P['sub'])}。研究方向：{facts.get('Research','')}。{_zh(P['headline'])}"),
          ("Pete 在找什麼樣的機會？", f"{_zh(P['status'])}。目前就讀{facts.get('Now','')}，人在{_zh(P['location'])}。"),
          ("Pete 做過哪些專案？", f"共 {len(p['cases'])} 個作品：{cases}。每個作品都有一頁公開摘要；完整案例拆解可來信索取。"),
          ("Pete 會用哪些工具與方法？", "、".join(skills) + "。"),
          ("這個網站有什麼？", f"個人介紹、{len(p['cases'])} 個作品案例摘要、管顧思維／數據分析／專案管理三條方法論，以及 {n} 個方法的中英雙語資料科學知識庫與每日 AI 模型雷達。"),
          ("怎麼聯絡 Pete？", f"{contact}。完整履歷與完整案例拆解可來信索取。"),
        ]
    return [
      (f"Who is {name}?", f"{name}: {_en(P['sub'])}. Research: {facts.get('Research','')}. {_en(P['headline'])}"),
      ("What roles is Pete looking for?", f"{_en(P['status'])}. Currently: {facts.get('Now','')}, based in {_en(P['location'])}."),
      ("What has Pete worked on?", f"{len(p['cases'])} projects: {cases}. Each has a public summary page; full write-ups are available by email."),
      ("Which tools and methods does Pete use?", ", ".join(skills) + "."),
      ("What is on this site?", f"A profile, {len(p['cases'])} case summaries, playbooks for consulting, data analytics and project management, and a bilingual data-science knowledge base of {n} methods with a daily AI model radar."),
      ("How can I contact Pete?", f"{contact}. The full resume and full case write-ups are available on request."),
    ]

# ───────── 首頁內嵌的靜態內容（JavaScript 載入後會換成互動版） ─────────
def static_home(p, playbook, n):
    P = p["person"]; out = []
    for lang in ("zh", "en"):
        t = L[lang]
        facts = "".join(f"<li>{_esc(_l(f['k'], lang))}：{_esc(_l(f['v'], lang))}</li>" if lang == "zh" else f"<li>{_esc(_l(f['k'], lang))}: {_esc(_l(f['v'], lang))}</li>" for f in P["facts"])
        bio = "".join(f"<p>{_esc(x)}</p>" for x in _list(P.get("bio"), lang))
        cases = "".join(f'<li><a href="work/{c["id"]}/"><b>{_esc(_l(c["title"], lang))}</b></a> — {_esc(_l(c["org"], lang))}（{_esc(c["period"])}，{_esc(_l(c["result"], lang))}）：{_esc(_l(c["summary"], lang))}</li>'
                        if lang == "zh" else
                        f'<li><a href="work/{c["id"]}/"><b>{_esc(_l(c["title"], lang))}</b></a> — {_esc(_l(c["org"], lang))} ({_esc(c["period"])}, {_esc(_l(c["result"], lang))}): {_esc(_l(c["summary"], lang))}</li>' for c in p["cases"])
        ways = "".join(f'<li><a href="methods/{b["id"]}/"><b>{_esc(_l(b["name"], lang))}</b></a>：{_esc(_l(b["tagline"], lang))}</li>' if lang == "zh" else
                       f'<li><a href="methods/{b["id"]}/"><b>{_esc(_l(b["name"], lang))}</b></a>: {_esc(_l(b["tagline"], lang))}</li>' for b in playbook)
        q = "".join(f"<dt>{_esc(a)}</dt><dd>{_esc(b)}</dd>" for a, b in faq(p, lang, n))
        contact = " · ".join(f'<a href="{_esc(c["href"])}" rel="me">{_esc(c["label"])}</a>' for c in P["contact"] if c.get("href"))
        h1 = f'{_esc(_l(P["name"], lang))}｜{_esc(_l(P["roles"], lang))}' if lang == "zh" else f'{_esc(_l(P["name"], lang))} | {_esc(_l(P["roles"], lang))}'
        tag = "h1" if lang == "zh" else "h2"
        out.append(f'<div lang="{"zh-Hant" if lang == "zh" else "en"}"><{tag}>{h1}</{tag}><p><b>{_esc(_l(P["headline"], lang))}</b></p><p>{_esc(_l(P["sub"], lang))}</p>{bio}'
                   f'<ul>{facts}</ul><h2>{t["work"]}</h2><ul>{cases}</ul><h2>{t["methods"]}</h2><ul>{ways}</ul>'
                   f'<h2>{t["faq"]}</h2><dl>{q}</dl><p>{t["contact"]}：{contact}</p></div>')
    return '<div class="seo-static">' + "<hr>".join(out) + "</div>"

# ───────── 結構化資料（schema.org JSON-LD） ─────────
def person_ld(p, base):
    P = p["person"]
    skills = []
    for g in p.get("skills", []):
        it = g["items"]; skills += (_en(it) if isinstance(it, dict) else it)
    exp = p.get("experience", [])
    d = {"@type": "Person", "@id": base + "#pete", "name": "Fang-I (Pete) Zhang", "alternateName": ["張方燡", "張方燡 Pete", "Pete Zhang"],
         "url": base, "image": base + "avatar.jpg",
         "jobTitle": next((_en(e["role"]) for e in exp if str(e.get("period", "")).strip().endswith("–")), None), "description": _en(P["headline"]),
         "email": next((c["text"] for c in P["contact"] if c["id"] == "email"), None),
         "address": {"@type": "PostalAddress", "addressLocality": "Taipei", "addressCountry": "TW"},
         "alumniOf": [{"@type": "CollegeOrUniversity", "name": _en(e["school"]), "alternateName": _zh(e["school"])} for e in p.get("education", [])],
         "affiliation": [{"@type": "Organization", "name": _en(e["org"]), "alternateName": _zh(e["org"])} for e in exp if str(e.get("period", "")).strip().endswith("–")],
         "hasCredential": [{"@type": "EducationalOccupationalCredential", "name": _en(c["name"]), "recognizedBy": {"@type": "Organization", "name": _en(c["org"])}} for c in p.get("certs", [])],
         "knowsAbout": skills, "knowsLanguage": ["zh-Hant", "en"],
         "sameAs": [c["href"] for c in P["contact"] if c.get("href", "").startswith("http")]}
    return {k: v for k, v in d.items() if v}

def home_jsonld(p, playbook, base, n, date):
    person = person_ld(p, base)
    site = {"@type": "WebSite", "@id": base + "#site", "url": base, "name": "Pete's website", "alternateName": "張方燡 Pete 的個人網站",
            "inLanguage": ["zh-Hant", "en"], "author": {"@id": base + "#pete"}, "publisher": {"@id": base + "#pete"}}
    page = {"@type": "ProfilePage", "@id": base + "#profile", "url": base, "name": "張方燡 Pete｜策略顧問 × 數據分析 × 專案管理",
            "mainEntity": {"@id": base + "#pete"}, "isPartOf": {"@id": base + "#site"}, "inLanguage": ["zh-Hant", "en"], "dateModified": date,
            "primaryImageOfPage": base + "og-image.jpg"}
    works = {"@type": "ItemList", "@id": base + "#work", "name": "Work · 作品案例", "itemListElement": [
        {"@type": "ListItem", "position": i + 1, "url": f"{base}work/{c['id']}/", "name": _en(c["title"])} for i, c in enumerate(p["cases"])]}
    books = {"@type": "ItemList", "@id": base + "#methods", "name": "Playbooks · 方法論", "itemListElement": [
        {"@type": "ListItem", "position": i + 1, "url": f"{base}methods/{b['id']}/", "name": _en(b["name"])} for i, b in enumerate(playbook)]}
    qa = {"@type": "FAQPage", "@id": base + "#faq", "mainEntity": [{"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}}
          for lang in ("zh", "en") for q, a in faq(p, lang, n)]}
    return json.dumps({"@context": "https://schema.org", "@graph": [person, site, page, works, books, qa]}, ensure_ascii=False)

# ───────── 獨立靜態頁 ─────────
PAGE_CSS = """
:root{--bg:#fff;--ink:#1b1b1b;--ink-2:#565656;--line:#ededed;--soft:#f6f6f6;--brand:#7A1E3A;--brand-text:#7A1E3A;--pink:#FBEAF0;color-scheme:light dark}
@media (prefers-color-scheme:dark){:root{--bg:#0e0e0e;--ink:#f1f1f1;--ink-2:#bdbdbd;--line:#262626;--soft:#171717;--brand:#9C2F52;--brand-text:#F09BB5;--pink:#2A1920}}
*{box-sizing:border-box}html{-webkit-text-size-adjust:100%}
body{margin:0;background:var(--bg);color:var(--ink);font:16px/1.75 "Inter","Noto Sans TC",-apple-system,BlinkMacSystemFont,"PingFang TC",sans-serif}
a{color:var(--brand-text);text-underline-offset:3px}
.top{position:sticky;top:0;z-index:2;background:color-mix(in srgb,var(--bg) 82%,transparent);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border-bottom:1px solid var(--line)}
.top-in{max-width:820px;margin:0 auto;padding:12px 16px;display:flex;gap:16px;align-items:center;justify-content:space-between}
.brand{white-space:nowrap;font:400 20px/1 "Playfair Display","Noto Serif TC","Songti TC",Georgia,serif;color:var(--ink);text-decoration:none}
.top nav{display:flex;gap:14px;font-size:14px}.top nav a{color:var(--ink-2);text-decoration:none}.top nav a:hover{color:var(--brand-text)}
main{max-width:820px;margin:0 auto;padding:28px 16px 64px}
.crumb{font-size:13px;color:var(--ink-2);margin:0 0 18px}.crumb a{color:var(--ink-2)}
.eyebrow{font-size:13px;letter-spacing:.04em;color:var(--brand-text);margin:0 0 6px}
h1{font:400 clamp(30px,5vw,44px)/1.2 "Playfair Display","Noto Serif TC","Songti TC",Georgia,serif;margin:0 0 14px;letter-spacing:-.01em}
h2{font:600 20px/1.35 "Noto Serif TC","Songti TC",Georgia,serif;margin:40px 0 12px;padding-top:4px}
h3{font-size:17px;margin:22px 0 6px}
.lede{font-size:18px;color:var(--ink-2);margin:0 0 22px}
.nums{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:10px;margin:22px 0}
.nums div{background:var(--soft);border:1px solid var(--line);border-radius:16px;padding:14px 16px}
.nums b{display:block;font:400 26px/1.2 "Playfair Display",Georgia,serif;color:var(--brand-text)}.nums span{font-size:13.5px;color:var(--ink-2)}
dl.scqa{display:grid;grid-template-columns:5.5em 1fr;gap:8px 14px;margin:0}dl.scqa dt{font-weight:600;color:var(--brand-text)}dl.scqa dd{margin:0}
.chips{display:flex;flex-wrap:wrap;gap:6px;padding:0;list-style:none}.chips li{background:var(--pink);color:var(--brand-text);border-radius:999px;padding:2px 12px;font-size:13.5px}
.note{background:var(--soft);border-left:3px solid var(--brand);padding:10px 14px;border-radius:8px;font-size:14px;color:var(--ink-2)}
.cta{display:inline-block;margin:26px 10px 0 0;padding:10px 20px;border-radius:999px;background:var(--brand);color:#fff;text-decoration:none;font-weight:600}
.cta.ghost{background:transparent;color:var(--brand-text);border:1px solid var(--brand)}
.item{border-top:1px solid var(--line);margin-top:34px}
.sep{border:0;border-top:1px solid var(--line);margin:56px 0 30px}
footer{border-top:1px solid var(--line);color:var(--ink-2);font-size:14px}
footer .in{max-width:820px;margin:0 auto;padding:24px 16px 40px}
footer ul{padding-left:1.1em;margin:6px 0 16px}
@media (max-width:560px){dl.scqa{grid-template-columns:1fr;gap:2px}dl.scqa dd{margin-bottom:10px}.top nav{gap:12px;font-size:14px}.top nav .en{display:none}}
"""

def _page(base, path, title, desc, body, ld, lang="zh-Hant", og_type="article"):
    url = base + path
    ld = ld.replace("</", "<\\/")
    return f"""<!doctype html>
<html lang="{lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{_esc(title)}</title>
<meta name="description" content="{_esc(desc)}">
<link rel="canonical" href="{url}">
<meta name="robots" content="index,follow,max-image-preview:large">
<meta name="author" content="Fang-I (Pete) Zhang 張方燡">
<meta property="og:type" content="{og_type}">
<meta property="og:site_name" content="Pete's website">
<meta property="og:title" content="{_esc(title)}">
<meta property="og:description" content="{_esc(desc)}">
<meta property="og:url" content="{url}">
<meta property="og:image" content="{base}og-image.jpg">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" type="image/svg+xml" href="{base}favicon.svg">
<link rel="icon" type="image/png" sizes="64x64" href="{base}favicon-64.png">
<link rel="apple-touch-icon" href="{base}apple-touch-icon.png">
<script type="application/ld+json">{ld}</script>
<style>{PAGE_CSS}</style>
</head>
<body>
<header class="top"><div class="top-in"><a class="brand" href="../../">Pete's website</a>
<nav aria-label="Main"><a href="../../#about">關於我<span class="en"> About</span></a><a href="../../#work">作品<span class="en"> Work</span></a><a href="../../#methods">方法論<span class="en"> Playbooks</span></a></nav></div></header>
{body}
</body>
</html>
"""

def _footer(p, cur=None):
    items = "".join(f'<li><a href="../../work/{c["id"]}/">{_esc(_zh(c["title"]))}</a></li>' for c in p["cases"] if c["id"] != cur)
    contact = " · ".join(f'<a href="{_esc(c["href"])}" rel="me">{_esc(c["label"])}</a>' for c in p["person"]["contact"] if c.get("href"))
    return (f'<footer><div class="in"><b>{L["zh"]["more"]} · {L["en"]["more"]}</b><ul>{items}</ul>'
            f'<p>張方燡 Pete · Fang-I (Pete) Zhang — {contact}</p></div></footer>')

def _breadcrumb(base, name, url):
    return {"@type": "BreadcrumbList", "itemListElement": [
        {"@type": "ListItem", "position": 1, "name": "Pete's website", "item": base},
        {"@type": "ListItem", "position": 2, "name": name, "item": url}]}

def case_page(c, p, playbook, base, date):
    names = {f'{b["id"]}/{i["id"]}': (b["id"], i) for b in playbook for i in b["items"]}
    url = f"{base}work/{c['id']}/"
    arts = []
    for lang in ("zh", "en"):
        t = L[lang]; colon = "：" if lang == "zh" else ": "
        meta = " · ".join(x for x in (_l(c["org"], lang), _l(c["type"], lang), c["period"], _l(c["result"], lang)) if x)
        nums = "".join(f'<div><b>{_esc(m["v"])}</b><span>{_esc(_l(m["k"], lang))}</span></div>' for m in c.get("metrics", []))
        sc = "".join(f'<dt>{t[k]}</dt><dd>{_esc(_l(c["scqa"][k], lang))}</dd>' for k in ("s", "c", "q", "a") if c.get("scqa", {}).get(k))
        role = "".join(f"<li>{_esc(x)}</li>" for x in _list(c.get("myRole"), lang))
        pb = "".join(f'<li><a href="../../methods/{names[k][0]}/#{names[k][1]["id"]}">{_esc(_l(names[k][1]["name"], lang))}</a>{colon}{_esc(_l(names[k][1]["oneLiner"], lang))}</li>'
                     for k in c.get("playbook", []) if k in names)
        skills = "".join(f"<li>{_esc(s)}</li>" for s in c.get("skills", []))
        impact = _l(c.get("impact"), lang)
        priv = _l(c.get("privacy"), lang)
        cta = (f'<a class="cta" href="{_esc(c["repo"])}" rel="noopener">{t["repo"]}</a>' if c.get("repo") else
               f'<a class="cta" href="mailto:{_esc(next((x["text"] for x in p["person"]["contact"] if x["id"] == "email"), ""))}">{t["ask"]}</a>')
        lg = "zh-Hant" if lang == "zh" else "en"
        q = "" if lang == "zh" else "?lang=en"
        arts.append(f'<article lang="{lg}" id="{lang}"><p class="eyebrow">{_esc(meta)}</p><h1>{_esc(_l(c["title"], lang))}</h1>'
            f'<p class="lede">{_esc(_l(c["summary"], lang))}</p>'
            + (f'<div class="nums">{nums}</div>' if nums else "")
            + _sec("h2", t["scqa"], sc, "dl", "scqa") + _sec("h2", t["role"], role) + _sec("h2", t["impact"], f"<p>{_esc(impact)}</p>" if impact else "", None)
            + _sec("h2", t["playbook"], pb) + _sec("h2", t["skills"], skills, "ul", "chips")
            + (f'<p class="note">{_esc(priv)}</p>' if priv else "")
            + f'{cta}<a class="cta ghost" href="../../{q}#case/{c["id"]}">{t["open"]}</a></article>')
    body = (f'<main><p class="crumb"><a href="../../">Pete\'s website</a> › <a href="../../#work">作品案例 Work</a> › {_esc(_zh(c["title"]))} · <a href="#en">English</a></p>'
            + '<hr class="sep">'.join(arts) + "</main>" + _footer(p, c["id"]))
    kind = "SoftwareSourceCode" if c.get("repo") else "CreativeWork"
    work = {"@type": kind, "@id": url + "#work", "url": url, "name": _zh(c["title"]), "alternateName": _en(c["title"]),
            "headline": _en(c["title"]), "description": _en(c["summary"]), "abstract": _zh(c["summary"]),
            "author": {"@type": "Person", "@id": base + "#pete", "name": "Fang-I (Pete) Zhang", "url": base},
            "dateCreated": _ym(c["period"]), "dateModified": date, "inLanguage": ["zh-Hant", "en"], "keywords": c.get("skills", []),
            "sourceOrganization": {"@type": "Organization", "name": _en(c["org"]), "alternateName": _zh(c["org"])},
            "isPartOf": {"@id": base + "#site"}}
    if c.get("repo"): work.update({"codeRepository": c["repo"]}); work.pop("sourceOrganization")
    ld = json.dumps({"@context": "https://schema.org", "@graph": [{k: v for k, v in work.items() if v}, _breadcrumb(base, _zh(c["title"]), url)]}, ensure_ascii=False)
    title = f'{_zh(c["title"])}｜張方燡 Pete'
    return _page(base, f"work/{c['id']}/", title, _zh(c["summary"]) + " " + _en(c["summary"]), body, ld)

def playbook_page(b, p, base, date):
    cases = {c["id"]: c for c in p["cases"]}
    url = f"{base}methods/{b['id']}/"
    arts = []
    for lang in ("zh", "en"):
        t = L[lang]
        pr = "".join(f"<li><b>{_esc(x[0])}</b>{'：' if lang == 'zh' else ': '}{_esc(x[1])}</li>" for x in (_l(r, lang) for r in b.get("principles", [])) if x)
        items = []
        for i in b["items"]:
            when = "".join(f"<li>{_esc(x)}</li>" for x in _list(i.get("when"), lang))
            steps = "".join(f"<li>{_esc(x)}</li>" for x in _list(i.get("steps"), lang))
            ex = "".join(f"<p>{_esc(x)}</p>" for x in _l(i.get("example"), lang).split("\n") if x.strip())
            pit = "".join(f"<li>{_esc(x)}</li>" for x in _list(i.get("pitfalls"), lang))
            cs = "".join(f'<li><a href="../../work/{k}/">{_esc(_l(cases[k]["title"], lang))}</a></li>' for k in i.get("cases", []) if k in cases)
            anchor = f' id="{i["id"]}"' if lang == "zh" else f' id="en-{i["id"]}"'
            items.append(f'<section class="item"{anchor}><h2>{_esc(_l(i["name"], lang))}</h2><p class="lede">{_esc(_l(i["oneLiner"], lang))}</p>'
                         + _sec("h3", t["when"], when) + _sec("h3", t["steps"], steps, "ol") + _sec("h3", t["example"], ex, None)
                         + _sec("h3", t["pitfalls"], pit) + _sec("h3", t["cases"], cs) + "</section>")
        lg = "zh-Hant" if lang == "zh" else "en"
        q = "" if lang == "zh" else "?lang=en"
        arts.append(f'<article lang="{lg}" id="{lang}"><p class="eyebrow">{_esc(_l(b["role"], lang))}</p>'
                    f'<h1>{_esc(_l(b["name"], lang))}</h1><p class="lede">{_esc(_l(b["tagline"], lang))}</p><p>{_esc(_l(b.get("intro"), lang))}</p>'
                    + _sec("h2", t["principles"], pr) + "".join(items)
                    + f'<a class="cta ghost" href="../../{q}#methods/{b["id"]}">{t["open"]}</a></article>')
    body = (f'<main><p class="crumb"><a href="../../">Pete\'s website</a> › <a href="../../#methods">方法論 Playbooks</a> › {_esc(_zh(b["name"]))} · <a href="#en">English</a></p>'
            + '<hr class="sep">'.join(arts) + "</main>" + _footer(p))
    art = {"@type": "Article", "@id": url + "#article", "url": url, "headline": f'{_zh(b["name"])}：{_zh(b["tagline"])}', "alternativeHeadline": f'{_en(b["name"])}: {_en(b["tagline"])}',
           "description": _en(b.get("intro")), "author": {"@type": "Person", "@id": base + "#pete", "name": "Fang-I (Pete) Zhang", "url": base},
           "dateModified": date, "inLanguage": ["zh-Hant", "en"], "isPartOf": {"@id": base + "#site"},
           "about": [_en(i["name"]) for i in b["items"]], "image": base + "og-image.jpg"}
    ld = json.dumps({"@context": "https://schema.org", "@graph": [art, _breadcrumb(base, _zh(b["name"]), url)]}, ensure_ascii=False)
    return _page(base, f"methods/{b['id']}/", f'{_zh(b["name"])}：{_zh(b["tagline"])}｜張方燡 Pete', f'{_zh(b["tagline"])} {_en(b["tagline"])}', body, ld)

# ───────── robots.txt、sitemap.xml、llms.txt、llms-full.txt ─────────
AI_BOTS = ("GPTBot", "OAI-SearchBot", "ChatGPT-User", "ClaudeBot", "Claude-SearchBot", "Claude-User", "PerplexityBot", "Perplexity-User",
           "Google-Extended", "Applebot", "Applebot-Extended", "Bingbot", "DuckAssistBot", "meta-externalagent", "CCBot")

def robots(base):
    return ("# Pete's website：歡迎搜尋引擎與 AI 助理讀取公開內容\n"
            "User-agent: *\nAllow: /\n\n"
            "# AI 搜尋與助理（明確允許）\n" + "".join(f"User-agent: {b}\n" for b in AI_BOTS) + "Allow: /\n\n"
            f"# 給 AI 的網站摘要：{base}llms.txt（完整版：{base}llms-full.txt）\n"
            f"Sitemap: {base}sitemap.xml\n")

def sitemap(p, playbook, base, date):
    urls = [f'  <url><loc>{base}</loc><lastmod>{date}</lastmod>'
            f'<xhtml:link rel="alternate" hreflang="zh-Hant" href="{base}"/><xhtml:link rel="alternate" hreflang="en" href="{base}?lang=en"/>'
            f'<xhtml:link rel="alternate" hreflang="x-default" href="{base}"/></url>']
    urls += [f"  <url><loc>{base}work/{c['id']}/</loc><lastmod>{date}</lastmod></url>" for c in p["cases"]]
    urls += [f"  <url><loc>{base}methods/{b['id']}/</loc><lastmod>{date}</lastmod></url>" for b in playbook]
    return ('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n'
            + "\n".join(urls) + "\n</urlset>\n")

def llms(p, playbook, base, n):
    P = p["person"]
    lines = ["# 張方燡 Pete（Fang-I (Pete) Zhang）", "", f"> {_en(P['headline'])} {_en(P['sub'])}. {_en(P['status'])}.", "",
             f"{_zh(P['headline'])} {_zh(P['sub'])}。{_zh(P['status'])}。", ""]
    lines += [f"- {_en(f['k'])}: {_en(f['v'])}" for f in P["facts"]]
    lines += [f"- Location: {_en(P['location'])}", f"- Focus: {_en(P['roles'])}（{_zh(P['roles'])}）", "",
              "## Work / 作品（public summaries; full write-ups on request）"]
    lines += [f"- [{_en(c['title'])}｜{_zh(c['title'])}]({base}work/{c['id']}/): {_en(c['org'])}, {c['period']}, {_en(c['result'])}. {_en(c['summary'])}" for c in p["cases"]]
    lines += ["", "## Playbooks / 方法論"]
    lines += [f"- [{_en(b['name'])}｜{_zh(b['name'])}]({base}methods/{b['id']}/): {_en(b['tagline'])}" for b in playbook]
    lines += ["", "## FAQ"] + [f"- **{q}** {a}" for q, a in faq(p, "en", n)]
    lines += ["", "## Contact"] + [f"- {c['label']}: {c['href']}" for c in P["contact"] if c.get("href")]
    lines += ["", "## Optional", f"- [Full text of all public pages / 全部公開內容全文]({base}llms-full.txt)",
              f"- [Interactive site / 互動版網站]({base})", ""]
    return "\n".join(lines)

def llms_full(p, playbook, n, base):
    P = p["person"]; out = []
    for lang in ("zh", "en"):
        t = L[lang]
        out += [f"# {_l(P['name'], lang)} — {_l(P['roles'], lang)}", "", _l(P["headline"], lang), "", _l(P["sub"], lang), _l(P["status"], lang), ""]
        out += _list(P.get("bio"), lang) + [""]
        out += [f"- {_l(f['k'], lang)}: {_l(f['v'], lang)}" for f in P["facts"]] + [""]
        out += [f"## {t['edu']}"] + [f"- {_l(e['school'], lang)}, {_l(e['degree'], lang)} ({e['period']}). {_l(e.get('note'), lang)}".rstrip(". ") for e in p.get("education", [])] + [""]
        out += [f"## {t['exp']}"]
        for e in p.get("experience", []) + p.get("projects", []):
            out.append(f"- {_l(e['org'], lang)} · {_l(e['role'], lang)} ({e['period'].strip()})" + "".join(f" — {b}" for b in _list(e.get("bullets"), lang)))
        out += ["", f"## {t['skills']}"]
        for g in p.get("skills", []):
            it = g["items"]; out.append(f"- {_l(g['group'], lang)}: " + ", ".join(_l(it, lang) if isinstance(it, dict) else it))
        out += [f"- {_l(c['name'], lang)} ({_l(c['org'], lang)}, {c['year']})" for c in p.get("certs", [])] + [""]
        out += [f"## {t['work']}", ""]
        for c in p["cases"]:
            out += [f"### {_l(c['title'], lang)}", f"URL: {base}work/{c['id']}/", f"{_l(c['org'], lang)} · {_l(c['type'], lang)} · {c['period']} · {_l(c['result'], lang)}", "",
                    _l(c["summary"], lang), ""]
            out += [f"- {m['v']} {_l(m['k'], lang)}" for m in c.get("metrics", [])]
            out += [f"- {t[k]}: {_l(c['scqa'][k], lang)}" for k in ("s", "c", "q", "a") if c.get("scqa", {}).get(k)]
            out += [f"- {t['role']}: {x}" for x in _list(c.get("myRole"), lang)]
            if _l(c.get("impact"), lang): out.append(f"- {t['impact']}: {_l(c['impact'], lang)}")
            if c.get("skills"): out.append(f"- {t['skills']}: {', '.join(c['skills'])}")
            if c.get("repo"): out.append(f"- GitHub: {c['repo']}")
            if _l(c.get("privacy"), lang): out.append(f"- {_l(c['privacy'], lang)}")
            out.append("")
        out += [f"## {t['methods']}", ""]
        for b in playbook:
            out += [f"### {_l(b['name'], lang)} — {_l(b['tagline'], lang)}", f"URL: {base}methods/{b['id']}/", "", _l(b.get("intro"), lang), ""]
            out += [f"- {x[0]}: {x[1]}" for x in (_l(r, lang) for r in b.get("principles", [])) if x] + [""]
            for i in b["items"]:
                out += [f"#### {_l(i['name'], lang)}", _l(i["oneLiner"], lang)]
                out += [f"- {t['when']}: {x}" for x in _list(i.get("when"), lang)]
                out += [f"{k + 1}. {x}" for k, x in enumerate(_list(i.get("steps"), lang))]
                if _l(i.get("example"), lang): out += [f"{t['example']}: " + _l(i["example"], lang).replace("\n", " ")]
                out += [f"- {t['pitfalls']}: {x}" for x in _list(i.get("pitfalls"), lang)] + [""]
        out += [f"## {t['faq']}", ""] + [f"**{q}**\n{a}\n" for q, a in faq(p, lang, n)]
        out += [f"## {t['contact']}"] + [f"- {c['label']}: {c['text']}" for c in P["contact"]] + ["", "---", ""]
    return "\n".join(out)

def write_all(root: Path, p, playbook, base, n, vendor: Path):
    """寫出所有 GEO 檔案到網站根目錄（index.html 旁邊）。"""
    date = today()
    (root / "robots.txt").write_text(robots(base), encoding="utf-8")
    (root / "sitemap.xml").write_text(sitemap(p, playbook, base, date), encoding="utf-8")
    (root / "llms.txt").write_text(llms(p, playbook, base, n), encoding="utf-8")
    (root / "llms-full.txt").write_text(llms_full(p, playbook, n, base), encoding="utf-8")
    for c in p["cases"]:
        d = root / "work" / c["id"]; d.mkdir(parents=True, exist_ok=True)
        (d / "index.html").write_text(case_page(c, p, playbook, base, date), encoding="utf-8")
    for b in playbook:
        d = root / "methods" / b["id"]; d.mkdir(parents=True, exist_ok=True)
        (d / "index.html").write_text(playbook_page(b, p, base, date), encoding="utf-8")
    sl = vendor / "slides"   # 關於我的簡報範例：只複製 profile.json 的 slides 有列出的圖片
    names = {s["img"].split("/")[-1] for s in p.get("slides", [])}
    if names:
        (root / "slides").mkdir(exist_ok=True)
        for n in names:
            if (sl / n).exists(): (root / "slides" / n).write_bytes((sl / n).read_bytes())
    for src, dst in (("favicon.svg", "favicon.svg"), ("favicon-64.png", "favicon-64.png"), ("favicon-180.png", "apple-touch-icon.png"), ("avatar.jpg", "avatar.jpg")):
        if (vendor / src).exists(): (root / dst).write_bytes((vendor / src).read_bytes())
    return date
