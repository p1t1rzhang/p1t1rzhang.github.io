/* ═════════════════════════ 啟動 ═════════════════════════ */
applyTheme(store.get("ml.theme"));
applyAccent(store.get("ml.accent"));
renderAll();
route();
loadData().then(() => { buildIndex(); if (state.view === "taxonomy") PYR.ml.render(); });
if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => requestAnimationFrame(() => { PYR.ml.draw(); PYR.stat.draw(); fitFormulas($("#dBody")); }));

/* 頁首簽名：載入時寫一次 */
requestAnimationFrame(() => $$(".hdr .sig").forEach(s => s.classList.add("write")));
