/* ═════════════════════════ 雷達：資料 ═════════════════════════ */
const TASK_EN = {"text-generation":"Text generation","text2text-generation":"Text-to-text","text-classification":"Text classification","token-classification":"Token classification / NER","question-answering":"Question answering","summarization":"Summarization","translation":"Translation","fill-mask":"Fill-mask","zero-shot-classification":"Zero-shot text classification","sentence-similarity":"Sentence similarity / embeddings","feature-extraction":"Feature extraction / embeddings","text-ranking":"Text reranking","table-question-answering":"Table QA","image-text-to-text":"Vision-language (VLM)","video-text-to-text":"Video understanding","any-to-any":"Any-to-any","visual-question-answering":"Visual QA","document-question-answering":"Document QA","image-to-text":"Image captioning","zero-shot-image-classification":"Zero-shot image classification","zero-shot-object-detection":"Zero-shot object detection","visual-document-retrieval":"Visual document retrieval","image-classification":"Image classification","object-detection":"Object detection","image-segmentation":"Image segmentation","depth-estimation":"Depth estimation","image-feature-extraction":"Image feature extraction","video-classification":"Video classification","keypoint-detection":"Keypoint detection","mask-generation":"Mask generation","text-to-image":"Text-to-image","image-to-image":"Image-to-image / editing","unconditional-image-generation":"Unconditional image generation","text-to-video":"Text-to-video","image-to-video":"Image-to-video","image-text-to-video":"Image+text-to-video","video-to-video":"Video-to-video","text-to-3d":"Text-to-3D","image-to-3d":"Image-to-3D","text-to-speech":"Text-to-speech (TTS)","text-to-audio":"Text-to-audio / music","automatic-speech-recognition":"Speech recognition (ASR)","audio-to-audio":"Audio-to-audio","audio-classification":"Audio classification","voice-activity-detection":"Voice activity detection","reinforcement-learning":"Reinforcement learning","robotics":"Robotics","tabular-classification":"Tabular classification","tabular-regression":"Tabular regression","time-series-forecasting":"Time-series forecasting","graph-ml":"Graph ML"};
const GROUP_EN = {language:"Language", multimodal:"Multimodal", vision:"Vision", genmedia:"Image / video generation", audio:"Speech / audio", decision:"Decision / science", other:"Other"};
const DERIV_EN = {original:"Original", finetune:"Fine-tune", derived:"Derivative", merge:"Merge", adapter:"LoRA / Adapter", quantized:"Quantized / converted"};
const taskLabel = m => isEN() ? (TASK_EN[m.pipeline_tag] || (m.pipeline_tag ? m.pipeline_tag.replace(/-/g, " ") : t("untagged"))) : (m.task_zh || t("untagged"));
const groupLabel = (k, zh) => isEN() ? (GROUP_EN[k] || k) : (zh || k);
const derivLabel = m => isEN() ? (DERIV_EN[m.derivative] || m.derivative) : m.derivative_zh;
/* 英文版的「入選理由」依模型欄位重新產生（中文版沿用 fetch_hf.py 的文字） */
function reasonsOf(m){
  if (!isEN()) return m.reasons || [];
  const models = (state.data && state.data.models) || [];
  const pool = models.filter(x => x.derivative !== "quantized"); const P = pool.length ? pool : models;
  const share = P.filter(x => (x.pipeline_tag || "u") === (m.pipeline_tag || "u")).length / Math.max(1, P.length);
  const vs = models.map(x => x.like_velocity || 0).sort((a,b) => a-b), p80 = vs.length ? vs[Math.floor(.8*(vs.length-1))] : 0;
  const r = [], age = m.age_days, g = x => String(+x);
  if (m.is_new_entry) r.push([0, "🆕 New on today's list"]); else if ((m.rank_change || 0) >= 5) r.push([1, `📈 Up ${m.rank_change} places`]);
  if (age != null && age <= 7) r.push([1, `⏱️ Released ${age < 1 ? Math.max(1, Math.round(age*24)) + " h" : Math.round(age) + " days"} ago`]);
  if (m.like_velocity >= p80 && m.like_velocity >= 10) r.push([2, `🔥 +${Math.round(m.like_velocity).toLocaleString("en-US")} likes per day`]);
  if (m.pipeline_tag && share <= .08) r.push([2, `🧭 Rare task on today's list: ${taskLabel(m)}`]);
  if (m.is_moe) r.push([3, `🧩 Mixture-of-experts${m.active_params_b ? ` (${g(m.active_params_b)}B active)` : ""}`]);
  if (m.params_b){ if (m.params_b <= 4) r.push([3, `🪶 Only ${g(m.params_b)}B parameters — laptop / on-device friendly`]); else if (m.params_b >= 100) r.push([4, `🏔️ ${g(m.params_b)}B-parameter model`]); }
  if (m.on_device && !(m.params_b && m.params_b <= 4)) r.push([3, "📱 Built for on-device inference"]);
  if ((m.arxiv || []).length) r.push([3, `📄 Paper: arXiv:${m.arxiv[0]}`]);
  if (m.n_languages >= 10) r.push([4, `🌏 ${m.n_languages} languages`]);
  if (m.permissive_license) r.push([5, `✅ Permissive license (${m.license})`]);
  if (m.derivative !== "original" && m.base_model){
    const verb = {finetune:"Fine-tuned from", adapter:"LoRA on", merge:"Merged from", quantized:"Quantized from", derived:"Derived from"}[m.derivative] || "Derived from";
    r.push([6, `🔗 ${verb} ${m.base_model}`]); }
  if (m.safety_removed) r.push([6, "⚠️ Safety alignment removed (abliterated / uncensored)"]);
  return r.map((x, i) => [x[0], i, x[1]]).sort((a, b) => a[0] - b[0] || a[1] - b[1]).slice(0, 5).map(x => x[2]);
}
const TASK2ALGO = {
  "text-generation":["gpt","transformer"], "text2text-generation":["transformer"], "image-text-to-text":["gpt","vit","clip"],
  "video-text-to-text":["gpt","vit"], "any-to-any":["gpt","dit"], "visual-question-answering":["gpt","vit"],
  "document-question-answering":["gpt","vit"], "image-to-text":["gpt","vit"],
  "text-classification":["bert"], "token-classification":["bert","crf"], "question-answering":["bert"], "fill-mask":["bert"],
  "zero-shot-classification":["bert"], "summarization":["transformer"], "translation":["transformer"],
  "feature-extraction":["simclr","bert"], "sentence-similarity":["simclr","bert"], "text-ranking":["bert"],
  "zero-shot-image-classification":["clip"], "zero-shot-object-detection":["clip","yolo"], "visual-document-retrieval":["clip"],
  "image-classification":["vit","resnet"], "object-detection":["yolo"], "image-segmentation":["unet"], "mask-generation":["unet","vit"],
  "depth-estimation":["dinov2"], "image-feature-extraction":["dinov2","mae"], "keypoint-detection":["resnet"], "video-classification":["vit"],
  "text-to-image":["ldm","dit","flowmatching"], "image-to-image":["ldm"], "unconditional-image-generation":["ddpm","gan"],
  "text-to-video":["dit","flowmatching"], "image-to-video":["dit","flowmatching"], "image-text-to-video":["dit","flowmatching"],
  "video-to-video":["dit"], "text-to-3d":["dit"], "image-to-3d":["dit"],
  "text-to-speech":["gpt","flowmatching"], "text-to-audio":["gpt","vqvae","ldm"], "automatic-speech-recognition":["transformer"],
  "audio-to-audio":["transformer"], "audio-classification":["transformer"], "voice-activity-detection":["transformer"],
  "reinforcement-learning":["ppo","dqn"], "robotics":["ppo","dreamerv3"],
  "tabular-classification":["xgboost","tabpfn"], "tabular-regression":["xgboost","tabpfn"],
  "time-series-forecasting":["tft","transformer"], "graph-ml":["gcn","gat"],
};
function algosForModel(m){
  const out = new Set(TASK2ALGO[m.pipeline_tag] || []);
  const tags = (m.tags || []).map(norm).join(" ") + " " + norm(m.id);
  if (/\bmamba\b|ssm/.test(tags)) out.add("mamba");
  if (/\bgrpo\b/.test(tags)) out.add("grpo");
  if (/\bdpo\b/.test(tags)) out.add("dpo");
  if (/\bppo\b/.test(tags)) out.add("ppo");
  if (m.library === "diffusers" && !out.size) out.add("ldm");
  return [...out].filter(id => NODES[id] && NODES[id].tree === "ml");
}
const HOSTED = /^https?:$/.test(location.protocol) && !/^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);
async function detectServer(){
  if (!/^https?:$/.test(location.protocol) || HOSTED) return false;
  try { const r = await fetch("api/status", {cache:"no-store"}); if (!r.ok) return false; const j = await r.json(); return !!j.server; }
  catch(e){ return false; }
}
async function loadData(){
  state.server = await detectServer();
  if (state.server){
    try { const r = await fetch("api/models", {cache:"no-store"}); if (r.ok){ state.data = await r.json(); state.source = "server"; } } catch(e){}
  } else if (/^https?:$/.test(location.protocol)){
    try { const r = await fetch("daily_models.json", {cache:"no-store"}); if (r.ok){ state.data = await r.json(); state.source = "json"; } } catch(e){}
  }
  if (!state.data && window.DAILY_MODELS){ state.data = window.DAILY_MODELS; state.source = "js"; }
  if (state.data && !Array.isArray(state.data.models)) state.data = null;
  renderRadar();
  if (state.server && isStale()) refresh(false);
}
function isStale(){
  const d = state.data; if (!d) return true;
  const now = new Date(), local = now.getFullYear()+"-"+String(now.getMonth()+1).padStart(2,"0")+"-"+String(now.getDate()).padStart(2,"0");
  if (d.snapshot_date !== local) return true;
  return (Date.now() - new Date(d.generated_at).getTime()) > 3*3600*1000;
}
async function refresh(force){
  if (!state.server || state.refreshing) return;
  state.refreshing = true; updateFresh();
  try {
    const r = await fetch("api/refresh" + (force ? "?force=1" : ""), {method:"POST"});
    const j = await r.json();
    if (j.payload){ state.data = j.payload; state.source = "server"; }
    if (!j.ok) toast((isEN() ? "Refresh failed: " : "更新失敗：") + (j.error || "?"));
  } catch(e){ toast((isEN() ? "Cannot reach the local server: " : "無法連線到本機伺服器：") + e.message); }
  state.refreshing = false; renderRadar(); buildIndex();
}

/* ═════════════════════════ 雷達：畫面 ═════════════════════════ */
function updateFresh(){
  const p = $("#freshPill"), btn = $("#refreshBtn"), d = state.data; if (!p) return;
  p.classList.toggle("live", state.refreshing);
  if (state.refreshing) p.innerHTML = `<span class="dot"></span><span>${t("fetching")}</span>`;
  else if (!d) p.innerHTML = `<span class="dot"></span><span>${t("noData")}</span>`;
  else { const [o, c] = isEN() ? [" (", ")"] : ["（", "）"]; p.innerHTML = `<span class="dot"></span><span>${t("dataTime")} ${esc(fmtLocal(d.generated_at) || d.generated_at_local || "")}${o}${esc(relTime(d.generated_at))}${c}</span>`; }
  btn.hidden = !state.server; btn.disabled = state.refreshing; btn.title = t("refreshT");
}
function scoreRing(score){
  const r = 22, c = 2*Math.PI*r, v = Math.max(0, Math.min(100, score||0));
  return `<div class="score" title="${t("interest")} ${v}/100"><svg width="52" height="52" viewBox="0 0 52 52" aria-hidden="true">
    <circle cx="26" cy="26" r="${r}" fill="none" stroke="var(--surface-3)" stroke-width="5"/>
    <circle cx="26" cy="26" r="${r}" fill="none" stroke="var(--brand)" stroke-width="5" stroke-linecap="round" stroke-dasharray="${(c*v/100).toFixed(1)} ${c.toFixed(1)}"/></svg>
    <div class="sv">${Math.round(v)}</div><div class="sl">${t("interest")}</div></div>`;
}
function modelCard(m){
  const algos = algosForModel(m), BD = t("bdLabel");
  const badges = [`<span class="chip task">${esc(taskLabel(m))}</span>`];
  if (m.derivative && m.derivative !== "original") badges.push(`<span class="chip warn">${esc(derivLabel(m))}</span>`);
  if (m.is_new_entry) badges.push(`<span class="chip good">${t("newEntry")}</span>`);
  if (m.params_b) badges.push(`<span class="chip">${t("paramsB", {n:esc(m.params_b)})}${m.active_params_b ? t("activeB", {n:esc(m.active_params_b)}) : ""}</span>`);
  if (m.library) badges.push(`<span class="chip">${esc(m.library)}</span>`);
  const bd = m.score_breakdown || {}, reasons = reasonsOf(m);
  return `<article class="card mcard" data-id="${esc(m.id)}">
    <div class="mcard-head">
      <div class="rank ${m.pick_rank && m.pick_rank <= 3 ? "top" : ""}" title="${esc(m.pick_rank ? t("pickRank", {n:m.pick_rank}) : t("trendRankT", {n:m.rank_trending}))}">${esc(m.pick_rank || m.rank_trending)}</div>
      <div style="min-width:0">
        <a class="mname" href="${esc(hfUrl(m.url))}" target="_blank" rel="noopener noreferrer">${esc(m.name)}</a>
        <div class="mauthor">${esc(m.author_fullname || m.author)} · ${t("trendRank", {n:esc(m.rank_trending)})}${esc(m.rank_change ? (m.rank_change > 0 ? " ▲" + m.rank_change : " ▼" + (-m.rank_change)) : "")}</div>
      </div>
      ${scoreRing(m.score)}
    </div>
    <div class="chips">${badges.join("")}</div>
    <div class="metrics">
      <div class="metric"><div class="mv">${fmtN(m.likes)}</div><div class="mk">${t("likes")}</div></div>
      <div class="metric"><div class="mv">${fmtN(m.downloads)}</div><div class="mk">${t("downloads")}</div></div>
      <div class="metric"><div class="mv">${fmtN(Math.round(m.trending_score))}</div><div class="mk">${t("heat")}</div></div>
      <div class="metric"><div class="mv">${esc(ageLabel(m.age_days))}</div><div class="mk">${t("age")}</div></div>
    </div>
    ${reasons.length ? `<ul class="reasons">${reasons.map(r => `<li>${esc(r)}</li>`).join("")}</ul>` : ""}
    <div class="breakdown">${Object.keys(BD).map(k => `<div class="bd-row"><span>${BD[k]}</span><div class="bar-track"><div class="bar-fill" style="width:${Math.round((bd[k]||0)*100)}%"></div></div><span class="muted" style="text-align:right">${Math.round((bd[k]||0)*100)}</span></div>`).join("")}</div>
    <div class="mfoot">
      <div class="rel">${algos.length ? `${t("relAlgo")} ${algos.map(a => `<button class="chip" data-algo="${a}" title="${esc(NODES[a].node.name)}">${esc(shortName(NODES[a].node))}</button>`).join("")}` : `<button class="link-btn sm" data-bd>${t("bd")}</button>`}</div>
      <div style="display:flex;gap:12px;align-items:center">${algos.length ? `<button class="link-btn sm" data-bd>${t("bd")}</button>` : ""}<a class="hf-link" href="${esc(hfUrl(m.url))}" target="_blank" rel="noopener noreferrer">${t("openHF")}</a></div>
    </div>
  </article>`;
}
function renderRadarHead(){
  $('[data-head="radar"]').innerHTML = `${subnav("radar")}<div class="hero"><div><div class="eyebrow">${t("radarEyebrow")}</div><h1 class="title">${t("radarTitle")}</h1><p class="lede">${t("radarLede")}</p></div>
    <div class="ctrl"><span class="pill" id="freshPill"><span class="dot"></span><span>${t("noData")}</span></span>
    <button class="btn primary" id="refreshBtn" hidden><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M21 12a9 9 0 1 1-2.6-6.4M21 4v5h-5"/></svg><span>${t("refresh")}</span></button></div></div>`;
  $("#refreshBtn").onclick = () => refresh(true);
}
function renderRadar(){
  renderRadarHead(); updateFresh();
  const body = $("#radarBody"), d = state.data, BD = t("bdLabel");
  if (!d){
    body.innerHTML = `<div class="card empty"><div style="font-size:40px">📡</div><h3>${t("rEmptyT")}</h3><p class="muted" style="max-width:560px;margin:0 auto">${t("rEmptyD")}</p>
      <div style="margin-top:14px"><button class="btn" data-goto="workflow">${t("rEmptyBtn")}</button></div></div>`;
    return;
  }
  const st = d.stats || {}, models = d.models || [], picks = new Set(d.picks || []);
  const vis = models.filter(m => state.showQuant || m.derivative !== "quantized");
  const newCount = models.filter(m => m.is_new_entry).length;
  const groups = {}; vis.forEach(m => { groups[m.task_group] = groups[m.task_group] || {n:0, zh:m.task_group_zh}; groups[m.task_group].n++; });
  const tc = {}; models.filter(m => m.derivative !== "quantized").forEach(m => { const k = taskLabel(m); tc[k] = (tc[k] || 0) + 1; });
  const taskCounts = Object.entries(tc).sort((a,b) => b[1]-a[1]).slice(0, 8), maxTask = Math.max(1, ...taskCounts.map(x => x[1]));
  const W = (d.method && d.method.weights) || {}, maxW = Math.max(.01, ...Object.values(W));
  let list = vis.slice();
  if (state.group !== "all") list = list.filter(m => m.task_group === state.group);
  if (state.listMode === "picks") list = list.filter(m => picks.has(m.id));
  const sorters = { score:(a,b)=>b.score-a.score, trending:(a,b)=>a.rank_trending-b.rank_trending, likes:(a,b)=>b.likes-a.likes,
    downloads:(a,b)=>b.downloads-a.downloads, newest:(a,b)=>(a.age_days??1e9)-(b.age_days??1e9), velocity:(a,b)=>b.like_velocity-a.like_velocity };
  list.sort(state.listMode === "picks" && state.sort === "score" ? (a,b)=>(a.pick_rank||99)-(b.pick_rank||99) : sorters[state.sort]);
  const u = t("sUnit") ? `<small>${t("sUnit")}</small>` : "";
  body.innerHTML = `
    <div class="stat-row">
      <div class="card stat"><div class="k">${t("sFetched")}</div><div class="v">${fmtN(st.models ?? models.length)}${u}</div></div>
      <div class="card stat"><div class="k">${t("sPicks")}</div><div class="v">${fmtN(picks.size)}${u}</div></div>
      <div class="card stat"><div class="k">${t("sQuant")}</div><div class="v">${fmtN(st.quantized_hidden_by_default || 0)}${u}</div></div>
      <div class="card stat"><div class="k">${t("sNew")}${d.previous_snapshot ? t("sVs", {d:esc(d.previous_snapshot)}) : ""}</div><div class="v">${d.previous_snapshot ? fmtN(newCount) : "—"}${d.previous_snapshot ? u : `<small>${t("sTomorrow")}</small>`}</div></div>
    </div>
    <div class="card dist">
      <div><h3>${t("distT")}</h3>${taskCounts.map(([k,v]) => `<div class="bar-row"><span class="lbl" title="${esc(k)}">${esc(k)}</span><div class="bar-track"><div class="bar-fill" style="width:${(v/maxTask*100).toFixed(1)}%"></div></div><span class="n">${esc(v)}</span></div>`).join("") || `<p class="muted">${t("none")}</p>`}</div>
      <div class="method-mini"><h3>${t("wT")} <button class="link-btn sm" data-goto="method">${t("fullExpl")}</button></h3>
        ${Object.entries(W).map(([k,v]) => `<div class="w"><span>${BD[k]||esc(k)}</span><div class="bar-track"><div class="bar-fill" style="width:${(v/maxW*100).toFixed(0)}%;opacity:.85"></div></div><span class="muted" style="text-align:right">${Math.round(v*100)}%</span></div>`).join("")}
        <p class="muted" style="font-size:12px;margin:10px 0 0">${t("src")}: Hugging Face Hub API · ${esc(d.generator || "")}</p></div>
    </div>
    <div class="toolbar">
      <div class="seg" role="group">
        <button aria-pressed="${state.group==="all"}" data-group="all">${t("allGroups")}<span class="c">${vis.length}</span></button>
        ${Object.entries(groups).sort((a,b)=>b[1].n-a[1].n).map(([k,g]) => `<button aria-pressed="${state.group===k}" data-group="${esc(k)}">${esc(groupLabel(k, g.zh))}<span class="c">${g.n}</span></button>`).join("")}
      </div>
      <div class="ctrl">
        <div class="seg" role="group"><button aria-pressed="${state.listMode==="picks"}" data-mode="picks">${t("picks")}</button><button aria-pressed="${state.listMode==="all"}" data-mode="all">${t("fullList")}</button></div>
        <label class="sr-only" for="sortSel">${t("sortLabel")}</label>
        <select class="sel" id="sortSel">${t("sorts").map(([k,l]) => `<option value="${k}" ${state.sort===k?"selected":""}>${l}</option>`).join("")}</select>
        <label class="toggle"><input type="checkbox" id="quantTgl" ${state.showQuant?"checked":""}>${t("showQuant")}</label>
      </div>
    </div>
    ${list.length ? `<div class="grid-cards">${list.map(modelCard).join("")}</div>` : `<div class="card empty"><h3>${t("noMatchT")}</h3><p class="muted">${t("noMatchD")}</p></div>`}
    ${state.listMode === "all" ? "" : `<div style="text-align:center;margin-top:18px"><button class="btn" data-mode="all">${t("seeAll", {n:vis.length})}</button></div>`}`;
  $$("[data-group]", body).forEach(b => b.onclick = () => { state.group = b.dataset.group; renderRadar(); });
  $$("[data-mode]", body).forEach(b => b.onclick = () => { state.listMode = b.dataset.mode; renderRadar(); });
  $("#sortSel", body).onchange = e => { state.sort = e.target.value; renderRadar(); };
  $("#quantTgl", body).onchange = e => { state.showQuant = e.target.checked; renderRadar(); };
  $$("[data-bd]", body).forEach(b => b.onclick = () => { const c = b.closest(".mcard"); c.classList.toggle("show-bd"); $$("[data-bd]", c).forEach(x => x.textContent = c.classList.contains("show-bd") ? t("bdHide") : t("bd")); });
}

/* ═════════════════════════ 知識樹：MECE 金字塔 ═════════════════════════ */
const hotAlgos = () => { const s = {}; (state.data?.models || []).forEach(m => { if (m.derivative !== "quantized") algosForModel(m).forEach(a => s[a] = (s[a]||0) + 1); }); return s; };
const stripCrit = s => String(s || "").replace(/^L\d\s*(切分準則：|split criterion:\s*)/i, "").replace(/[？?]$/, "");
const defOf = n => n.signal || n.def || n.philosophy || "";
const PYR_SEL = { ml: [], stat: [] };
function makePyramid(cfg){
  const wrap = $(cfg.tree), crumbEl = $(cfg.crumb);
  let last = 0;
  const T = () => TREES[cfg.key];
  const kidsOf = (node, lvl) => lvl === 1 ? T().children : (node.children || node.leaves || []);
  const L = () => t(cfg.p + "Lvl");
  function nodeHtml(n, lvl, hot){
    const SEL = PYR_SEL[cfg.key], sel = SEL[lvl-1] === n.id;
    if (lvl === 4) return `<button class="pnode lv4" data-algo="${n.id}" data-id="${n.id}" title="${esc(t("viewDetail", {n:n.name}))}">
        <span class="p-top"><span class="lvl lv4">L4</span>${hot[n.id] ? `<span class="hot">${t("todayN", {n:hot[n.id]})}</span>` : ""}<span class="p-go">${t("detail")}</span></span>
        <span class="p-name">${esc(n.name)}</span><span class="p-sub">${esc(n.year)} · ${esc((n.tasks||[]).slice(0,2).join(isEN() ? ", " : "、"))}</span></button>`;
    return `<button class="pnode lv${lvl}${sel ? " sel" : ""}" data-level="${lvl}" data-id="${n.id}" aria-expanded="${sel}">
        <span class="p-top"><span class="lvl ${lvl > 1 ? "lv" + lvl : ""}">L${lvl}</span><span class="p-cnt">${leafCount(n)}</span></span>
        <span class="p-name">${esc(n.name)}</span><span class="p-sub">${esc(isEN() ? "" : (n.en || ""))}</span></button>`;
  }
  function forkHtml(parent, lvl){
    const crit = lvl === 4 ? t(cfg.p + "LeafFork") : t("byCrit") + stripCrit(parent.criterion);
    return `<div class="fork" data-fork="${lvl}"><div class="fork-pill"><span class="fk-lvl">L${lvl} · ${L()[lvl]}</span><span class="fk-crit">${esc(crit)}</span><span class="fk-def">${rich(defOf(parent))}</span></div></div>`;
  }
  function renderCrumb(){
    const path = PYR_SEL[cfg.key].map(id => NODES[id].node);
    crumbEl.innerHTML = `<nav class="pyr-crumb"><button data-crumb="0" aria-current="${!path.length}">${esc(t(cfg.p + "Crumb"))}</button>
      ${path.map((n, i) => `<span class="sep">›</span><button data-crumb="${i+1}" aria-current="${i === path.length-1}">${esc(n.name)}</button>`).join("")}
      ${path.length < 3 ? `<span class="muted" style="font-size:12.5px;margin-left:4px">${t("crumbHint")}</span>` : ""}</nav>`;
  }
  function render(){
    PYR_SEL[cfg.key] = PYR_SEL[cfg.key].filter(id => NODES[id]);
    const SEL = PYR_SEL[cfg.key], hot = cfg.hot ? cfg.hot() : {};
    const ROOT = { id:"root", name:t(cfg.p + "Root"), criterion:T().criterion, def:t(cfg.p + "RootDef") };
    const path = [ROOT, ...SEL.map(id => NODES[id].node)];
    const sub = t(cfg.p + "RootSub", {a:T().children.length, b:countLevel(cfg.key,2), c:countLevel(cfg.key,3), d:LEAVES_BY[cfg.key].length});
    let html = `<svg class="pyr-lines" aria-hidden="true"></svg><div class="tier t0"><div class="tier-row"><div class="pnode root" data-id="root"><span class="p-name">${esc(ROOT.name)}</span><span class="p-sub">${esc(sub)}</span></div></div></div>`;
    let depth = 0;
    for (let lvl = 1; lvl <= 4; lvl++){
      const parent = path[lvl-1]; if (!parent) break;
      html += forkHtml(parent, lvl);
      html += `<div class="tier t${lvl}${lvl > last ? " appear" : ""}"><div class="tier-row">${kidsOf(parent, lvl).map(k => nodeHtml(k, lvl, hot)).join("")}</div></div>`;
      depth = lvl;
      if (!SEL[lvl-1]){ html += `<p class="pyr-hint">${lvl < 4 ? esc(t("expandHint", {a:L()[lvl], n:lvl+1, b:L()[lvl+1]})) : esc(t(cfg.p + "LeafHint"))}</p>`; break; }
    }
    last = depth; wrap.innerHTML = html; renderCrumb(); requestAnimationFrame(draw);
  }
  function draw(){
    const svg = wrap.querySelector(".pyr-lines");
    if (!svg || !wrap.offsetParent) return;
    const base = wrap.getBoundingClientRect(), W = wrap.clientWidth, H = wrap.scrollHeight;
    svg.setAttribute("width", W); svg.setAttribute("height", H); svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    const R = el => { const r = el.getBoundingClientRect(); return {t:r.top-base.top, b:r.bottom-base.top, cx:(r.left+r.right)/2-base.left}; };
    const f1 = n => Math.round(n*10)/10;
    let d = "", a = "";
    $$(".fork", wrap).forEach(f => {
      const lvl = +f.dataset.fork;
      const parent = lvl === 1 ? wrap.querySelector(".pnode.root") : wrap.querySelector(`.tier.t${lvl-1} .pnode.sel`);
      const kids = $$(`.tier.t${lvl} .pnode`, wrap);
      if (!parent || !kids.length) return;
      const P = R(parent), Q = R(f.querySelector(".fork-pill")), my = (R(parent.closest(".tier")).b + Q.t) / 2;
      a += Math.abs(P.cx - Q.cx) < 1 ? `M${f1(P.cx)},${f1(P.b)}V${f1(Q.t)}` : `M${f1(P.cx)},${f1(P.b)}V${f1(my)}H${f1(Q.cx)}V${f1(Q.t)}`;
      const K = kids.map(R), top = Math.min(...K.map(k => k.t)), bus = (Q.b + top) / 2, xs = K.map(k => k.cx).concat(Q.cx);
      d += `M${f1(Q.cx)},${f1(Q.b)}V${f1(bus)}M${f1(Math.min(...xs))},${f1(bus)}H${f1(Math.max(...xs))}`;
      kids.forEach((el, i) => { const seg = `M${f1(K[i].cx)},${f1(bus)}V${f1(K[i].t)}`;
        if (el.classList.contains("sel")) a += `M${f1(Q.cx)},${f1(Q.b)}V${f1(bus)}H${f1(K[i].cx)}V${f1(K[i].t)}`; else d += seg; });
    });
    svg.innerHTML = `<path class="ln" d="${d}"/><path class="ln act" d="${a}"/>`;
  }
  function select(id, lvl){
    let SEL = PYR_SEL[cfg.key];
    SEL = SEL[lvl-1] === id ? SEL.slice(0, lvl-1) : SEL.slice(0, lvl-1).concat(id);
    PYR_SEL[cfg.key] = SEL; render();
    if (SEL[lvl-1] === id){ const f = wrap.querySelector(`.fork[data-fork="${lvl+1}"]`); if (f){ const r = f.getBoundingClientRect(); if (r.top > innerHeight * .55) f.scrollIntoView({behavior:"smooth", block:"start"}); } }
  }
  function focus(id){
    const rec = NODES[id]; if (!rec || rec.tree !== cfg.key) return;
    PYR_SEL[cfg.key] = [...rec.parents.map(p => p.id), id].filter(x => NODES[x].level <= 3).slice(0, 3);
    render();
    setTimeout(() => { const el = wrap.querySelector(`.pnode[data-id="${CSS.escape(id)}"]`);
      if (el){ el.scrollIntoView({behavior:"smooth", block:"center"}); el.classList.add("flash"); setTimeout(() => el.classList.remove("flash"), 1600); } }, 40);
  }
  wrap.onclick = e => { const b = e.target.closest("button.pnode"); if (!b) return; if (b.dataset.algo) openAlgo(b.dataset.algo); else select(b.dataset.id, +b.dataset.level); };
  crumbEl.onclick = e => { const b = e.target.closest("[data-crumb]"); if (!b) return; PYR_SEL[cfg.key] = PYR_SEL[cfg.key].slice(0, +b.dataset.crumb); render(); };
  if ("ResizeObserver" in window) new ResizeObserver(() => requestAnimationFrame(draw)).observe(wrap);
  return { render, draw, focus };
}
const PYR = {
  ml: makePyramid({ key:"ml", tree:"#taxTree", crumb:"#taxOverview", p:"ml", hot: hotAlgos }),
  stat: makePyramid({ key:"stat", tree:"#statTree", crumb:"#statOverview", p:"st", hot: null }),
};
function renderTreeHeads(){
  $('[data-head="taxonomy"]').innerHTML = `${subnav("taxonomy")}<div class="hero"><div><div class="eyebrow">${t("taxEyebrow")}</div><h1 class="title">${t("taxTitle")}</h1><p class="lede">${t("taxLede")}</p></div></div>`;
  $('[data-head="stats"]').innerHTML = `${subnav("stats")}<div class="hero"><div><div class="eyebrow">${t("statEyebrow")}</div><h1 class="title">${t("statTitle")}</h1><p class="lede">${t("statLede")}</p></div></div>`;
  $('[data-head="method"]').innerHTML = `${subnav("method")}<div class="hero"><div><div class="eyebrow">${t("critEyebrow")}</div><h1 class="title">${t("critTitle")}</h1><p class="lede">${t("critLede")}</p></div></div>`;
  $('[data-head="quiz"]').innerHTML = `${subnav("quiz")}<div class="hero"><div><div class="eyebrow">${t("quizEyebrow")}</div><h1 class="title">${t("quizTitle")}</h1><p class="lede">${t("quizLede")}</p></div></div>`;
  $('[data-head="workflow"]').innerHTML = `<div class="subnav"><button class="sn-up" data-view="methods">${t("backMethods")}</button><button data-goto-track="data">${esc(tx(TRACK.data.name))}</button></div>
    <div class="hero"><div><div class="eyebrow">${t("wfEyebrow")}</div><h1 class="title">${t("wfTitle")}</h1><p class="lede">${esc(WF.lede)}</p></div></div>`;
}
const LEARN_SUB = ["radar","taxonomy","stats","method","quiz"];
const SUB_NAME = () => ({radar:t("tRadar"), taxonomy:t("tML"), stats:t("tStat"), method:t("tCrit"), quiz:t("tQuiz")});
function subnav(cur){
  const N = SUB_NAME();
  return `<nav class="subnav"><button class="sn-up" data-view="learn">${t("backLearn")}</button>${LEARN_SUB.map(v => `<button data-view="${v}" aria-current="${v === cur ? "page" : "false"}">${esc(String(N[v]).replace(/\{n\}\s*/, ""))}</button>`).join("")}</nav>`;
}

/* ═════════════════════════ 資料分析流程 ═════════════════════════ */
const colShort = c => String(c).replace(/\s*[（(].*$/, "").trim();
function linkChip(l){
  if (l.t === "flow"){ const s = WF.stages.find(x => x.id === l.id); return s ? `<button class="chip lk" data-flow="${l.id}">${esc(s.num + " " + s.name)} ›</button>` : ""; }
  const rec = NODES[l.id]; if (!rec) return "";
  return `<button class="chip lk" ${rec.level === 4 ? `data-algo="${l.id}"` : `data-node="${l.id}"`} title="${esc(rec.node.name)} (${rec.tree === "ml" ? t("mlTreeN") : t("statTreeN")})">${esc(l.label || rec.node.name)} ›</button>`;
}
function renderWorkflow(){
  let st = WF.stages.find(s => s.id === state.stage);
  if (!st){ st = WF.stages[0]; state.stage = st.id; }
  const i = WF.stages.indexOf(st), prev = WF.stages[i-1], next = WF.stages[i+1];
  const A = k => `wf-${st.id}-${k}`, sep = isEN() ? ": " : "：";
  $("#wfFlow").innerHTML = `<ol class="flow" id="wfSteps" aria-label="${t("flowAria")}">${WF.stages.map(s => `<li>
      <button class="fstep${s.id === st.id ? " on" : ""}" data-stage="${s.id}" aria-current="${s.id === st.id ? "step" : "false"}">
        <span class="fs-num">${esc(s.num)}</span><span class="fs-name">${esc(s.name)}</span>${isEN() ? "" : `<span class="fs-en">${esc(s.en)}</span>`}
        <span class="fs-q">${esc(s.q)}</span><span class="fs-out"><span>${t("out")}${esc(s.output)}</span></span></button></li>`).join("")}</ol>
    <div class="flow-loop" aria-hidden="true"></div><p class="flow-loop-t"><b>04 → 01</b>　${t("loopT")}</p>`;
  const cmpHtml = (c, k) => `<div class="card cmp wf-anchor" id="${A("c" + k)}"><h3>${esc(c.title)}</h3>
      <table class="cmp-table"><thead><tr><th scope="col"><span class="sr-only">${t("cmpAspect")}</span></th>${c.cols.map(x => `<th scope="col">${esc(x)}</th>`).join("")}</tr></thead>
      <tbody>${c.rows.map(r => `<tr><th scope="row">${esc(r[0])}</th>${r.slice(1).map((v, j) => `<td data-col="${esc(colShort(c.cols[j]))}">${esc(v)}</td>`).join("")}</tr>`).join("")}</tbody></table>
      <div class="verdict"><b>${t("howPick")}</b><p>${esc(c.verdict)}</p></div></div>`;
  const lay = (x, cls) => x ? `<div class="lay ${cls}"><b>${esc(x.name)}</b><span class="alias">${esc(x.alias)}</span><p>${esc(x.desc)}</p></div>` : `<div class="lay ghost"><span>${t("noLayer")}</span></div>`;
  const arrows = `<div class="lay-arrow">↓</div><div class="lay-arrow">↓</div>`;
  const layersHtml = Lr => { const T3 = Lr.three.layers, T2 = Lr.two.layers;
    return `<div class="card layers wf-anchor" id="${A("l")}"><h3>${esc(Lr.title)}</h3><div class="lay-grid"><div class="lay-h">${esc(Lr.three.name)}</div><div class="lay-h">${esc(Lr.two.name)}</div>
      ${lay(T3[0], "lay-raw")}${lay(T2[0], "lay-raw")}${arrows}${lay(T3[1], "lay-mid")}${lay(null)}${arrows}${lay(T3[2], "lay-app")}${lay(T2[1], "lay-app")}</div></div>`; };
  const qualityHtml = Q => `<div class="section-title"><h2>${esc(Q.title)}</h2><span class="hint">${t("qHint")}</span></div>
    <div class="qgrid wf-anchor" id="${A("q")}">${Q.dims.map(d => `<div class="card qd"><div><span class="qn">${esc(d[0])}</span>${d[1] !== d[0] ? `<span class="qe">${esc(d[1])}</span>` : ""}</div><div class="qq">${esc(d[2])}</div><div class="qc">${t("check")}${esc(d[3])}</div></div>`).join("")}</div>`;
  const routingHtml = R => `<div class="section-title"><h2>${esc(R.title)}</h2><span class="hint">${t("rtHint")}</span></div>
    <div class="card route wf-anchor" id="${A("r")}"><div class="rt-row rt-head"><span>${t("rtType")}</span><span>${t("rtQ")}</span><span>${t("rtM")}</span><span>${t("rtL")}</span></div>
      ${R.rows.map(r => `<div class="rt-row"><span class="rt-type">${esc(r.type)}</span><div class="rt-q">${esc(r.q)}</div><div class="rt-m">${esc(r.method)}</div><div class="rt-links">${r.links.map(linkChip).join("")}</div></div>`).join("")}
      <div class="verdict"><b>${t("key")}</b><p>${esc(R.note)}</p></div></div>`;
  const list = arr => (arr || []).map(x => `<li>${esc(x)}</li>`).join("");
  $("#wfBody").innerHTML = `
    <div class="card stage-head"><div class="sh-num" aria-hidden="true">${esc(st.num)}</div><div>
      <div class="eyebrow">Stage ${esc(st.num)} · ${esc(st.en)}</div><h2 class="sh-title">${esc(st.name)}</h2><p class="sh-q">${esc(st.q)}</p><p class="sh-sum">${esc(st.summary)}</p><span class="pill">${t("out")}${esc(st.output)}</span></div></div>
    ${st.routing ? routingHtml(st.routing) : ""}
    ${st.compares ? `<div class="section-title"><h2>${t("tradeoffs")}</h2><span class="hint">${t("tradeHint")}</span></div>${st.layers ? layersHtml(st.layers) : ""}${st.compares.map(cmpHtml).join("")}` : ""}
    ${st.quality ? qualityHtml(st.quality) : ""}
    <div class="section-title"><h2>${t("core")}</h2></div>
    <div class="wf-secs">${st.sections.map((s, k) => `<div class="card wf-sec wf-anchor" id="${A("s" + k)}"><h3>${esc(s.title)}</h3><p>${esc(s.body)}</p>${s.example ? `<div class="wf-ex">${esc(s.example)}</div>` : ""}${s.items ? `<ul>${list(s.items)}</ul>` : ""}</div>`).join("")}</div>
    <div class="section-title"><h2>${t("checks")}</h2></div>
    <div class="two-col wf-anchor" id="${A("p")}">
      <div class="card"><div class="card-h">${t("confirm")}</div><ul class="checklist">${list(st.checklist)}</ul></div>
      <div class="card"><div class="card-h">${t("traps")}</div><div class="pits">${st.pitfalls.map(p => `<div class="pit"><b>${esc(p[0])}</b><span>${esc(p[1])}</span></div>`).join("")}</div></div>
    </div>
    <div class="section-title"><h2>${t("outExt")}</h2></div>
    <div class="two-col"><div class="card"><div class="card-h">${t("stepOut")}</div><ul class="deliv">${list(st.deliverables)}</ul></div>
      <div class="card"><div class="card-h">${t("toKB")}</div><div class="sib" style="padding:12px 18px 16px">${(st.links || []).map(linkChip).join("")}</div></div></div>
    ${next ? "" : `<div class="flow-back"><span>↻ ${esc(WF.loop)}</span><button class="btn" data-stage="${WF.stages[0].id}" data-top="1">${t("backTo")} 01 ${esc(WF.stages[0].name)}</button></div>`}
    <div class="d-nav stage-nav">${prev ? `<button class="btn" data-stage="${prev.id}" data-top="1">← ${esc(prev.num)} ${esc(prev.name)}</button>` : "<span></span>"}${next ? `<button class="btn primary" data-stage="${next.id}" data-top="1">${esc(next.num)} ${esc(next.name)} →</button>` : ""}</div>
    <div class="section-title"><h2>${t("prin3")}</h2></div>
    <div class="prin">${WF.principles.map(p => `<div class="card"><b>${esc(p[0])}</b><p>${esc(p[1])}</p></div>`).join("")}</div>`;
}
$("#view-workflow").addEventListener("click", e => {
  const s = e.target.closest("[data-stage]");
  if (s){ state.stage = s.dataset.stage; renderWorkflow(); setHash("flow/" + state.stage); if (s.dataset.top) $("#wfSteps").scrollIntoView({behavior:"smooth", block:"start"}); }
});

/* ═════════════════════════ 切分準則（方法論與切分準則） ═════════════════════════ */
function renderMethod(){
  const key = state.mtree, T = TREES[key], isML = key === "ml", BD = t("bdLabel"), WD = t("wd");
  const W = (state.data && state.data.method && state.data.method.weights) || {momentum:.35, velocity:.25, recency:.15, originality:.15, rarity:.10};
  const colon = isEN() ? ": " : "：";
  $("#methodBody").innerHTML = `
    <div class="seg mtoggle" role="group"><button data-mtree="ml" aria-pressed="${isML}">${t("mtML")}</button><button data-mtree="stat" aria-pressed="${!isML}">${t("mtStat")}</button></div>
    <div class="section-title"><h2>${t("firstCut")}${esc(stripCrit(T.criterion))}</h2></div>
    <div class="card l1card"><div class="crit" style="margin-top:0"><b>${t("l1crit")}</b><span>${esc(stripCrit(T.criterion))}</span></div><p>${esc(T.criterionDetail)}</p></div>
    <div class="section-title"><h2>${t("fourLv")}</h2><span class="hint">${t("fourLvHint")}</span></div>
    <div class="card" style="overflow:hidden"><table class="rule-table">${T.levels.map(l => `<tr><td><span class="lvl ${l.level==="L1"?"":l.level==="L2"?"lv2":"lv3"}">${esc(l.level)}</span><div style="font-weight:700;margin-top:6px">${esc(l.name)}</div></td><td>${esc(l.rule)}</td></tr>`).join("")}</table></div>
    <div class="section-title"><h2>${isML ? t("l2ML") : t("l2Stat")}</h2><span class="hint">${t("l2Hint")}</span></div>
    <div class="two-col">${T.children.map(l1 => `<div class="card" style="padding:16px 18px"><div style="font-family:var(--font-serif);font-weight:700;font-size:17px">${esc(l1.name)}</div>
      <div class="crit" style="margin-top:8px"><b>${t("critWord")}</b><span>${esc(stripCrit(l1.criterion))}</span></div>
      <ul style="margin:12px 0 0;padding-left:18px;font-size:14px;color:var(--ink-2)">${l1.children.map(l2 => `<li style="margin:6px 0"><b style="color:var(--ink)">${esc(l2.name)}</b>${colon}${rich(l2.def)}${l2.criterion ? `<span class="l3c">${t("l3by")}${esc(stripCrit(l2.criterion))}</span>` : ""}</li>`).join("")}</ul></div>`).join("")}</div>
    <div class="section-title"><h2>${t("bndT")}</h2><span class="hint">${t("bndHint")}</span></div>
    <div class="card faq">${T.boundaries.map((b,i) => `<details ${i===0?"open":""}><summary><span class="qi">Q</span><span>${esc(b.q)}</span></summary><div class="a">${esc(b.a)}</div></details>`).join("")}</div>
    <div class="section-title"><h2>${isML ? t("hybML") : t("hybStat")}</h2><span class="hint">${isML ? t("hybMLHint") : t("hybStatHint")}</span></div>
    <div class="card" style="overflow:hidden"><table class="rule-table">${T.hybrids.map(h => `<tr><td style="font-weight:700;width:170px">${esc(h[0])}</td><td>${esc(h[1])}</td></tr>`).join("")}</table></div>
    ${isML ? `<div class="section-title"><h2>${t("scoreT")}</h2><span class="hint">${t("scoreHint")}</span></div>
    <div class="card" style="overflow:hidden"><table class="rule-table">${Object.entries(W).map(([k,v]) => `<tr><td style="width:170px"><b>${BD[k]||esc(k)}</b><div class="muted" style="font-size:13px">${t("weight")} ${Math.round(v*100)}%</div></td><td>${esc(WD[k]||"")}</td></tr>`).join("")}
      <tr><td style="width:170px"><b>${t("pickRule")}</b></td><td>${esc(t("pickRuleD"))}</td></tr></table></div>` : ""}
    <div class="section-title"><h2>${isML ? t("notML") : t("notStat")}</h2></div>
    <div class="card notation">${T.notation.map(n => `<div><b>${esc(n[0])}</b>${esc(n[1])}</div>`).join("")}</div>`;
  $$("#methodBody [data-mtree]").forEach(b => b.onclick = () => { state.mtree = b.dataset.mtree; renderMethod(); });
}

/* ═════════════════════════ 抽屜（演算法／方法詳情） ═════════════════════════ */
let lastFocus = null, drawerAlgo = null;
const toolsHtml = s => `<div class="tools">${String(s).split(/[；;]\s*/).filter(Boolean).map(seg => {
  const m = /^([^：:]{1,18})[：:]\s*(.*)$/.exec(seg.trim());
  return m ? `<div class="tool-row"><span class="tool-k">${esc(m[1])}</span><span>${esc(m[2])}</span></div>` : `<div class="tool-row"><span>${esc(seg)}</span></div>`; }).join("")}</div>`;
function openAlgo(id, pushHash=true){
  const rec = NODES[id]; if (!rec || rec.level !== 4) return;
  const lf = rec.node, [l1, l2, l3] = rec.parents, isML = rec.tree === "ml", T = TREES[rec.tree];
  if (!$("#drawer").classList.contains("open")) lastFocus = document.activeElement;
  drawerAlgo = id;
  $("#dCrumb").innerHTML = [l1, l2, l3].map(n => `<button data-node="${n.id}">${esc(n.name)}</button>`).join(`<span aria-hidden="true">›</span>`);
  $("#dTitle").textContent = lf.name;
  $("#dSub").textContent = [lf.zh, lf.year ? t("dYear", {y:lf.year}) : ""].filter(Boolean).join(" · ");
  $("#dTags").innerHTML = (lf.tasks || []).map(x => `<span class="chip">${esc(x)}</span>`).join("");
  const siblings = l3.leaves.filter(x => x.id !== id);
  const leaves = LEAVES_BY[rec.tree], idx = leaves.indexOf(lf), prev = leaves[idx-1], next = leaves[idx+1];
  const related = isML ? (state.data?.models || []).filter(m => m.derivative !== "quantized" && algosForModel(m).includes(id)).sort((a,b)=>b.score-a.score).slice(0,4) : [];
  const list = arr => `<ul>${(arr||[]).map(x => `<li>${rich(x)}</li>`).join("")}</ul>`;
  let secN = 0; const sec = (title, inner) => `<div class="d-sec"><h4><span class="n">${String(++secN).padStart(2,"0")}</span>${title}</h4>${inner}</div>`;
  const used = (USED_IN[id] || []).map(cid => CASE[cid]).filter(Boolean);
  const mathSec = `<div class="d-sec d-math"><h4><span class="n">∑</span>${t("dMath")}</h4><p class="muted" style="font-size:12.5px;margin:0 0 10px">${t("dMathHint")}</p>
      ${lf.plain ? `<h5 class="d-h5">${t("dTech")}</h5><p>${rich(lf.intuition)}</p>` : ""}
      ${isML ? `<h5 class="d-h5">${t("dObj")}</h5><div class="formula">${formulaHtml(lf.objective)}</div>
        <h5 class="d-h5">${t("dCx")}</h5>
        <div class="cx"><div><div class="ck">${t("dTrain")}</div><div class="cv">${rich(lf.complexity.train)}</div></div><div><div class="ck">${t("dInfer")}</div><div class="cv">${rich(lf.complexity.infer)}</div></div><div><div class="ck">${t("dSpace")}</div><div class="cv">${rich(lf.complexity.space)}</div></div></div>
        <p class="muted" style="font-size:12.5px;margin-top:8px">${t("dSym")}${T.notation.slice(0,8).map(n => esc(n[0]+" = "+n[1])).join(isEN() ? "; " : "、")}…</p>`
      : `<h5 class="d-h5">${t("dFormula")}</h5><div class="formula">${formulaHtml(lf.objective)}</div>`}</div>`;
  $("#dBody").innerHTML = `
    ${sec(t("dPlain"), `<p class="d-plain">${rich(lf.plain || lf.intuition)}</p>`)}
    ${used.length ? sec(t("dPete"), `<div class="sib">${used.map(c => `<button class="chip lk" data-case="${c.id}">${esc(tx(c.title))} ›</button>`).join("")}</div>`) : ""}
    ${sec(t("dWhen"), `<div class="pc"><div><h5>${t("dUse")}</h5>${list(lf.use)}</div><div><h5>${t("dPros")}</h5>${list(lf.pros)}</div></div>`)}
    ${sec(t("dCons"), `<div class="pc" style="grid-template-columns:1fr"><div class="con">${list(lf.cons)}</div></div>`)}
    ${!isML ? sec(t("dAssume"), `<div class="pc"><div class="con"><h5>${t("dAssumeH")}</h5>${list(lf.assumptions)}</div><div class="ok"><h5>${t("dCheckH")}</h5>${list(lf.checks)}</div></div>`) : ""}
    ${sec(isML ? t("dHpML") : t("dHpStat"), `<table class="hp-table">${(lf.hp||[]).map(h => `<tr><td>${esc(h[0])}</td><td>${rich(h[1])}</td></tr>`).join("")}</table>`)}
    ${!isML && lf.tools ? sec(t("dTools"), toolsHtml(lf.tools)) : ""}
    ${mathSec}
    ${lf.note ? `<div class="d-sec"><h4><span class="n">✱</span>${t("dNote")}</h4><div class="note-box">${rich(lf.note)}</div></div>` : ""}
    <div class="d-sec"><h4><span class="n">L3</span>${t("dFamily")}${esc(l3.name)}</h4><p class="muted" style="font-size:13.5px;margin-bottom:10px">${rich(l3.philosophy)}</p>
      <div class="sib">${siblings.length ? siblings.map(s => `<button class="chip" data-algo="${s.id}">${esc(s.name)}</button>`).join("") : `<span class="muted" style="font-size:13px">${t("dOnly", {w:isML ? t("dAlgo") : t("dMethod")})}</span>`}</div></div>
    ${related.length ? `<div class="d-sec"><h4><span class="n">HF</span>${t("dHF")}</h4><div class="sib">${related.map(m => `<a class="chip" href="${esc(hfUrl(m.url))}" target="_blank" rel="noopener noreferrer">${esc(m.name)} ↗</a>`).join("")}</div></div>` : ""}
    <div class="d-nav">${prev ? `<button class="btn" data-algo="${prev.id}">← ${esc(prev.name)}</button>` : "<span></span>"}${next ? `<button class="btn" data-algo="${next.id}">${esc(next.name)} →</button>` : ""}</div>`;
  $("#dBody").scrollTop = 0;
  $("#drawer").classList.add("open"); $("#overlay").classList.add("open");
  $("#drawer").setAttribute("aria-hidden", "false"); document.body.style.overflow = "hidden";
  fitFormulas($("#dBody")); requestAnimationFrame(() => fitFormulas($("#dBody")));
  setTimeout(() => $("#dClose").focus(), 60);
  if (pushHash) setHash("algo/" + id);
}
function closeDrawer(restoreHash=true){
  if (!$("#drawer").classList.contains("open")) return;
  drawerAlgo = null;
  $("#drawer").classList.remove("open"); $("#overlay").classList.remove("open");
  $("#drawer").setAttribute("aria-hidden", "true"); document.body.style.overflow = "";
  if (restoreHash && location.hash.startsWith("#algo/")) setHash(currentHash());
  if (lastFocus && lastFocus.focus) lastFocus.focus();
}
$("#dClose").onclick = () => closeDrawer(); $("#overlay").onclick = () => closeDrawer();
let fitT; window.addEventListener("resize", () => { clearTimeout(fitT); fitT = setTimeout(() => fitFormulas($("#dBody")), 120); });
