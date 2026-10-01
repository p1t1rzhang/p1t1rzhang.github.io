/* ═════════════════════════ 3B：Ezera 風格首頁 ═════════════════════════
   白底、粉彩霧面色塊、大字襯線、中央一顆由點組成的 3D 球；
   往下滑時球慢慢旋轉、放大、散開，段落依序揭露。
   只有在 <html data-style="ez"> 時啟用（build.py 以 STYLE=ez 產生）。 */
const IS_EZ = document.documentElement.dataset.style === "ez";
Object.assign(UI.zh, { ezL1:"問題，", ezL2:"用數據回答。", ezQuote:"「先寫下假說，再用資料證明它。」", ezScroll:"往下滑" });
Object.assign(UI.en, { ezL1:"Questions,", ezL2:"answered.", ezQuote:"“Start with a hypothesis, then prove it with data.”", ezScroll:"Scroll" });

/* ── 針對職缺的連結：?for=consulting|data|pm（可加 &co=公司名）
   例：/?for=consulting&co=BCG → 首頁先秀顧問角色、作品篩顧問相關、履歷預設顧問版，並顯示「為 BCG 準備」 */
const FOR = (() => {
  const q = new URLSearchParams(location.search);
  const raw = (q.get("for") || "").toLowerCase().trim();
  const map = {consulting:"consulting", consultant:"consulting", consult:"consulting", strategy:"consulting", mc:"consulting",
               data:"data", da:"data", ds:"data", analyst:"data", analytics:"data", "data-science":"data",
               pm:"pm", project:"pm", product:"pm", "project-manager":"pm"};
  const track = map[raw] || "";
  const co = (q.get("co") || "").replace(/[\u0000-\u001f<>]/g, "").trim().slice(0, 40);
  return { track, co };
})();
if (FOR.track){
  state.track = state.resTrack = state.workFilter = state.role = FOR.track;
  const i = PROFILE.roles.findIndex(r => r.track === FOR.track);
  if (i > 0) PROFILE.roles.unshift(PROFILE.roles.splice(i, 1)[0]);   // 目標角色排第一
}
Object.assign(UI.zh, { forPrep:"為 {co} 準備", forVer:"{role}版本", forCta:"索取這個版本的履歷" });
Object.assign(UI.en, { forPrep:"Prepared for {co}", forVer:"{role} version", forCta:"Request this résumé" });
function forPill(){
  if (!FOR.track) return "";
  const role = PROFILE.roles.find(r => r.track === FOR.track);
  const parts = [FOR.co ? t("forPrep").replace("{co}", esc(FOR.co)) : "", t("forVer").replace("{role}", esc(role ? tx(role.name) : ""))].filter(Boolean);
  return `<a class="ez-for" href="#resume/${FOR.track}" data-resume="${FOR.track}"><span class="dot" aria-hidden="true"></span>${parts.join("・")}<b>${t("forCta")} →</b></a>`;
}

/* 在最後一個逗號後斷行（右上那句分兩行顯示） */
function brLast(str){ const i = Math.max(str.lastIndexOf("，"), str.lastIndexOf(", ")); if (i < 1) return esc(str);
  const cut = str[i] === "，" ? i + 1 : i + 1; return esc(str.slice(0, cut)) + "<br>" + esc(str.slice(cut).trim()); }
function renderHomeEz(){
  const roles = PROFILE.roles, sig = $(".hdr .sig") ? $(".hdr .sig").outerHTML.replace('class="sig', 'class="sig sig-quote write') : "";
  $("#view-home").innerHTML = `
  <div class="story ez-story" id="story">
    <div class="stage ez-stage" id="stage">
      <div class="ez-blobs" aria-hidden="true"><i class="b1"></i><i class="b2"></i><i class="b3"></i><i class="b4"></i><i class="b5"></i></div>
      <div class="ez-grid" aria-hidden="true"></div>
      <canvas class="dots" id="dots" aria-hidden="true"></canvas>

      <div class="ch ch0 ez-hero${FOR.track ? " has-for" : ""}" data-ch="0">
        ${forPill()}
        <h1 class="sr-only">${esc(tx(P.name))}｜${esc(tx(P.roles))}</h1>
        <p class="ez-l1" aria-hidden="true">${t("ezL1")}</p>
        <p class="ez-l2" aria-hidden="true">${t("ezL2")}</p>
        <p class="ez-side ez-tr">${brLast(tx(P.headline))}</p>
        <p class="ez-side ez-ml">${tx(P.sub).split(/\s*[｜·]\s*/).map(esc).join("<br>")}</p>
        <figure class="ez-quote"><blockquote>${t("ezQuote")}</blockquote><figcaption>${sig}<span class="sr-only">Pete Zhang</span></figcaption></figure>
      </div>
      <div class="ch ch1" data-ch="1">
        <p class="hi">${t("hi")}</p>
        <p class="name">${esc(tx(P.name))}</p>
        <p class="headline">${esc(tx(P.roles))}</p>
      </div>
      <div class="ch ch2" data-ch="2">
        <p class="lead">${t("rolesLead")}</p>
        <div class="role3">${roles.map(r => `<button class="r3${FOR.track === r.track ? " on" : ""}" data-goto-track="${r.track}"><b>${esc(tx(r.name))}</b><span>${esc(tx(r.strengths[0])[0])}・${esc(tx(r.strengths[1])[0])}</span></button>`).join("")}</div>
      </div>
      <div class="ch ch3" data-ch="3">
        <div class="nums">${P.proof.slice(0, 4).map(p => `<div><b>${esc(tx(p.v))}</b><span>${esc(tx(p.k))}</span></div>`).join("")}</div>
      </div>
      <div class="ch ch4" data-ch="4">
        <p class="lead">${t("nowT")}</p>
        <ul class="now">${P.facts.slice(0, 3).map(f => `<li><span>${esc(tx(f.k))}</span>${esc(tx(f.v))}</li>`).join("")}</ul>
        <p class="nstatus">${esc(tx(P.status))}</p>
        <div class="cta"><button class="btn primary" data-view="work">${t("nowCta1")}</button><a class="btn" href="#contact" data-scroll="contact">${t("nowCta2")}</a></div>
      </div>
      <div class="ez-scroll" aria-hidden="true"><span>${t("ezScroll")}</span><i></i></div>
      <ol class="prog" aria-hidden="true">${[0,1,2,3,4].map(i => `<li data-p="${i}"></li>`).join("")}</ol>
    </div>
  </div>
  ${$("#view-home .after") ? "" : ""}`;
  // 故事之後的段落沿用第 3 版（作品、方法、知識庫、常見問題、聯絡），只換樣式
  const tmp = document.createElement("div"); tmp.innerHTML = HOME_AFTER();
  $("#view-home").appendChild(tmp.firstElementChild);
  EZ.mount();
}

/* 3D 點球：Fibonacci 球面上的點，透視投影；p 越大，球越大、越散、越淡 */
const EZ = (() => {
  let cv, ctx, W = 0, H = 0, DPR = 1, pts = [], raf = 0, t0 = 0, running = false, mounted = false;
  const reduce = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
  const clamp = (x, a=0, b=1) => Math.max(a, Math.min(b, x));
  const ease = x => x < .5 ? 4*x*x*x : 1 - Math.pow(-2*x + 2, 3) / 2;
  function build(){
    const n = W < 640 ? 520 : 900; let s = 11; const R = () => (s = (s * 16807) % 2147483647) / 2147483647;
    pts = Array.from({length:n}, (_, i) => { const y = 1 - (i + .5) / n * 2, r = Math.sqrt(1 - y*y), a = i * Math.PI * (3 - Math.sqrt(5));
      return {x: Math.cos(a) * r, y, z: Math.sin(a) * r, jx: R()*2-1, jy: R()*2-1, jz: R()*2-1, pink: R() < .12}; });
  }
  function progress(){ const st = $("#story"); if (!st) return 0; const r = st.getBoundingClientRect(), span = st.offsetHeight - innerHeight; return span > 0 ? clamp(-r.top / span) : 0; }
  const WIN = [[-1, .14], [.18, .34], [.38, .54], [.58, .72], [.78, 2]];
  const op = (i, p) => { const [a, b] = WIN[i], f = .045; return clamp(Math.min((p - a) / f, (b - p) / f)); };
  function frame(ts){
    raf = 0;
    const p = reduce() ? .9 : progress(), time = (ts - t0) / 1000;
    document.body.classList.toggle("past-story", reduce() || p >= .995);
    const css = getComputedStyle(document.documentElement), ink = css.getPropertyValue("--ez-dot").trim() || "#333", pink = css.getPropertyValue("--ez-pink").trim() || "#e05a8a";
    ctx.clearRect(0, 0, W, H);
    const mob = W < 760, base = Math.min(W, H) * (mob ? .3 : .26), e = ease(clamp(p / .9));
    const R = base * (1 + e * 1.6), spread = e * Math.min(W, H) * .55, rot = time * .12 + p * 3.2, tilt = .35 + p * .6;
    const cx = W / 2, cy = H * (mob ? .5 : .54), f = 3.2;
    const cr = Math.cos(rot), sr = Math.sin(rot), ct = Math.cos(tilt), st = Math.sin(tilt);
    const fade = 1 - .55 * clamp((p - .6) / .3);
    for (const q of pts){
      let x = q.x * R + q.jx * spread, y = q.y * R + q.jy * spread, z = q.z * R + q.jz * spread;
      let x1 = x * cr + z * sr, z1 = -x * sr + z * cr;           // 繞 y 軸
      let y1 = y * ct - z1 * st, z2 = y * st + z1 * ct;           // 繞 x 軸
      const den = f + z2 / base; if (den < .8) continue; const k = f / den; const sx = cx + x1 * k, sy = cy + y1 * k;
      if (sx < -20 || sx > W + 20 || sy < -20 || sy > H + 20) continue;
      const depth = clamp((z2 / base + 1.5) / 3);                 // 0 前、1 後
      ctx.globalAlpha = fade * (q.pink ? .95 : .25 + .6 * (1 - depth));
      ctx.fillStyle = q.pink ? pink : ink;
      ctx.beginPath(); ctx.arc(sx, sy, (q.pink ? 2.6 : 1.7) * k * (mob ? .9 : 1.1), 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
    $$("#stage .ch").forEach((el, i) => { const o = op(i, p); el.style.opacity = o.toFixed(3); el.style.visibility = o < .02 ? "hidden" : "visible";
      if (i > 0) el.style.transform = `translateY(${((1 - o) * 16).toFixed(1)}px)`; });
    const h = $("#stage .ez-hero"); if (h){ h.style.setProperty("--split", (p / .14).toFixed(3)); }
    $$("#stage .prog li").forEach((li, i) => li.classList.toggle("on", op(i, p) > .5));
    $$("#stage .ez-blobs i").forEach((b, i) => { b.style.transform = `translate(${(Math.sin(time * .2 + i) * 18 + (i % 2 ? 1 : -1) * p * 120).toFixed(1)}px, ${(Math.cos(time * .17 + i * 2) * 14 - p * 80).toFixed(1)}px)`; });
    if (running && !reduce() && document.body.dataset.page === "home" && p < .999) raf = requestAnimationFrame(frame);
  }
  function kick(){ if (!raf){ running = true; raf = requestAnimationFrame(frame); } }
  function resize(){ if (!cv) return; DPR = Math.min(2, devicePixelRatio || 1); W = cv.clientWidth; H = cv.clientHeight;
    cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR); ctx.setTransform(DPR, 0, 0, DPR, 0, 0); build(); kick(); }
  function mount(){
    cv = $("#dots"); if (!cv) return; ctx = cv.getContext("2d"); t0 = performance.now();
    document.documentElement.classList.toggle("rm", reduce());
    if (!mounted){ mounted = true; addEventListener("scroll", kick, {passive:true}); addEventListener("resize", resize); }
    requestAnimationFrame(resize);
  }
  return { mount, tick: kick, redraw: kick };
})();
