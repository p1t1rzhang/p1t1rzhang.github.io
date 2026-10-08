/* ═════════════════════════ 首頁：散開的圓（捲動敘事） ═════════════════════════
   一顆圓在捲動時拆成許多點、逐步散開，五個段落依序揭露：
   0 標語 → 1 名字 → 2 三種角色 → 3 數字 → 4 現在＋聯絡。
   點的位置在幾組「版面」之間插值（圓 → 環 → 三群 → 帶狀 → 散落）。 */
Object.assign(UI.zh, {
  chainA:"策略", chainB:"數據", chainC:"交付", storyPlace:"台北・個人網站",
  scrollCue:"往下滑", hi:"嗨，我是",
  rolesLead:"三個角色，三種相輔相成的能力", nowT:"現在", nowCta1:"看作品", nowCta2:"聯絡我",
  workT:"作品", workHint:"每個案例只公開摘要；完整拆解可以來信索取。", allWork:"全部案例",
  waysT:"做事的方法", waysHint:"依職能拆成三條線，每條都有可直接套用的步驟與範本。",
  kbT:"知識庫", kbText:"我把學過、用過的方法整理成一個會自己更新的知識庫：{ml} 個機器學習演算法、{st} 個統計與因果推論方法，每個都先講白話直覺，數學放在最後；另外每天挑選 Hugging Face 上值得一看的新模型。",
  askT:"想看完整的案例與履歷？", askText:"議題樹、分析細節、數據與成果的完整拆解，以及完整履歷不在網站上公開。來信或在 LinkedIn 留言，我會直接寄給你。",
  askMail:"來信索取", askSubject:"索取完整案例與履歷",
  faqT:"常見問題",
  lockT:"這裡是精簡版", lockText:"網站上放的是這個案例的簡單範例。完整的分析過程與成果，歡迎來信，我很樂意詳細說明。", lockLead:"完整版還包括：", lockBtn:"來信聊聊",
  lockItems:["議題樹與假設", "分析步驟與方法細節", "關鍵發現與建議", "成果數據與反思"],
  resLocked:"需要 PDF 版履歷或推薦人資訊，歡迎來信索取。",
  menu:"選單",
  workLede:"每個案例公開情境、問題與成果的摘要；議題樹、分析細節與數據等完整拆解，可來信索取。",
});
Object.assign(UI.en, {
  chainA:"strategy", chainB:"data", chainC:"delivery", storyPlace:"Taipei · personal site",
  scrollCue:"Scroll", hi:"Hi, I'm",
  rolesLead:"Three roles, three complementary strengths", nowT:"Now", nowCta1:"See my work", nowCta2:"Get in touch",
  workT:"Work", workHint:"Each case shows a summary only; full write-ups are available on request.", allWork:"All case studies",
  waysT:"How I work", waysHint:"Three playbooks, one per role, with steps and templates you can reuse.",
  kbT:"Knowledge base", kbText:"Everything I've learned and used, organized into a self-updating knowledge base: {ml} machine-learning algorithms and {st} statistics and causal-inference methods, each explained in plain language before the math, plus a daily pick of noteworthy new models on Hugging Face.",
  askT:"Want the full cases and résumé?", askText:"Issue trees, analysis details, figures and results — and my full résumé — are not published here. Email me or message me on LinkedIn and I'll send them over.",
  askMail:"Email me", askSubject:"Request: full case studies and résumé",
  faqT:"FAQ",
  lockT:"This is the short version", lockText:"What you see here is a brief example. For the full analysis and results, email me — I'm happy to walk you through it.", lockLead:"The full version also covers:", lockBtn:"Get in touch",
  lockItems:["Issue tree and hypotheses", "Analysis steps and methods", "Key findings and recommendations", "Results and reflections"],
  resLocked:"Need a PDF copy or references? Email me.",
  menu:"Menu",
  workLede:"Each case shows the situation, the question and the outcome. The full write-up — issue tree, analysis details and figures — is available on request.",
});

const FAQ = () => isEN() ? [
  ["Who is Fang-I (Pete) Zhang?", "Pete is a Taipei-based MS student in Agricultural Economics at National Taiwan University, focusing on applied econometrics and causal inference, and a Digital & Data intern at BNP Paribas Cardif TCB Life. He works across strategy consulting, data analytics and project management."],
  ["What roles is Pete looking for?", "Strategy consulting, data analyst / data scientist and project or product management roles — internships now and full-time from 2027."],
  ["What has Pete worked on?", "Customer segmentation and opportunity sizing for a life insurer, an RFM lifecycle strategy for a hot-pot chain (3rd place, as team lead of 8), a credit-card growth strategy (2nd place), a Gen Z fintech business plan, B2B outreach for a consulting firm, and this bilingual data-science knowledge base."],
  ["Which tools and methods does Pete use?", "SQL, Python (pandas, scikit-learn, XGBoost), R, Stata, Excel and Tableau; issue trees and MECE, market sizing, breakeven and scenario analysis, RFM segmentation, hypothesis testing, A/B tests and causal inference (DiD, event study)."],
  ["How can I contact Pete?", "By email or LinkedIn — both are linked on this page. Full case write-ups and the complete résumé are shared on request."],
] : [
  ["張方燡 Pete 是誰？", "Pete 是臺大農業經濟學研究所碩士生，研究應用計量與因果推論，目前在合庫人壽數位與數據部實習，工作橫跨策略顧問、數據分析與專案管理。"],
  ["Pete 在找什麼樣的機會？", "策略顧問、數據分析師／資料科學、專案或產品管理相關職缺；現在可實習，2027 年起可全職。"],
  ["Pete 做過哪些專案？", "壽險客群分群與商機估算、連鎖火鍋品牌的 RFM 會員生命週期策略（擔任 8 人組長，第 3 名）、新信用卡成長策略（第 2 名）、Z 世代金融科技企劃、顧問公司的 B2B 開發，以及這個中英雙語資料科學知識庫。"],
  ["Pete 會用哪些工具與方法？", "SQL、Python（pandas、scikit-learn、XGBoost）、R、Stata、Excel、Tableau；議題樹與 MECE、市場規模估算、損益兩平與情境分析、RFM 分群、假說檢定、A/B 測試與因果推論（DiD、事件研究）。"],
  ["怎麼聯絡 Pete？", "透過 Email 或 LinkedIn，連結都在這一頁。完整案例拆解與完整履歷可來信索取。"],
];

const mailHref = () => { const m = P.contact.find(c => c.id === "email"); return m ? m.href + "?subject=" + encodeURIComponent(t("askSubject")) : null; };
const KNOT = `<svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="15" cy="15" r="5.2"/><circle cx="25.5" cy="19" r="4.2"/><circle cx="17" cy="26.5" r="4.6"/></svg>`;

function HOME_AFTER(){ return `<div class="after">
    <section class="hsec" aria-labelledby="hWork">
      <div class="hsec-head"><h2 id="hWork">${t("workT")}</h2><p>${t("workHint")}</p></div>
      <ol class="worklist">${CASES.map(c => `<li><button class="wrow" data-case="${c.id}">
        <span class="wy">${esc(String(c.period).slice(0, 4))}</span>
        <span class="wt"><b>${esc(tx(c.title))}</b><small>${esc(tx(c.org))}</small></span>
        <span class="wr">${esc(tx(c.result))}</span>
        <span class="wa" aria-hidden="true"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17 17 7M9 7h8v8"/></svg></span></button></li>`).join("")}</ol>
    </section>

    <section class="hsec" aria-labelledby="hWays">
      <div class="hsec-head"><h2 id="hWays">${t("waysT")}</h2><p>${t("waysHint")}</p></div>
      <div class="ways">${PLAYBOOK.map(T => `<button class="way" data-goto-track="${T.id}"><span class="way-pill">${esc(tx(T.name))}</span><span class="way-role">${esc(tx(T.role))}</span><span class="way-tag">${esc(tx(T.tagline))}</span></button>`).join("")}</div>
    </section>

    <section class="hsec kb" aria-labelledby="hKb">
      <div class="hsec-head"><h2 id="hKb">${t("kbT")}</h2></div>
      <p class="kb-text">${esc(t("kbText", {ml: LEAVES_BY.ml.length, st: LEAVES_BY.stat.length}))}</p>
      <div class="kb-links">${[["radar","tRadar"],["taxonomy","tML"],["stats","tStat"],["workflow","tFlow"],["quiz","tQuiz"]].map(([v, k]) => `<button class="kb-pill" data-view="${v}">${esc(t(k))}</button>`).join("")}</div>
    </section>

    <section class="hsec faq-sec" aria-labelledby="hFaq">
      <div class="hsec-head"><h2 id="hFaq">${t("faqT")}</h2></div>
      <div class="faqs">${FAQ().map(([q, a], i) => `<details${i === 0 ? " open" : ""}><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join("")}</div>
    </section>

    <section class="ask" id="contact" aria-labelledby="hAsk">
      <svg class="ask-blob" viewBox="0 0 600 400" aria-hidden="true"><g filter="url(#goo2)"><circle cx="470" cy="80" r="150"/><circle cx="330" cy="-10" r="110"/><circle cx="560" cy="260" r="120"/></g>
        <defs><filter id="goo2"><feGaussianBlur in="SourceGraphic" stdDeviation="22" result="b"/><feColorMatrix in="b" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 30 -12"/></filter></defs></svg>
      <div class="ask-in"><h2 id="hAsk">${t("askT")}</h2><p>${t("askText")}</p>
        <div class="cta">${mailHref() ? `<a class="btn on-field" href="${esc(mailHref())}">${ic("mail", 16)}${t("askMail")}</a>` : ""}${P.contact.filter(c => c.id !== "email" && c.href).map(c => `<a class="btn on-field ghost" href="${esc(c.href)}" target="_blank" rel="noopener noreferrer">${ic(c.id, 16)}${esc(c.label)}</a>`).join("")}</div></div>
    </section>
  </div>`; }
function renderHome(){
  if (IS_EZ) return renderHomeEz();
  const roles = PROFILE.roles;
  $("#view-home").innerHTML = `
  <div class="story" id="story">
    <div class="stage" id="stage">
      <svg class="blobs" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <defs><filter id="goo" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur in="SourceGraphic" stdDeviation="38" result="b"/><feColorMatrix in="b" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 36 -16"/></filter></defs>
        <g filter="url(#goo)" id="blobG">${BLOBS.map((b, i) => `<circle data-i="${i}" cx="${b[0]}" cy="${b[1]}" r="${b[2]}"/>`).join("")}</g>
      </svg>
      <canvas class="dots" id="dots" aria-hidden="true"></canvas>
      <div class="frame" aria-hidden="true"></div>

      <div class="ch ch0" data-ch="0">
        <svg class="sig sig-hero write" viewBox="0 0 1676 916" aria-hidden="true"><path pathLength="1" style="--i:0" d="M108,612C121,602 171,565 188,554C205,543 206,548 209,547"/><path pathLength="1" style="--i:1" d="M46,868C60,849 107,791 132,756C156,721 181,695 194,659C208,623 209,566 213,541C218,516 222,515 223,507C224,499 219,500 219,492C219,484 220,469 221,461C223,453 225,447 227,443C230,439 233,436 236,435C239,433 244,433 248,434C252,435 256,437 258,440C261,443 262,449 262,453C263,457 263,460 261,467C258,474 252,487 247,493C242,498 234,494 229,502C224,509 218,529 215,538C212,546 212,544 211,552C210,560 211,574 209,587C206,600 199,620 197,630C195,640 195,644 196,648C197,652 197,653 203,652C209,650 217,648 229,639C241,630 250,618 275,599C300,579 340,547 376,522C412,498 457,469 489,450C521,431 517,432 567,407C617,381 730,325 787,299C844,272 882,256 907,247C932,237 925,249 936,242C947,235 961,212 970,206C979,201 983,209 990,208C997,208 992,211 1014,204C1036,197 1079,180 1125,165C1171,151 1235,132 1289,117C1343,103 1396,90 1449,77C1502,65 1578,50 1604,44"/><path pathLength="1" style="--i:2" d="M320,831C325,825 343,805 352,797C361,790 371,792 376,787C382,783 380,776 384,769C388,762 391,757 400,746C410,735 444,693 441,701C438,709 389,776 380,794C371,812 383,805 388,808C393,810 402,811 412,808C422,804 435,796 448,788C461,779 463,780 489,756C515,732 554,695 602,643C650,591 733,498 779,446C824,394 856,351 875,330C894,309 885,330 894,319C903,308 918,285 930,265C942,245 961,210 967,198C973,186 965,196 965,192C965,188 965,184 967,177C969,170 971,162 978,149C984,136 999,111 1006,100C1014,89 1018,87 1023,84C1028,81 1031,81 1034,81C1037,81 1039,81 1040,85C1041,90 1043,99 1039,109C1036,119 1029,131 1020,145C1012,159 1002,176 988,193C973,210 943,236 932,250C921,264 927,268 922,278C917,288 906,302 902,313C899,324 904,328 900,346C897,364 885,399 881,422C877,445 876,460 875,483C874,506 874,541 877,562C881,583 890,598 895,608C901,618 906,620 911,624C916,628 919,630 927,631C935,633 944,636 959,633C974,630 995,622 1014,613C1033,604 1056,587 1072,576C1088,565 1089,565 1109,548C1129,531 1176,488 1192,475C1208,462 1202,471 1205,470C1208,470 1209,467 1211,472C1213,477 1216,501 1216,499C1216,497 1210,476 1212,463C1214,450 1224,428 1227,420C1230,412 1227,417 1232,414C1237,412 1247,412 1255,404C1262,396 1275,374 1279,366C1284,358 1282,357 1282,354C1282,351 1281,349 1279,348C1278,346 1276,345 1273,345C1270,345 1264,344 1259,347C1254,351 1248,355 1243,363C1238,371 1232,370 1229,393C1226,416 1223,485 1225,501C1227,518 1230,504 1240,492C1250,480 1268,448 1284,429C1300,410 1325,388 1337,376C1349,364 1346,368 1358,360C1370,351 1392,336 1409,326C1426,316 1449,305 1463,299C1477,292 1482,289 1492,287C1502,284 1515,282 1520,281"/><path pathLength="1" style="--i:3" d="M1433,424C1436,422 1433,419 1451,411C1469,402 1523,379 1543,371C1563,363 1565,366 1571,365C1577,364 1576,363 1576,367C1576,371 1576,379 1571,389C1565,399 1550,420 1544,428C1537,436 1535,432 1532,438C1529,443 1534,442 1526,460C1518,478 1494,525 1485,547C1477,569 1476,581 1473,591C1471,601 1472,601 1473,606C1474,611 1477,619 1480,623C1482,627 1483,628 1486,629C1489,631 1492,632 1499,633C1506,634 1516,635 1526,633C1536,630 1551,623 1562,617C1573,611 1584,602 1593,595C1602,588 1608,582 1614,575C1620,568 1625,560 1628,555C1631,550 1630,547 1631,545"/></svg>
        <p class="chain" aria-label="${esc(t("chainA") + " · " + t("chainB") + " · " + t("chainC"))}">
          <span class="cpill">${t("chainA")}</span><span class="knot" id="knot">${KNOT}</span><span class="cpill">${t("chainB")}</span><span class="joint" aria-hidden="true"></span><span class="cpill">${t("chainC")}</span>
        </p>
        <p class="place">${t("storyPlace")}</p>
      </div>
      <div class="ch ch1" data-ch="1">
        <p class="hi">${t("hi")}</p>
        <h1 class="name">${esc(tx(P.name))}</h1>
        <p class="headline">${esc(tx(P.headline))}</p>
      </div>
      <div class="ch ch2" data-ch="2">
        <p class="lead">${t("rolesLead")}</p>
        <div class="role3">${roles.map(r => `<button class="r3" data-goto-track="${r.track}"><b>${esc(tx(r.name))}</b><span>${esc(tx(r.strengths[0])[0])}・${esc(tx(r.strengths[1])[0])}</span></button>`).join("")}</div>
      </div>
      <div class="ch ch3" data-ch="3">
        <div class="nums">${P.proof.slice(0, 4).map(p => `<div><b>${esc(tx(p.v))}</b><span>${esc(tx(p.k))}</span></div>`).join("")}</div>
      </div>
      <div class="ch ch4" data-ch="4">
        <p class="lead">${t("nowT")}</p>
        <ul class="now">${P.facts.slice(0, 3).map(f => `<li><span>${esc(tx(f.k))}</span>${esc(tx(f.v))}</li>`).join("")}</ul>
        <p class="nstatus">${esc(tx(P.status))}</p>
        <div class="cta"><button class="btn on-field" data-view="work">${t("nowCta1")}</button><a class="btn on-field ghost" href="#contact" data-scroll="contact">${t("nowCta2")}</a></div>
      </div>

      <button class="cue" id="cue" aria-label="${t("scrollCue")}"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M6 13l6 6 6-6"/></svg></button>
      <ol class="prog" aria-hidden="true">${[0,1,2,3,4].map(i => `<li data-p="${i}"></li>`).join("")}</ol>
    </div>
  </div>

  ${HOME_AFTER()}`;
  STORY.mount();
}
$("#view-home").addEventListener("click", e => {
  const s = e.target.closest("[data-scroll]"); if (s){ e.preventDefault(); document.getElementById(s.dataset.scroll)?.scrollIntoView({behavior:"smooth"}); return; }
  if (e.target.closest("#cue")){ const st = $("#story"); window.scrollTo({top: st.offsetTop + innerHeight * 0.95, behavior:"smooth"}); }
});

/* 背景流體色塊：用 goo 濾鏡把幾顆圓融成一片（[cx, cy, r, 捲動時的位移 dx, dy]） */
const BLOBS = [
  [430, 660, 360, -260, 140], [720, 450, 250, 0, 0, 1.6], [1060, 610, 290, 260, 120],
  [520, 300, 180, -200, -120], [880, 230, 120, 120, -180], [300, 900, 200, -160, 160], [1240, 900, 160, 220, 120],
];

const STORY = (() => {
  let cv, ctx, W = 0, H = 0, DPR = 1, pts = [], raf = 0, last = -1, mounted = false, layouts = null;
  const reduce = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ease = x => x < .5 ? 4*x*x*x : 1 - Math.pow(-2*x + 2, 3) / 2;
  const clamp = (x, a=0, b=1) => Math.max(a, Math.min(b, x));
  // 可重現的亂數
  function rng(seed){ let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
  const GA = Math.PI * (3 - Math.sqrt(5));

  function build(){
    const n = W < 640 ? 120 : 190, R = rng(7), m = Math.min(W, H), cx = W/2, cy = H/2, mob = W < 640;
    pts = Array.from({length:n}, (_, i) => ({ s: 1.2 + R() * (mob ? 3.2 : 4.4), tone: R() < .22 ? 1 : 0, d: R() * .08 }));
    const knot = pts.map((_, i) => { const r = Math.sqrt((i + .5) / n) * 20, a = i * GA; return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; });
    const ring = pts.map((_, i) => { const a = i / n * Math.PI * 2 + R() * .05, rr = m * (mob ? .44 : .38) * (1 + (R() - .5) * .16); return [cx + rr * Math.cos(a) * (mob ? .9 : 1.25), cy + rr * Math.sin(a) * (mob ? 1.15 : .92)]; });
    // 叢集位置直接量測文字的位置：點聚在每個角色名稱、每個數字的正上方
    const sr = $("#stage").getBoundingClientRect();
    const above = (sel, gap) => $$(sel).map(el => { const r = el.getBoundingClientRect(); return [r.left - sr.left + r.width / 2, r.top - sr.top - gap]; });
    const cR = mob ? m * .085 : m * .1;
    const centers = above("#stage .r3 b", cR + 18);
    const tri = pts.map((_, i) => { const c = centers[i % centers.length] || [cx, cy], k = Math.floor(i / centers.length), r = Math.sqrt((k + .5) / (n / centers.length)) * cR, a = k * GA; return [c[0] + r * Math.cos(a), c[1] + r * Math.sin(a)]; });
    const nc = above("#stage .nums b", (mob ? m * .07 : m * .06) + 14), nR = mob ? m * .07 : m * .06;
    const band = pts.map((_, i) => { const c = nc[i % nc.length] || [cx, cy], k = Math.floor(i / nc.length), r = Math.sqrt((k + .5) / (n / nc.length)) * nR, a = k * GA; return [c[0] + r * Math.cos(a), c[1] + r * Math.sin(a)]; });
    const scatter = pts.map(() => [R() * W, R() * H]);
    layouts = {knot, ring, tri, band, scatter};
  }
  // 關鍵影格：p 值 → 版面
  const KEYS = [[0, "knot"], [.1, "knot"], [.2, "ring"], [.3, "ring"], [.4, "tri"], [.5, "tri"], [.6, "band"], [.7, "band"], [.82, "scatter"], [1, "scatter"]];
  function posAt(i, p){
    p = clamp(p - pts[i].d * (p > .1 ? 1 : 0) + .04 * (p > .1 ? 1 : 0));
    let k = 0; while (k < KEYS.length - 2 && p > KEYS[k+1][0]) k++;
    const [p0, a] = KEYS[k], [p1, b] = KEYS[k+1], f = p1 > p0 ? ease(clamp((p - p0) / (p1 - p0))) : 0;
    const A = layouts[a][i], B = layouts[b][i];
    return [A[0] + (B[0] - A[0]) * f, A[1] + (B[1] - A[1]) * f];
  }
  function progress(){
    const st = $("#story"); if (!st) return 0;
    const r = st.getBoundingClientRect(), span = st.offsetHeight - innerHeight;
    return span > 0 ? clamp(-r.top / span) : 0;
  }
  // 段落 i 的可見區間
  const WIN = [[-1, .1], [.13, .3], [.34, .52], [.56, .72], [.78, 2]];
  function chapterOpacity(i, p){ const [a, b] = WIN[i], f = .045; return clamp(Math.min((p - a) / f + (i === 0 ? 9 : 0), (b - p) / f)); }

  function frame(){
    raf = 0;
    const p = reduce() ? .9 : progress();
    document.body.classList.toggle("past-story", reduce() || p >= .995);
    if (Math.abs(p - last) < .0004 && last >= 0) return;
    last = p;
    const css = getComputedStyle(document.documentElement);
    const light = css.getPropertyValue("--on-deep").trim() || "#fff", accent = css.getPropertyValue("--brand").trim() || "#e5323f";
    ctx.clearRect(0, 0, W, H);
    const show = clamp((p - .07) / .05);
    if (show > 0){
      for (let i = 0; i < pts.length; i++){
        const [x, y] = posAt(i, p), q = pts[i];
        ctx.globalAlpha = show * (p > .74 ? 1 - .45 * clamp((p - .74) / .12) : 1) * (q.tone ? .95 : .78);
        ctx.fillStyle = q.tone ? accent : light;
        ctx.beginPath(); ctx.arc(x, y, q.s * (1 + .25 * Math.sin(i + p * 9)), 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
    // 中央的圓：先放大，接著被點取代
    const knot = $("#knot");
    if (knot){ const g = clamp(p / .1); knot.style.transform = `scale(${1 + g * .5})`; knot.style.opacity = String(1 - clamp((p - .08) / .05)); }
    $$("#stage .ch").forEach((el, i) => { const o = chapterOpacity(i, p); el.style.opacity = o.toFixed(3); el.style.transform = `translateY(${((1 - o) * (i === 0 ? -14 : 14)).toFixed(1)}px)`; el.style.visibility = o < .02 ? "hidden" : "visible"; });
    $$("#stage .prog li").forEach((li, i) => li.classList.toggle("on", chapterOpacity(i, p) > .5));
    const cue = $("#cue"); if (cue) cue.style.opacity = String(1 - clamp(p / .06));
    // 色塊隨捲動慢慢散開
    $$("#blobG circle").forEach(c => { const b = BLOBS[+c.dataset.i], e = ease(p); c.setAttribute("cx", (b[0] + b[3] * e).toFixed(1)); c.setAttribute("cy", (b[1] + b[4] * e).toFixed(1)); c.setAttribute("r", (b[2] * (b[5] ? 1 + (b[5] - 1) * e : 1 - .18 * e)).toFixed(1)); });
  }
  const tick = () => { if (!raf) raf = requestAnimationFrame(frame); };
  function resize(){
    if (!cv) return;
    DPR = Math.min(2, devicePixelRatio || 1); W = cv.clientWidth; H = cv.clientHeight;
    cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR); ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    build(); last = -1; tick();
  }
  function mount(){
    cv = $("#dots"); if (!cv) return; ctx = cv.getContext("2d");
    document.documentElement.classList.toggle("rm", reduce());
    if (!mounted){ mounted = true; addEventListener("scroll", tick, {passive:true}); addEventListener("resize", () => resize()); }
    requestAnimationFrame(resize);
  }
  return { mount, tick, redraw(){ last = -1; tick(); } };
})();

/* ═════════════════════════ 手機選單 ═════════════════════════ */
function toggleMenu(open){
  const m = $("#mmenu"); if (!m) return;
  m.classList.toggle("open", open); $("#menuBtn").setAttribute("aria-expanded", open ? "true" : "false");
  document.body.style.overflow = open ? "hidden" : "";
}
$("#menuBtn").onclick = () => toggleMenu(!$("#mmenu").classList.contains("open"));
$("#mmenu").addEventListener("click", e => { if (e.target.closest("[data-view]") || e.target.closest(".mm-close")) toggleMenu(false); });
