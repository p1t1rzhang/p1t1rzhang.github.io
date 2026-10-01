/* 個人簡介頭像：優先用大頭照，否則用瀏覽器分頁圖示（F5 點狀球） */
const FAV_SRC = (document.querySelector('link[rel="icon"][type="image/svg+xml"]') || {}).href || "";
const AVATAR_SRC = "__AVATAR_SRC__";  /* build.py 內嵌 vendor/avatar.jpg；沒有照片時退回分頁圖示 */
const MONO = AVATAR_SRC.startsWith("data:") ? `<img class="mono-seal fav-av photo-av" src="${AVATAR_SRC}" alt="張方燡 Pete" width="76" height="76">`
  : FAV_SRC ? `<img class="mono-seal fav-av" src="${FAV_SRC}" alt="" width="76" height="76">` : `<span class="mono-seal">PZ</span>`;
/* ═════════════════════════ 共用片段 ═════════════════════════ */
const P = PROFILE.person;
const list = (arr, cls="ul") => `<ul class="${cls}">${(arr || []).map(x => `<li>${rich(x)}</li>`).join("")}</ul>`;
const asList = v => { const x = tx(v); return Array.isArray(x) ? x : (x ? [x] : []); };
const trackName = id => TRACK[id] ? tx(TRACK[id].name) : id;
const roleName = id => { const r = PROFILE.roles.find(x => x.id === id); return r ? tx(r.name) : id; };
const pbItem = ref => { const [tr, it] = String(ref).split("/"); const T = TRACK[tr]; const I = T && T.items.find(x => x.id === it); return I ? {tr, it, T, I} : null; };
const tkTags = tracks => `<span class="tk">${(tracks || []).map(x => `<i>${esc(roleName(x).split(/[／/]/)[0])}</i>`).join("")}</span>`;
function caseCard(c){
  return `<button class="case-card" data-case="${c.id}">
    <div class="cc-meta"><span>${esc(tx(c.type))} · ${esc(c.period)}</span><span class="cc-res">${esc(tx(c.result))}</span></div>
    <h3>${esc(tx(c.title))}</h3><p>${esc(tx(c.summary))}</p>
    <div class="cc-metrics">${(c.metrics || []).slice(0,3).map(m => `<div><b>${esc(m.v)}</b><span>${esc(tx(m.k))}</span></div>`).join("")}</div>
    <div class="cc-foot">${tkTags(c.tracks)}<span class="go">${t("readCase")}</span></div></button>`;
}
const contactLinks = (cls="") => P.contact.map(c => c.href ? `<a class="${cls}" href="${esc(c.href)}" ${/^https?:/.test(c.href) ? 'target="_blank" rel="noopener noreferrer"' : ""}>${ic(c.id === "email" ? "mail" : c.id, 15)}${esc(c.label)}</a>` : "").join("");

function learnTiles(){
  const tiles = [["radar","radar","tRadar","tRadarD"],["taxonomy","tree","tML","tMLD"],["stats","stats","tStat","tStatD"],["workflow","flow","tFlow","tFlowD"],["quiz","quiz","tQuiz","tQuizD"],["method","doc","tCrit","tCritD"]];
  return `<div class="tile-grid">${tiles.map(([v, i, a, b]) => `<button class="tile" data-view="${v}"><span class="ic">${ic(i, 22)}</span><h3>${esc(t(a))}</h3><p>${esc(t(b, {n: v === "taxonomy" ? LEAVES_BY.ml.length : LEAVES_BY.stat.length}))}</p><span class="go">${t("go")}</span></button>`).join("")}</div>`;
}

/* ═════════════════════════ 作品案例 ═════════════════════════ */
function renderWork(){
  const f = state.workFilter, shown = CASES.filter(c => f === "all" || (c.tracks || []).includes(f));
  $("#view-work").innerHTML = `
    <div class="page-head"><div class="eyebrow">${t("workEyebrow")}</div><h1 class="title">${t("workTitle")}</h1><p class="lede">${t("workLede")}</p></div>
    <div class="filter-row"><div class="seg" role="group">
      <button aria-pressed="${f === "all"}" data-wf="all">${t("all")}<span class="c">${CASES.length}</span></button>
      ${PROFILE.roles.map(r => `<button aria-pressed="${f === r.id}" data-wf="${r.id}">${esc(tx(r.name))}<span class="c">${CASES.filter(c => (c.tracks||[]).includes(r.id)).length}</span></button>`).join("")}</div></div>
    <div class="case-grid">${shown.map(caseCard).join("")}</div>`;
  $$("[data-wf]", $("#view-work")).forEach(b => b.onclick = () => { state.workFilter = b.dataset.wf; renderWork(); });
}

/* ═════════════════════════ 案例內頁 ═════════════════════════ */
function renderCase(){
  const c = CASE[state.caseId] || CASES[0]; state.caseId = c.id;
  const i = CASES.indexOf(c), prev = CASES[i-1], next = CASES[i+1], S = c.scqa;
  const tree = c.tree ? `<div class="section-title"><h2>${t("treeTitle")}</h2><span class="hint">${t("treeHint")}</span></div>
    <div class="card itree"><div class="it-root">${esc(tx(c.tree.root))}</div><div class="it-branches">${(c.tree.branches || []).map(b => `<div class="it-b${b.focus ? " focus" : ""}"><div class="it-lab">${esc(tx(b.label))}</div><div class="it-kids">${asList(b.kids).map(k => `<span>${esc(k)}</span>`).join("")}</div></div>`).join("")}</div></div>` : "";
  const segs = c.segments ? `<div class="section-title"><h2>${t("segTitle")}</h2><span class="hint">${t("segHint")}</span></div>
    <div class="seg-grid">${c.segments.map((s, k) => `<div class="seg-card${k < 3 ? " hot" : ""}"><b>${esc(tx(s.n))}</b><code>${esc(s.rfm)}</code><p>${esc(tx(s.rule))}</p><div class="lv">→ ${esc(tx(s.lever))}</div></div>`).join("")}</div>` : "";
  const hyp = c.hypotheses ? `<div class="section-title"><h2>${t("hypTitle")}</h2><span class="hint">${t("hypHint")}</span></div>
    <div class="card hyp">${c.hypotheses.map(h => `<div class="hyp-row${h.best ? " best" : ""}"><div class="h">${esc(tx(h.h))}</div><div class="hyp-track"><i style="width:${((h.m - 1) / 4 * 100).toFixed(1)}%"></i><s style="left:50%"></s></div><div class="v">M = ${h.m.toFixed(2)} · t = ${h.t.toFixed(2)}</div></div>`).join("")}
      <div class="hyp-note">${isEN() ? "Scale 1–5; dashed line = neutral midpoint 3; all p " : "量表 1–5，虛線為中立值 3；皆 p "}${esc(c.hypotheses[0].p)}</div></div>` : "";
  const impact = tx(c.impact);
  $("#view-case").innerHTML = `
    <div class="crumbs"><button data-view="work">${t("backWork")}</button><span>›</span><span>${esc(tx(c.title))}</span></div>
    <div class="case-hero"><div class="eyebrow">${esc(tx(c.type))} · ${esc(c.period)}</div><h1 class="title">${esc(tx(c.title))}</h1>
      <p class="lede">${esc(tx(c.summary))}</p>
      <div class="chips"><span class="chip task">${esc(tx(c.result))}</span><span class="chip">${esc(tx(c.org))}</span>${(c.skills || []).map(s => `<span class="chip">${esc(tx(s))}</span>`).join("")}</div></div>
    <div class="case-metrics">${(c.metrics || []).map(m => `<div><b>${esc(m.v)}</b><span>${esc(tx(m.k))}</span></div>`).join("")}</div>
    <div class="case-layout">
      <div>
        <div class="section-title"><h2>${t("scqaTitle")}</h2><span class="hint">${t("scqaHint")}</span></div>
        <div class="card scqa">${["s","c","q","a"].filter(k => S[k]).map(k => `<div class="scqa-row ${k}"><span class="L">${k.toUpperCase()}</span><span class="lb">${t(k.toUpperCase())}</span><p>${esc(tx(S[k]))}</p></div>`).join("")}</div>
        ${tree}${segs}${hyp}
        ${c.approach ? `<div class="section-title"><h2>${t("approachTitle")}</h2></div>
        <ol class="steps">${c.approach.map(a => `<li><b>${esc(tx(a.t))}</b><p>${esc(tx(a.d))}</p></li>`).join("")}</ol>` : ""}
        ${c.findings ? `<div class="two-list"><div class="card"><h3>${t("findTitle")}</h3>${list(asList(c.findings))}</div><div class="card"><h3>${t("recoTitle")}</h3>${list(asList(c.recommendations))}</div></div>` : ""}
        ${c.impact ? `<div class="section-title"><h2>${t("impactTitle")}</h2></div>${Array.isArray(impact) ? `<div class="impact">${list(impact)}</div>` : `<div class="impact">${esc(impact)}</div>`}` : ""}
        ${c.reflection ? `<div class="section-title"><h2>${t("reflectTitle")}</h2><span class="hint">${t("reflectHint")}</span></div><div class="card reflect">${list(asList(c.reflection))}</div>` : ""}
        ${c.locked ? `<div class="lock"><div class="lock-in"><h2>${t("lockT")}</h2><p>${t("lockText")}</p>
          <ul>${t("lockItems").map(x => `<li>${esc(x)}</li>`).join("")}</ul>
          <div class="cta">${mailHref() ? `<a class="btn on-field" href="${esc(mailHref() + encodeURIComponent("｜" + tx(c.title)))}">${ic("mail", 16)}${t("askMail")}</a>` : ""}${P.contact.filter(x => x.id === "linkedin").map(x => `<a class="btn on-field ghost" href="${esc(x.href)}" target="_blank" rel="noopener noreferrer">${ic("linkedin", 16)}LinkedIn</a>`).join("")}</div></div></div>` : ""}
        ${c.repo ? `<div class="lock repo-box"><div class="lock-in"><h2>${t("repoT")}</h2><p>${t("repoText")}</p>
          <div class="cta"><a class="btn on-field" href="${esc(c.repo)}" target="_blank" rel="noopener noreferrer">${ic("github", 16)}${t("repoBtn")}</a></div></div></div>` : ""}
        <div class="case-nav">${prev ? `<button class="btn" data-case="${prev.id}">${t("prevCase")}</button>` : "<span></span>"}${next ? `<button class="btn primary" data-case="${next.id}">${t("nextCase")}</button>` : ""}</div>
      </div>
      <aside class="case-aside">
        <div class="card aside-box"><h4>${t("myRole")}</h4>${list(asList(c.myRole))}</div>
        ${(c.methods || []).length ? `<div class="card aside-box"><h4>${t("methodsUsed")}</h4><div class="method-links">${c.methods.map(m => { const id = m.id || m, rec = NODES[id]; if (!rec) return "";
            return `<button class="mlink" data-algo="${id}"><b>${esc(rec.node.name)} ›</b><span>${esc(tx(m.why) || rec.node.zh || "")}</span></button>`; }).join("")}</div></div>` : ""}
        ${(c.playbook || []).length ? `<div class="card aside-box"><h4>${t("playbookLinks")}</h4><div class="method-links">${c.playbook.map(pbItem).filter(Boolean).map(x => `<button class="mlink" data-pb="${x.tr}/${x.it}"><b>${esc(tx(x.I.name))} ›</b><span>${esc(tx(x.T.name))}</span></button>`).join("")}</div></div>` : ""}
        ${tx(c.privacy) ? `<div class="privacy">🔒 ${esc(tx(c.privacy))}</div>` : ""}
      </aside>
    </div>`;
}

/* ═════════════════════════ 方法論（三條職能線） ═════════════════════════ */
function renderMethods(){
  const T = TRACK[state.track] || PLAYBOOK[0]; state.track = T.id;
  const role = PROFILE.roles.find(r => r.track === T.id);
  const items = T.items.map((it, k) => {
    const cases = (it.cases || []).map(id => CASE[id]).filter(Boolean);
    return `<details class="card pb-item" id="pb-${T.id}-${it.id}" data-item="${it.id}"${state.openItem === it.id ? " open" : ""}>
      <summary><span class="pb-num">${String(k+1).padStart(2,"0")}</span><span class="pb-t"><b>${esc(tx(it.name))}</b><span>${esc(tx(it.oneLiner))}</span></span>
        <span class="pb-tags">${it.widget ? `<span class="chip good">${t("wTry")}</span>` : ""}${cases.length ? `<span class="chip">${esc(t("usedIn"))} ${cases.length}</span>` : ""}<span class="chev">${ic("chev", 18)}</span></span></summary>
      <div class="pb-body">
        <div class="pb-cols"><div class="pb-box"><h5>${t("when")}</h5>${list(tx(it.when))}</div><div class="pb-box"><h5>${t("steps")}</h5>${list(tx(it.steps), "ul")}</div></div>
        <div><div class="pb-box" style="border:0;padding:0;background:none"><h5>${t("example")}</h5></div><div class="pb-ex">${esc(tx(it.example))}</div></div>
        ${it.template ? `<div><div class="pb-box" style="border:0;padding:0;background:none"><h5>${t("template")}</h5></div><pre class="pb-tpl">${esc(tx(it.template))}</pre></div>` : ""}
        ${it.widget ? `<div class="widget" data-widget="${it.widget}"></div>` : ""}
        <div class="pb-box warn"><h5>${t("pitfalls")}</h5>${list(tx(it.pitfalls))}</div>
        ${it.id === "workflow" ? `<div><button class="btn primary sm" data-view="workflow">${t("openWorkflow")}</button></div>` : ""}
        ${(cases.length || (it.links || []).length) ? `<div class="pb-foot">${cases.length ? `<span class="lbl">${t("usedIn")}</span>${cases.map(c => `<button class="chip lk" data-case="${c.id}">${esc(tx(c.title))} ›</button>`).join("")}` : ""}
          ${(it.links || []).length ? `<span class="lbl" style="margin-left:${cases.length ? "8px" : "0"}">${t("kbLinks")}</span>${it.links.map(linkChip).join("")}` : ""}</div>` : ""}
      </div></details>`; }).join("");
  $("#view-methods").innerHTML = `
    <div class="page-head"><div class="eyebrow">${t("methEyebrow")}</div><h1 class="title">${t("methTitle")}</h1><p class="lede">${t("methLede")}</p></div>
    <div class="track-tabs" role="tablist">${PLAYBOOK.map(tr => `<button class="track-tab" role="tab" aria-selected="${tr.id === T.id}" data-track="${tr.id}"><span class="ic">${ic(TRACK_ICON[tr.id], 22)}</span><span><b>${esc(tx(tr.name))}</b><small>${esc(tx(tr.role))}</small></span></button>`).join("")}</div>
    <div class="track-head">
      <div><p class="tagline">${esc(tx(T.tagline))}</p><p class="lede" style="font-size:15.5px">${esc(tx(T.intro))}</p>
        <div class="track-to"><button class="btn sm" data-wf-filter="${role ? role.id : "all"}">${t("trackCases")}</button><button class="btn sm" data-resume="${T.id}">${t("trackResume")}</button></div></div>
      <div class="principles">${T.principles.map((p, i) => { const [a, b] = tx(p); return `<div class="card principle"><span class="n">${i+1}</span><div><b>${esc(a)}</b><span>${esc(b)}</span></div></div>`; }).join("")}</div>
    </div>
    <div class="section-title"><h2>${esc(tx(T.name))}</h2><span class="hint">${T.items.length} ${isEN() ? "playbook cards" : "張做法卡"}</span></div>
    <div class="pb-list">${items}</div>`;
  $$(".widget", $("#view-methods")).forEach(w => WIDGETS[w.dataset.widget] && WIDGETS[w.dataset.widget](w));
  $$(".pb-item", $("#view-methods")).forEach(d => d.addEventListener("toggle", () => { if (d.open){ state.openItem = d.dataset.item; setHash(`methods/${T.id}/${d.dataset.item}`); } }));
}
$("#view-methods").addEventListener("click", e => {
  const b = e.target.closest("[data-track]"); if (b){ state.track = b.dataset.track; state.openItem = null; renderMethods(); setHash("methods/" + state.track); }
});

/* ═════════════════════════ 互動小工具 ═════════════════════════ */
const fmtMoney = v => (isEN() ? "NT$" : "NT$") + nfCompact().format(Math.round(v));
const fld = (id, label, val, step="any", min="0") => `<label class="w-field">${label}<input type="number" data-k="${id}" value="${val}" step="${step}" min="${min}"></label>`;
const readW = w => Object.fromEntries($$("[data-k]", w).map(i => [i.dataset.k, parseFloat(i.value) || 0]));
function normInv(p){   // Acklam：標準常態分布反函數
  const a=[-39.69683028665376,220.9460984245205,-275.9285104469687,138.357751867269,-30.66479806614716,2.506628277459239],
        b=[-54.47609879822406,161.5858368580409,-155.6989798598866,66.80131188771972,-13.28068155288572],
        c=[-0.007784894002430293,-0.3223964580411365,-2.400758277161838,-2.549732539343734,4.374664141464968,2.938163982698783],
        d=[0.007784695709041462,0.3224671290700398,2.445134137142996,3.754408661907416], pl=0.02425;
  if (p <= 0) return -Infinity; if (p >= 1) return Infinity;
  if (p < pl){ const q=Math.sqrt(-2*Math.log(p)); return (((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5])/((((d[0]*q+d[1])*q+d[2])*q+d[3])*q+1); }
  if (p > 1-pl){ const q=Math.sqrt(-2*Math.log(1-p)); return -(((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5])/((((d[0]*q+d[1])*q+d[2])*q+d[3])*q+1); }
  const q=p-.5, r=q*q; return (((((a[0]*r+a[1])*r+a[2])*r+a[3])*r+a[4])*r+a[5])*q/(((((b[0]*r+b[1])*r+b[2])*r+b[3])*r+b[4])*r+1);
}
const WIDGETS = {
  sizing(w){
    w.innerHTML = `<h5>${ic("chart", 16)}${t("wSizingT")}</h5><p class="wsub">${t("wSizingS")}</p>
      <div class="w-grid">${fld("pop", t("wPop"), 500000, 1000)}${fld("reach", t("wReach"), 40, 1)}${fld("conv", t("wConv"), 2.5, .1)}${fld("val", t("wValue"), 12000, 500)}${fld("lo", t("wLow"), .6, .1)}${fld("hi", t("wHigh"), 1.6, .1)}</div>
      <div class="w-bars" data-out></div><p class="w-note">${t("wSizingNote")}</p>`;
    const run = () => { const v = readW(w), base = v.pop * v.reach/100 * v.conv/100 * v.val;
      const rows = [[t("wCons"), base * v.lo], [t("wBase"), base], [t("wOpt"), base * v.hi]], mx = Math.max(1, ...rows.map(r => r[1]));
      $("[data-out]", w).innerHTML = rows.map(([k, x], i) => `<div class="w-bar"><span>${k}</span><span class="tr"><i style="width:${(x/mx*100).toFixed(1)}%;${i === 1 ? "" : "opacity:.55"}"></i></span><span class="v">${fmtMoney(x)}${t("wPerYear")}</span></div>`).join(""); };
    w.oninput = run; run();
  },
  breakeven(w){
    w.innerHTML = `<h5>${ic("chart", 16)}${t("wBeT")}</h5><p class="wsub">${t("wBeS")}</p>
      <div class="w-grid">${fld("inv", t("wInvest"), 3000000, 100000)}${fld("mar", t("wMargin"), 6000, 500)}${fld("aud", t("wAud"), 80000, 1000)}${fld("br", t("wBaseRate"), 1.5, .1)}</div>
      <div class="w-out" data-out></div><p class="w-note">${t("wBeNote")}</p>`;
    const run = () => { const v = readW(w), need = v.mar > 0 ? v.inv / v.mar : 0, pp = v.aud > 0 ? need / v.aud * 100 : 0, rel = v.br > 0 ? pp / v.br * 100 : 0;
      $("[data-out]", w).innerHTML = `<div class="w-kpi"><span>${t("wNeedConv")}</span><b>${nf().format(Math.ceil(need))}</b></div><div class="w-kpi"><span>${t("wNeedPP")}</span><b>+${pp.toFixed(2)} pp</b></div><div class="w-kpi main"><span>${t("wNeedRel")}</span><b>+${rel.toFixed(0)}%</b></div>`; };
    w.oninput = run; run();
  },
  samplesize(w){
    w.innerHTML = `<h5>${ic("stats", 16)}${t("wSsT")}</h5><p class="wsub">${t("wSsS")}</p>
      <div class="w-grid">${fld("p", t("wP"), 5, .1)}${fld("mde", t("wMde"), 10, 1)}
        <label class="w-field">${t("wAlpha")}<select data-k="a"><option value="0.1">0.10</option><option value="0.05" selected>0.05</option><option value="0.01">0.01</option></select></label>
        <label class="w-field">${t("wPower")}<select data-k="pw"><option value="0.8" selected>0.80</option><option value="0.9">0.90</option><option value="0.95">0.95</option></select></label>
        ${fld("tr", t("wTraffic"), 4000, 100)}</div>
      <div class="w-out" data-out></div><p class="w-note">${t("wSsNote")}</p>`;
    const run = () => { const v = readW(w), p1 = v.p/100, p2 = p1 * (1 + v.mde/100), za = normInv(1 - v.a/2), zb = normInv(v.pw), pb = (p1+p2)/2;
      const n = (p2 > p1 && p1 > 0 && p2 < 1) ? Math.ceil(Math.pow(za*Math.sqrt(2*pb*(1-pb)) + zb*Math.sqrt(p1*(1-p1) + p2*(1-p2)), 2) / Math.pow(p2-p1, 2)) : NaN;
      const days = v.tr > 0 ? Math.ceil(2*n / v.tr) : NaN;
      $("[data-out]", w).innerHTML = `<div class="w-kpi main"><span>${t("wNper")}</span><b>${isFinite(n) ? nf().format(n) : "—"}</b></div><div class="w-kpi"><span>${t("wNtot")}</span><b>${isFinite(n) ? nf().format(2*n) : "—"}</b></div><div class="w-kpi"><span>${t("wDays")}</span><b>${isFinite(days) ? days : "—"}</b></div>`; };
    w.oninput = run; w.onchange = run; run();
  },
  chooser(w){
    const Q = {
      rand:{q:["你能自己決定誰接受處理（隨機分配）嗎？","Can you decide who gets the treatment (randomize)?"], o:[[["可以","Yes"],"interf"],[["不行，只有觀察資料","No, observational data only"],"cutoff"]]},
      interf:{q:["處理組和對照組會互相影響嗎？（共用司機、同店員工、社群擴散）","Do treated and control units affect each other (shared supply, same store, network spill-over)?"], o:[[["會","Yes"],"R:cluster-rct"],[["會，而且是雙邊市場","Yes, in a two-sided marketplace"],"R:switchback"],[["不會","No"],"R:abtest"]]},
      cutoff:{q:["是否由一條門檻決定誰被處理？（分數 ≥ 60、消費滿額升等）","Is treatment decided by a cutoff on a score (pass mark, spend threshold)?"], o:[[["是","Yes"],"R:rdd"],[["不是","No"],"iv"]]},
      iv:{q:["有沒有一個只透過處理影響結果的外部推力（工具變數）？","Is there an external nudge that affects the outcome only through the treatment (an instrument)?"], o:[[["有","Yes"],"R:iv"],[["沒有","No"],"panel"]]},
      panel:{q:["有沒有處理前後、處理組與未處理組的資料？","Do you have before/after data for both treated and untreated units?"], o:[[["有","Yes"],"many"],[["只有單一序列的時間資料","Only one time series"],"R:its"],[["沒有，只有一個時間點","No, a single cross-section"],"R:aipw"]]},
      many:{q:["有幾個被處理的單位？是否分批上線？","How many treated units, and was rollout staggered?"], o:[[["一個或很少（例如一個城市）","One or very few (e.g. one city)"],"R:synthetic"],[["很多，同時上線","Many, all at once"],"R:did"],[["很多，分批上線","Many, staggered rollout"],"R:staggered-did"]]},
    };
    const KEY = {abtest:["隨機分配成功（檢查 SRM）、無干擾","Randomization worked (check SRM), no interference"], "cluster-rct":["以群為單位隨機；有效樣本數接近群數","Randomize clusters; effective n ≈ number of clusters"], switchback:["時段之間的殘留效果夠小","Carry-over between time slots is small"], rdd:["門檻附近的人在其他條件上連續、無法精準操弄分數","Units near the cutoff are comparable and can't precisely manipulate the score"], iv:["排除限制：工具只透過處理影響結果；且與處理夠相關","Exclusion: the instrument affects the outcome only via treatment, and is relevant"], its:["沒有介入時，原本的趨勢會延續","Without the intervention, the pre-trend would have continued"], aipw:["所有干擾因素都已觀測（無未觀測干擾）","All confounders are observed (no unobserved confounding)"], synthetic:["事前走勢能被對照單位的加權組合貼合","Pre-period trajectory is matched by a weighted mix of donors"], did:["平行趨勢：沒有處理時兩組趨勢相同","Parallel trends: without treatment both groups trend alike"], "staggered-did":["平行趨勢＋只用尚未處理的組當對照","Parallel trends, using only not-yet-treated units as controls"]};
    let path = [], cur = "rand";
    const L = a => a[isEN() ? 1 : 0];
    const draw = () => {
      if (cur.startsWith("R:")){ const id = cur.slice(2), rec = NODES[id];
        w.innerHTML = `<h5>${ic("compass", 16)}${t("wChT")}</h5><div class="chooser"><div class="path">${path.map(p => `<span>${esc(p)}</span>`).join("")}</div>
          <div class="res"><b>${esc(rec ? rec.node.name : id)}</b><p>${esc(rec ? (rec.node.plain || "").slice(0, 160) + "…" : "")}</p><p><b style="font-size:13px">${t("wKey")}</b>${esc(L(KEY[id] || ["",""]))}</p>
          <div class="chips"><button class="btn sm primary" data-algo="${id}">${t("wOpen")}</button><button class="btn sm" data-restart>${t("wRestart")}</button></div></div></div>`;
      } else { const n = Q[cur];
        w.innerHTML = `<h5>${ic("compass", 16)}${t("wChT")}</h5><p class="wsub">${t("wChS")}</p><div class="chooser">${path.length ? `<div class="path">${path.map(p => `<span>${esc(p)}</span>`).join("")}</div>` : ""}
          <div class="q">${esc(L(n.q))}</div><div class="opts">${n.o.map((o, i) => `<button class="btn sm" data-opt="${i}">${esc(L(o[0]))}</button>`).join("")}</div>
          ${path.length ? `<p style="margin:12px 0 0"><button class="link-btn" data-restart>${t("wRestart")}</button></p>` : ""}</div>`; }
    };
    w.onclick = e => { const o = e.target.closest("[data-opt]"); if (o){ const opt = Q[cur].o[+o.dataset.opt]; path.push(L(opt[0])); cur = opt[1]; draw(); }
      if (e.target.closest("[data-restart]")){ path = []; cur = "rand"; draw(); } };
    draw();
  },
  rice(w){
    const items = [[["會員 App 個人化推播","Personalized app push"],8000,1,80,2],[["新客首購體驗優化","First-visit experience revamp"],5000,2,70,3],[["企業客戶專屬方案","Corporate client program"],600,3,50,4],[["會員分級制度","Membership tiers"],12000,1,60,5],[["離峰時段新產品","Off-peak product launch"],3000,2,50,2]];
    const impactOpts = [[.25,"0.25"],[.5,"0.5"],[1,"1"],[2,"2"],[3,"3"]];
    w.innerHTML = `<h5>${ic("kanban", 16)}${t("wRiceT")}</h5><p class="wsub">${t("wRiceS")}</p>
      <div style="overflow:auto"><table class="w-table"><thead><tr><th>${t("wItem")}</th><th>${t("wReachR")}</th><th>${t("wImpact")}</th><th>${t("wConf")}</th><th>${t("wEffort")}</th><th style="text-align:right">${t("wScore")}</th></tr></thead>
      <tbody>${items.map((it, i) => `<tr data-row="${i}"><td style="min-width:150px">${esc(it[0][isEN() ? 1 : 0])}</td><td><input type="number" data-f="r" value="${it[1]}" step="100" min="0"></td>
        <td><select data-f="i">${impactOpts.map(([v, l]) => `<option value="${v}" ${v === it[2] ? "selected" : ""}>${l}</option>`).join("")}</select></td>
        <td><input type="number" data-f="c" value="${it[3]}" step="5" min="0" max="100"></td><td><input type="number" data-f="e" value="${it[4]}" step=".5" min=".5"></td><td class="sc" data-sc></td></tr>`).join("")}</tbody></table></div>
      <div class="w-bars" data-out></div>`;
    const run = () => { const rows = $$("tr[data-row]", w).map(tr => { const g = f => parseFloat($(`[data-f="${f}"]`, tr).value) || 0;
        const s = g("e") > 0 ? g("r") * g("i") * g("c")/100 / g("e") : 0; $("[data-sc]", tr).textContent = nf().format(Math.round(s)); return [tr.cells[0].textContent, s]; });
      const mx = Math.max(1, ...rows.map(r => r[1]));
      $("[data-out]", w).innerHTML = rows.sort((a, b) => b[1] - a[1]).map(([n, s], i) => `<div class="w-bar"><span style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">#${i+1}</span><span class="tr"><i style="width:${(s/mx*100).toFixed(1)}%;${i ? "opacity:.55" : ""}"></i></span><span class="v" style="text-align:left">${esc(n)}</span></div>`).join(""); };
    w.oninput = run; w.onchange = run; run();
  },
};

/* ═════════════════════════ 模型學習 hub ═════════════════════════ */
function renderLearn(){
  $("#view-learn").innerHTML = `<div class="page-head"><div class="eyebrow">${t("learnEyebrow")}</div><h1 class="title">${t("learnTitle")}</h1><p class="lede">${t("learnLede")}</p>
    <div class="learn-stats"><span class="pill">${LEAVES_BY.ml.length} ${isEN() ? "ML algorithms" : "個 ML 演算法"}</span><span class="pill">${LEAVES_BY.stat.length} ${isEN() ? "stats & causal methods" : "個統計／因果方法"}</span><span class="pill">${isEN() ? "4-stage workflow" : "4 階段分析流程"}</span><span class="pill">${isEN() ? "中文 / English" : "中文 / English"}</span></div></div>
    ${learnTiles()}`;
}

/* ═════════════════════════ 隨機抽考 ═════════════════════════ */
function newQuestion(){
  const Q = state.quiz, pool = Q.pool === "all" ? LEAVES_BY.ml.concat(LEAVES_BY.stat) : LEAVES_BY[Q.pool];
  const ans = pool[Math.floor(Math.random() * pool.length)], rec = NODES[ans.id];
  const near = LEAVES_BY[rec.tree].filter(x => x.id !== ans.id && NODES[x.id].parents[1].id === rec.parents[1].id);
  const far = LEAVES_BY[rec.tree].filter(x => x.id !== ans.id && !near.includes(x));
  const shuffle = a => a.map(x => [Math.random(), x]).sort((p, q) => p[0] - q[0]).map(x => x[1]);
  const opts = shuffle([ans, ...shuffle(near).slice(0, 2), ...shuffle(far)].filter((x, i, a) => a.indexOf(x) === i).slice(0, 4));
  Q.cur = {id: ans.id, opts: opts.map(o => o.id)}; Q.answered = false;
}
function renderQuiz(){
  const Q = state.quiz; if (!Q.cur || !NODES[Q.cur.id]) newQuestion();
  const ans = NODES[Q.cur.id].node;
  let text = ans.plain || ans.intuition || "";
  [ans.name, shortName(ans), ans.zh].filter(s => s && s.length > 2).forEach(s => { text = text.split(s).join("＿＿"); });
  $("#quizBody").innerHTML = `<div class="card quiz-card">
    <div class="quiz-top"><div class="seg" role="group">${[["all","qAll"],["ml","qML"],["stat","qStat"]].map(([k, l]) => `<button aria-pressed="${Q.pool === k}" data-qpool="${k}">${t(l)}</button>`).join("")}</div><span class="quiz-score">${t("qScore", {a:Q.ok, b:Q.n})}</span></div>
    <div class="eyebrow" style="margin-bottom:8px">${t("qWhich")}</div>
    <div class="quiz-q">${rich(text)}</div>
    <div class="quiz-opts">${Q.cur.opts.map(id => { const n = NODES[id].node, cls = Q.answered ? (id === Q.cur.id ? " right" : (id === Q.pick ? " wrong" : "")) : "";
      return `<button class="quiz-opt${cls}" data-qopt="${id}" ${Q.answered ? "disabled" : ""}>${esc(n.name)}<small>${esc(NODES[id].parents[2].name)}</small></button>`; }).join("")}</div>
    <div class="quiz-fb">${Q.answered ? `<b style="color:${Q.pick === Q.cur.id ? "var(--good)" : "var(--warn)"}">${Q.pick === Q.cur.id ? t("qRight") : esc(t("qWrong", {n:ans.name}))}</b>
      <span class="chips"><button class="btn sm" data-algo="${ans.id}">${t("qSee")}</button><button class="btn sm primary" data-qnext>${t("qNext")}</button></span>` : ""}</div></div>`;
}
$("#quizBody").addEventListener("click", e => {
  const Q = state.quiz, o = e.target.closest("[data-qopt]");
  if (o && !Q.answered){ Q.answered = true; Q.pick = o.dataset.qopt; Q.n++; if (Q.pick === Q.cur.id) Q.ok++; renderQuiz(); return; }
  if (e.target.closest("[data-qnext]")){ newQuestion(); renderQuiz(); return; }
  const p = e.target.closest("[data-qpool]"); if (p){ Q.pool = p.dataset.qpool; newQuestion(); renderQuiz(); }
});

/* ═════════════════════════ 關於我 ═════════════════════════ */
function tlItem(e, extra=""){
  return `<div class="card tl-item"><div class="tl-top"><div><div class="tl-org">${esc(tx(e.org || e.school))}</div><div class="tl-role">${esc(tx(e.role || e.degree))}</div></div><div class="tl-per">${esc(tx(e.period))}</div></div>
    ${e.bullets ? list(tx(e.bullets)) : ""}${e.note && tx(e.note) ? `<div class="tl-note">${esc(tx(e.note))}</div>` : ""}${e.case ? `<div style="margin-top:10px"><button class="link-btn" data-case="${e.case}">${t("seeCase")}</button></div>` : ""}${extra}</div>`;
}
function renderAbout(){
  $("#view-about").innerHTML = `
    <div class="page-head"><div class="eyebrow">${t("aboutEyebrow")}</div><h1 class="title">${esc(tx(P.name))}</h1><p class="lede">${esc(tx(P.roles))} · ${esc(tx(P.location))}</p></div>
    <div class="about-grid">
      <div>
        <div class="bio">${asList(P.bio).map(p => `<p>${esc(p)}</p>`).join("")}</div>
        <div class="section-title"><h2>${t("expT")}</h2></div><div class="tl">${PROFILE.experience.map(e => tlItem(e)).join("")}</div>
        <div class="section-title"><h2>${t("projT")}</h2></div><div class="tl">${PROFILE.projects.map(e => tlItem(e)).join("")}</div>
        <div class="section-title"><h2>${t("eduT")}</h2></div><div class="tl">${PROFILE.education.map(e => tlItem(e)).join("")}</div>
      </div>
      <aside style="display:flex;flex-direction:column;gap:14px">
        <div class="id-card"><div class="id-top"><div class="id-av">${MONO}</div><div><b>${esc(tx(P.name))}</b><small>${esc(tx(P.status))}</small></div></div>
          <ul class="id-facts">${P.facts.map(f => `<li><span>${esc(tx(f.k))}</span><div>${esc(tx(f.v))}</div></li>`).join("")}</ul><div class="id-links">${contactLinks()}</div></div>
        ${PROFILE.skills.map(s => `<div class="card skill-box"><h3>${esc(tx(s.group))}</h3><div class="chips">${asList(s.items).map(i => `<span class="chip">${esc(i)}</span>`).join("")}</div></div>`).join("")}
        <div class="card skill-box"><h3>${t("certT")}</h3>${PROFILE.certs.map(c => `<div style="font-size:14.5px"><b>${esc(tx(c.name))}</b><div class="muted" style="font-size:13px">${esc(tx(c.org))} · ${esc(c.year)}</div></div>`).join("")}</div>
        <div class="card skill-box"><h3>${t("langT")}</h3><div class="chips">${PROFILE.languages.map(l => `<span class="chip">${esc(tx(l.n))} · ${esc(tx(l.l))}</span>`).join("")}</div></div>
        <button class="btn primary" data-view="resume">${ic("mail", 16)}${t("heroCta2")}</button>
      </aside>
    </div>`;
}

/* ═════════════════════════ 網頁版履歷 ═════════════════════════ */
function renderResume(){
  /* 公開網站不放完整履歷：只留「想看履歷？寫信索取」，可先選要哪個版本 */
  const tr = TRACK[state.resTrack] ? state.resTrack : "consulting";
  const role = PROFILE.roles.find(r => r.track === tr);
  const co = (typeof FOR !== "undefined" && FOR.co) ? FOR.co : "";
  const subj = t("resReqSubject").replace("{role}", role ? tx(role.name) : "") + (co ? "｜" + co : "");
  const m = P.contact.find(c => c.id === "email");
  const mail = m ? m.href + "?subject=" + encodeURIComponent(subj) : "";
  $("#view-resume").innerHTML = `
    <div class="page-head" style="margin-bottom:22px"><div class="eyebrow">${t("resEyebrow")}</div><h1 class="title">${t("resReqT")}</h1><p class="lede">${t("resReqText")}</p></div>
    <section class="ask res-req">
      <svg class="ask-blob" viewBox="0 0 600 400" aria-hidden="true"><g><circle cx="470" cy="80" r="150"/><circle cx="330" cy="-10" r="110"/><circle cx="560" cy="260" r="120"/></g></svg>
      <div class="ask-in">
        <p class="res-pick-l">${t("resReqPick")}</p>
        <div class="seg res-pick" role="group">${PROFILE.roles.map(r => `<button aria-pressed="${tr === r.track}" data-rtrack="${r.track}">${esc(tx(r.name))}</button>`).join("")}</div>
        <ul class="res-hl">${(role ? role.strengths : []).map(s => `<li>${esc(tx(s)[0])}</li>`).join("")}</ul>
        <div class="cta">${mail ? `<a class="btn on-field" href="${esc(mail)}">${ic("mail", 16)}${t("resReqMail")}</a>` : ""}${P.contact.filter(c => c.id === "linkedin" && c.href).map(c => `<a class="btn on-field ghost" href="${esc(c.href)}" target="_blank" rel="noopener noreferrer">${ic(c.id, 16)}${esc(c.label)}</a>`).join("")}</div>
      </div>
    </section>`;
  $$("[data-rtrack]").forEach(b => b.onclick = () => { state.resTrack = b.dataset.rtrack; renderResume(); setHash("resume/" + state.resTrack); });
}

/* ═════════════════════════ 頁尾 ═════════════════════════ */
function renderFooter(){
  $("#footer").innerHTML = `<div>${t("footNote")}</div><nav><button data-view="work">${t("navWork")}</button><button data-view="methods">${t("navMethods")}</button><button data-view="learn">${t("footKB")}</button><button data-view="resume">${t("footResume")}</button>${contactLinks()}<button data-top>${t("footTop")}</button></nav>`;
}

/* ═════════════════════════ 全站搜尋（⌘K） ═════════════════════════ */
let INDEX = [];
/* 另一種語言的方法名稱也放進索引：中文版可以搜英文名，英文版也可以搜中文名 */
const OTHER_NAME = {};
function buildOtherNames(){
  for (const k in OTHER_NAME) delete OTHER_NAME[k];
  const other = isEN() ? "zh" : "en";
  for (const T of [DATA.tax[other], DATA.stat[other]]) T.children.forEach(a => a.children.forEach(b => b.children.forEach(c => c.leaves.forEach(lf => { OTHER_NAME[lf.id] = lf.name + " " + (lf.zh || ""); }))));
}
function buildIndex(){
  INDEX = []; buildOtherNames();
  CASES.forEach(c => INDEX.push({type:"case", id:c.id, title:tx(c.title), sub:`${tx(c.org)} · ${tx(c.result)}`,
    t1:norm(tx(c.title)), t2:norm([tx(c.summary), (c.skills||[]).map(tx).join(" "), tx(c.org)].join(" ")), t3:norm(JSON.stringify([c.scqa, c.approach, c.findings].map(x => JSON.stringify(x))))}));
  PLAYBOOK.forEach(T => T.items.forEach(it => INDEX.push({type:"play", id:`${T.id}/${it.id}`, title:tx(it.name), sub:`${tx(T.name)} · ${tx(it.oneLiner)}`,
    t1:norm(tx(it.name) + " " + it.name.en + " " + it.name.zh), t2:norm(tx(it.oneLiner) + " " + tx(it.when).join(" ")), t3:norm(tx(it.steps).join(" ") + " " + tx(it.example) + " " + tx(it.pitfalls).join(" "))})));
  for (const key of ["ml", "stat"]) LEAVES_BY[key].forEach(lf => { const [l1,,l3] = NODES[lf.id].parents;
    INDEX.push({type: key === "ml" ? "algo" : "stat", id:lf.id, title:lf.name, sub:`${lf.zh || ""} · ${l1.name} › ${l3.name}`,
      t1:norm([lf.name, lf.id, OTHER_NAME[lf.id] || ""].join(" ")), t2:norm([lf.zh, (lf.tasks||[]).join(" "), l3.name, l3.en, lf.plain||""].join(" ")),
      t3:norm(plainTex([lf.intuition, lf.objective, (lf.pros||[]).join(" "), (lf.use||[]).join(" "), (lf.cons||[]).join(" "), (lf.hp||[]).map(h=>h.join(" ")).join(" "), (lf.assumptions||[]).join(" "), (lf.checks||[]).join(" "), lf.tools||""].join(" ")))}); });
  Object.values(NODES).filter(n => n.level < 4).forEach(({node, level, tree}) => INDEX.push({type:"node", id:node.id, title:node.name, sub:`${tree === "ml" ? "ML" : (isEN() ? "Stats" : "統計因果")} · L${level} · ${node.en || ""}`, t1:norm(node.name + " " + (node.en||"")), t2:norm(plainTex(node.def || node.signal || "")), t3:norm(plainTex((node.philosophy||"") + " " + (node.criterion||"")))}));
  WF.stages.forEach(s => INDEX.push({type:"flow", id:s.id, title:`${s.num} ${s.name}`, sub:`${t("sFlow")} · ${s.q}`, t1:norm(s.name + " " + s.en), t2:norm(s.q + " " + s.summary + " " + s.output), t3:norm((s.checklist||[]).join(" ") + " " + (s.sections||[]).map(x => x.title + " " + x.body).join(" "))}));
  (state.data?.models || []).forEach(m => INDEX.push({type:"model", id:m.id, title:m.id, sub:`${taskLabel(m)} · ❤ ${fmtN(m.likes)}`, t1:norm(m.id), t2:norm([taskLabel(m), m.pipeline_tag, m.library, (m.tags||[]).join(" ")].join(" ")), t3:""}));
}
function search(q){
  const terms = norm(q).split(/\s+/).filter(Boolean); if (!terms.length) return [];
  const matchers = terms.map(x => /^[a-z0-9]{1,3}$/.test(x) ? (s => new RegExp("(^|[^a-z0-9])" + x + "([^a-z0-9]|$)").test(s)) : (s => s.includes(x)));
  const out = [];
  for (const it of INDEX){
    let s = 0, ok = true;
    for (let i = 0; i < terms.length; i++){ const x = terms[i], has = matchers[i]; let ts = 0;
      if (it.t1.startsWith(x)) ts = 100; else if (has(it.t1)) ts = 60; else if (has(it.t2)) ts = 25; else if (has(it.t3)) ts = 8;
      if (!ts){ ok = false; break; } s += ts; }
    if (ok) out.push({it, s: s + ({case:4, play:4, algo:3, stat:3, flow:2, node:1}[it.type] || 0)});
  }
  return out.sort((a,b) => b.s - a.s).map(x => x.it);
}
function hl(text, q){
  const s = String(text ?? ""), terms = norm(q).split(/\s+/).filter(Boolean).map(x => x.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  if (!terms.length) return esc(s);
  return s.split(new RegExp("(" + terms.join("|") + ")", "ig")).map((part, i) => i % 2 ? `<mark>${esc(part)}</mark>` : esc(part)).join("");
}
const qEl = $("#q"), sRes = $("#sRes"); let sIdx = -1, sItems = [];
const S_GROUPS = () => [["case",t("sCases"),5,isEN() ? "Case" : "案例"],["play",t("sPlay"),6,isEN() ? "Play" : "方法"],["algo",t("sAlgo"),6,"ML"],["stat",t("sStat"),6,isEN() ? "Stat" : "統計"],["flow",t("sFlow"),4,isEN() ? "Flow" : "流程"],["node",t("sNode"),4,isEN() ? "Node" : "節點"],["model",t("sModel"),5,"HF"]];
function renderSearch(){
  const q = qEl.value.trim();
  if (!q){ sItems = []; sRes.innerHTML = `<div class="s-hint">${t("sHint")}<div class="chips">${t("sTry").map(x => `<button class="chip" data-try="${esc(x)}">${esc(x)}</button>`).join("")}</div></div>`; return; }
  const res = search(q); sItems = []; let html = "";
  S_GROUPS().forEach(([type, label, n, badge]) => { const g = res.filter(r => r.type === type).slice(0, n); if (!g.length) return;
    html += `<div class="s-group">${label}</div>` + g.map(it => { sItems.push(it); return `<button class="s-item" role="option" data-i="${sItems.length-1}"><span class="s-kind">${badge}</span><span style="min-width:0"><div class="s-title">${hl(it.title, q)}</div><div class="s-sub">${esc(it.sub)}</div></span></button>`; }).join(""); });
  const found = !!html;
  if (!found) html = `<div class="s-empty">${esc(t("sEmpty", {q}))}</div>`;
  sItems.push({type:"web", q});
  html += `<button class="s-item s-web" role="option" data-i="${sItems.length-1}"><span class="s-kind">G</span><span style="min-width:0"><div class="s-title">${esc(t(found ? "sGoogle" : "sGoogle2", {q}))}</div><div class="s-sub">${t("sGoogleSub")}</div></span></button>`;
  sRes.innerHTML = html; sIdx = -1;
}
function openSearch(){ $("#cmdk").classList.add("open"); qEl.placeholder = t("searchPh"); renderSearch(); setTimeout(() => qEl.focus(), 20); }
function closeSearch(){ $("#cmdk").classList.remove("open"); }
function pick(i){
  const it = sItems[i]; if (!it) return; closeSearch();
  if (it.type === "web"){ window.open("https://www.google.com/search?q=" + encodeURIComponent(it.q), "_blank", "noopener,noreferrer"); return; }
  if (it.type === "case") go("case/" + it.id);
  else if (it.type === "play") go("methods/" + it.id);
  else if (it.type === "algo" || it.type === "stat") openAlgo(it.id);
  else if (it.type === "node") goNode(it.id);
  else if (it.type === "flow") go("flow/" + it.id);
  else { state.listMode = "all"; state.group = "all"; state.showQuant = true; go("radar");
    setTimeout(() => { const c = $(`.mcard[data-id="${CSS.escape(it.id)}"]`); if (c){ c.scrollIntoView({behavior:"smooth", block:"center"}); c.classList.add("flash-card"); setTimeout(() => c.classList.remove("flash-card"), 2000); } }, 80); }
}
let debT; qEl.addEventListener("input", () => { clearTimeout(debT); debT = setTimeout(renderSearch, 50); });
qEl.addEventListener("keydown", e => {
  const items = $$(".s-item", sRes);
  if (e.key === "ArrowDown"){ e.preventDefault(); sIdx = Math.min(items.length-1, sIdx+1); }
  else if (e.key === "ArrowUp"){ e.preventDefault(); sIdx = Math.max(0, sIdx-1); }
  else if (e.key === "Enter"){ e.preventDefault(); pick(sIdx >= 0 ? sIdx : 0); return; }
  else return;
  items.forEach((el,i) => el.classList.toggle("active", i === sIdx)); items[sIdx]?.scrollIntoView({block:"nearest"});
});
sRes.addEventListener("click", e => { const b = e.target.closest(".s-item"); if (b) pick(+b.dataset.i); const tr = e.target.closest("[data-try]"); if (tr){ qEl.value = tr.dataset.try; renderSearch(); qEl.focus(); } });
$("#cmdk").addEventListener("click", e => { if (e.target.id === "cmdk") closeSearch(); });
$("#searchBtn").onclick = openSearch;

/* ═════════════════════════ 路由 ═════════════════════════ */
const VIEWS = ["home","work","case","methods","workflow","learn","radar","taxonomy","stats","method","quiz","about","resume"];
const GROUP_OF = {home:"home", work:"work", case:"work", methods:"methods", workflow:"methods", learn:"learn", radar:"learn", taxonomy:"learn", stats:"learn", method:"learn", quiz:"learn", about:"about", resume:"about"};
const VIEW_RENDER = {home:renderHome, work:renderWork, case:renderCase, methods:renderMethods, workflow:renderWorkflow, learn:renderLearn, radar:renderRadar, taxonomy:() => PYR.ml.render(), stats:() => PYR.stat.render(), method:renderMethod, quiz:renderQuiz, about:renderAbout, resume:renderResume};
function currentHash(){
  const v = state.view;
  if (v === "case") return "case/" + state.caseId;
  if (v === "methods") return "methods/" + state.track + (state.openItem ? "/" + state.openItem : "");
  if (v === "workflow") return "flow/" + state.stage;
  if (v === "resume") return "resume/" + state.resTrack;
  return v;
}
function setView(v, push=true){
  if (!VIEWS.includes(v)) v = "home";
  const prev = state.view; state.view = v;
  document.body.dataset.page = v; if (typeof toggleMenu === "function") toggleMenu(false);
  if (VIEW_RENDER[v]) VIEW_RENDER[v]();
  $$(".view").forEach(s => s.classList.toggle("active", s.id === "view-" + v));
  $$(".topnav [data-view], .mmenu [data-view]").forEach(b => b.setAttribute("aria-current", GROUP_OF[v] === b.dataset.view ? "page" : "false"));
  if (push) pushHash(currentHash());   // 換頁時新增一筆瀏覽紀錄，瀏覽器「上一頁」才回得去
  if (v === "taxonomy") requestAnimationFrame(PYR.ml.draw);
  if (v === "stats") requestAnimationFrame(PYR.stat.draw);
  if (v === "method" && (prev === "taxonomy" || prev === "stats")){ state.mtree = prev === "stats" ? "stat" : "ml"; renderMethod(); }
  document.title = (v === "home" ? "" : (document.querySelector(`#view-${v} h1`)?.textContent || "") + "｜") + (isEN() ? "Pete Zhang · Strategy × Data × PM" : "Pete Zhang｜策略 × 數據 × 專案管理");
  window.scrollTo({top:0, behavior:"auto"});
  if (v === "home") (IS_EZ ? EZ : STORY).redraw();
}
function go(h){ closeDrawer(false); applyRoute(h, true); }
function applyRoute(h, push){
  const [a, b, c] = h.split("/");
  if (a === "case" && CASE[b]){ state.caseId = b; return setView("case", push); }
  if (a === "methods"){ if (TRACK[b]) state.track = b; state.openItem = c || null; setView("methods", push);
    if (c){ const el = document.getElementById(`pb-${state.track}-${c}`); if (el){ el.open = true; setTimeout(() => { el.scrollIntoView({behavior:"smooth", block:"start"}); }, 30); } } return; }
  if (a === "flow" || a === "workflow"){ if (b) state.stage = b; return setView("workflow", push); }
  if (a === "resume"){ if (TRACK[b]) state.resTrack = b; return setView("resume", push); }
  if (a === "algo"){ const id = b; if (NODES[id] && NODES[id].level === 4){ if (!$(".view.active")) setView(TREE_VIEW[NODES[id].tree], false); openAlgo(id, false); return; } }
  if (a === "node" && NODES[b]){ setView(TREE_VIEW[NODES[b].tree], false); setHash("node/" + b); PYR[NODES[b].tree].focus(b); return; }
  setView(a || "home", push);
}
let lastRouted = null;
function route(){
  let h = ""; try { h = decodeURIComponent(location.hash.replace(/^#/, "")); } catch(e){}
  if (h === lastRouted) return; lastRouted = h;
  closeDrawer(false); applyRoute(h, false);
}
function goNode(id){ const rec = NODES[id]; if (!rec) return; closeDrawer(false); setView(TREE_VIEW[rec.tree], false); setHash("node/" + id); PYR[rec.tree].focus(id); }
window.addEventListener("hashchange", route);
window.addEventListener("popstate", route);   // 上一頁／下一頁
document.addEventListener("click", e => {
  const el = e.target;
  const v = el.closest("[data-view],[data-goto]"); if (v && !v.closest(".cmdk")){ closeDrawer(false); setView(v.dataset.view || v.dataset.goto); return; }
  const c = el.closest("[data-case]"); if (c){ go("case/" + c.dataset.case); return; }
  const a = el.closest("[data-algo]"); if (a){ openAlgo(a.dataset.algo); return; }
  const n = el.closest("[data-node]"); if (n){ goNode(n.dataset.node); return; }
  const f = el.closest("[data-flow]"); if (f){ go("flow/" + f.dataset.flow); return; }
  const pb = el.closest("[data-pb]"); if (pb){ go("methods/" + pb.dataset.pb); return; }
  const gt = el.closest("[data-goto-track]"); if (gt){ go("methods/" + gt.dataset.gotoTrack); return; }
  const rs = el.closest("[data-resume]"); if (rs){ go("resume/" + rs.dataset.resume); return; }
  const wf = el.closest("[data-wf-filter]"); if (wf){ state.workFilter = wf.dataset.wfFilter; go("work"); return; }
  if (el.closest("[data-top]")) window.scrollTo({top:0, behavior:"smooth"});
});
document.addEventListener("keydown", e => {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k"){ e.preventDefault(); $("#cmdk").classList.contains("open") ? closeSearch() : openSearch(); }
  else if (e.key === "/" && !/input|textarea|select/i.test(document.activeElement.tagName)){ e.preventDefault(); openSearch(); }
  else if (e.key === "Escape"){ if ($("#cmdk").classList.contains("open")) closeSearch(); else if ($("#drawer").classList.contains("open")) closeDrawer(); }
});

/* ═════════════════════════ 配色、深淺色、語言 ═════════════════════════ */
const ACCENTS = [
  {id:"burgundy", name:["酒紅","Burgundy"], en:"Burgundy · Rose", main:"#7A1E3A", sub:"#F7D9E2"},
  {id:"glacier",  name:["冰川藍","Glacier Blue"], en:"Glacier Blue · Mist", main:"#2E6A8E", sub:"#BFE6EE"},
  {id:"silver",   name:["銀色","Silver"], en:"Silver · Graphite", main:"#5B6570", sub:"#E6E9ED"},
  {id:"black",    name:["黑色","Black"], en:"Black · Champagne", main:"#1D1D1F", sub:"#E3CC9A"},
  {id:"purple",   name:["深紫色","Deep Purple"], en:"Deep Purple · Lavender", main:"#594F63", sub:"#E2DAEC"},
];
function applyAccent(id){
  const a = ACCENTS.find(x => x.id === id) || ACCENTS[0];
  if (a.id === "burgundy") document.documentElement.removeAttribute("data-accent"); else document.documentElement.setAttribute("data-accent", a.id);
  const sw = $("#accentSw"); sw.style.setProperty("--sw-main", a.main); sw.style.setProperty("--sw-sub", a.sub);
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", a.main);
  renderAccentPop(); requestAnimationFrame(() => { PYR.ml.draw(); PYR.stat.draw(); });
}
function renderAccentPop(){
  const cur = document.documentElement.getAttribute("data-accent") || "burgundy";
  $("#accentPop").innerHTML = `<div class="ap-h">${t("accent")}</div>` + ACCENTS.map(a => `<button class="accent-opt" role="menuitemradio" aria-checked="${a.id === cur}" data-accent="${a.id}"><span class="swatch" style="--sw-main:${a.main};--sw-sub:${a.sub}"></span><span><b>${a.name[isEN() ? 1 : 0]}</b><small>${a.en}</small></span><span class="ck">✓</span></button>`).join("");
  const mm = $("#mmAccent");   // 手機選單裡的配色（小螢幕的頁首放不下配色按鈕）
  if (mm) mm.innerHTML = ACCENTS.map(a => `<button class="mm-swb" role="radio" aria-checked="${a.id === cur}" data-accent="${a.id}" aria-label="${a.name[isEN() ? 1 : 0]}" title="${a.name[isEN() ? 1 : 0]}"><span class="swatch" style="--sw-main:${a.main};--sw-sub:${a.sub}"></span></button>`).join("");
}
const accentPop = $("#accentPop"), accentBtn = $("#accentBtn");
function toggleAccent(open){ accentPop.classList.toggle("open", open); accentBtn.setAttribute("aria-expanded", open ? "true" : "false"); }
accentBtn.onclick = e => { e.stopPropagation(); toggleAccent(!accentPop.classList.contains("open")); };
document.addEventListener("click", e => { const b = e.target.closest("#mmAccent .mm-swb"); if (!b) return; e.stopPropagation(); applyAccent(b.dataset.accent); store.set("ml.accent", b.dataset.accent); });
accentPop.onclick = e => { const b = e.target.closest(".accent-opt"); if (!b) return; applyAccent(b.dataset.accent); store.set("ml.accent", b.dataset.accent); toggleAccent(false); accentBtn.focus(); };
document.addEventListener("click", e => { if (!e.target.closest(".accent-wrap")) toggleAccent(false); });
function applyTheme(x){ if (x) document.documentElement.setAttribute("data-theme", x); else document.documentElement.removeAttribute("data-theme"); }
$("#themeBtn").onclick = () => {
  const cur = document.documentElement.getAttribute("data-theme") || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  const nx = cur === "dark" ? "light" : "dark"; applyTheme(nx); store.set("ml.theme", nx);
};
function applyStatic(){
  document.documentElement.lang = isEN() ? "en" : "zh-Hant";
  $$("[data-i18n]").forEach(el => { el.textContent = t(el.dataset.i18n); });
  $("#langOn").textContent = isEN() ? "EN" : "中"; $("#langOff").textContent = isEN() ? "中" : "EN";
  $("#langBtn").title = t("langTo"); $("#langBtn").setAttribute("aria-label", "中 EN · " + t("langTo")); $("#searchBtn") && $("#searchBtn").setAttribute("aria-label", isEN() ? "Search" : "搜尋");
  $("#themeBtn").title = t("theme"); $("#themeBtn").setAttribute("aria-label", t("theme"));
  $("#accentBtn").title = t("accent"); $("#accentBtn").setAttribute("aria-label", t("accent"));
  $("#dClose").setAttribute("aria-label", t("close"));
  qEl.placeholder = t("searchPh");
}
function renderAll(){
  applyStatic(); renderAccentPop(); renderTreeHeads(); renderFooter();
  ["home","work","methods","learn","about","resume"].forEach(v => VIEW_RENDER[v]());
  renderCase(); renderWorkflow(); PYR.ml.render(); PYR.stat.render(); renderMethod(); renderRadar(); renderQuiz();
  buildIndex();
}
function setLang(l){
  if (l === LANG) return;
  LANG = l; store.set("ml.lang", l); indexTrees(); TEX_CACHE.clear();
  const reopen = drawerAlgo, y = scrollY;
  renderAll();
  $$(".view").forEach(s => s.classList.toggle("active", s.id === "view-" + state.view));
  if (state.view === "methods" && state.openItem){ const el = document.getElementById(`pb-${state.track}-${state.openItem}`); if (el) el.open = true; }
  if (reopen) openAlgo(reopen, false);
  requestAnimationFrame(() => { window.scrollTo(0, y); PYR.ml.draw(); PYR.stat.draw(); });
  document.title = isEN() ? "Pete Zhang · Strategy × Data × PM" : "Pete Zhang｜策略 × 數據 × 專案管理";
  toast(t("toastLang"));
}
$("#langBtn").onclick = () => setLang(isEN() ? "zh" : "en");

