/* ═════════════════════════ 基本工具 ═════════════════════════ */
const $ = (s, el=document) => el.querySelector(s);
const $$ = (s, el=document) => Array.from(el.querySelectorAll(s));
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const store = { get(k){ try { return localStorage.getItem(k); } catch(e){ return null; } }, set(k,v){ try { localStorage.setItem(k,v); } catch(e){} } };
const J = id => JSON.parse(document.getElementById(id).textContent);
const norm = s => String(s || "").toLowerCase().normalize("NFKC");
const hfUrl = u => /^https:\/\/huggingface\.co\/[^\s"<>]+$/.test(String(u || "")) ? String(u) : "#";
function setHash(h){ try { history.replaceState(null, "", "#" + h); } catch(e){} }
function pushHash(h){   // 換頁：新增一筆紀錄（同一頁內切換分頁籤則用 setHash 取代，不灌爆紀錄）
  try { if (location.hash.replace(/^#/, "") === h) return; history.pushState(null, "", "#" + h); if (typeof lastRouted !== "undefined") lastRouted = h; } catch(e){}
}

/* ═════════════════════════ 語言 ═════════════════════════ */
let LANG = (() => { const m = /[?&]lang=(en|zh)/.exec(location.search); return m ? m[1] : (store.get("ml.lang") === "en" ? "en" : "zh"); })();
const isEN = () => LANG === "en";
/* 雙語欄位：{zh, en} 取目前語言；純字串或陣列原樣回傳 */
const tx = v => (v && typeof v === "object" && !Array.isArray(v) && ("zh" in v || "en" in v)) ? (v[LANG] ?? v.zh) : v;

const UI = {
zh: {
  skip:"跳到主要內容", brandName:"Pete Zhang", brandSub:"策略 × 數據 × 專案管理",
  navHome:"首頁", navWork:"作品案例", navMethods:"方法論", navLearn:"模型學習", navAbout:"關於我",
  navWorkShort:"案例", navMethodsShort:"方法論", navLearnShort:"學習", navAboutShort:"關於我",
  searchBtn:"搜尋", searchPh:"搜尋案例、方法論、演算法、統計方法或今日模型…", accent:"配色", theme:"切換深色／淺色模式", close:"關閉",
  langTo:"Switch to English",
  /* 首頁 */
  heroCta1:"看作品案例", heroCta2:"索取履歷", heroCta3:"LinkedIn",
  rolesTitle:"你在找哪一種人才？", rolesHint:"選一個職能，看我對應的優勢與案例",
  rolePlaybook:"看這條線的方法論", roleResume:"看這個版本的履歷", roleCases:"相關案例",
  howTitle:"我怎麼解一個問題", howHint:"每個案例都照這四步走",
  how:[["01","定義問題","先問「這會改變誰的哪個決策」，寫下第一天的假設答案。"],["02","拆成假設","用 MECE 議題樹拆成可以被資料證明或推翻的子問題。"],["03","用資料驗證","SQL、Python、統計檢定與模型，回答「多可信、多大、為什麼」。"],["04","轉成決策","先講結論，給出優先順序、門檻與下一步，並設計怎麼量成效。"]],
  featTitle:"精選案例", featMore:"全部案例 →",
  kbTitle:"這個網站本身也是作品", kbHint:"我把學過、用過的方法整理成一個會自己更新的知識庫",
  contactTitle:"一起聊聊？", contactText:"積極尋找商業企劃、數據分析與策略相關職缺。",
  /* 案例 */
  workEyebrow:"Case Studies", workTitle:"作品案例", workLede:"每個案例都用同一套結構呈現：30 秒摘要（SCQA）→ 議題樹 → 我怎麼做 → 發現與建議 → 如果重做一次。內部數字已依隱私原則移除。",
  all:"全部", readCase:"閱讀案例 →", caseCount:"個案例",
  scqaTitle:"30 秒摘要", scqaHint:"情境 → 衝突 → 問題 → 答案", S:"情境", C:"衝突", Q:"問題", A:"答案",
  treeTitle:"議題樹", treeHint:"深色分支是這個專案聚焦的地方",
  segTitle:"五個生命週期客群", segHint:"R、F、M 各切高／低得 8 格，再依業務意義收斂為 5 群",
  hypTitle:"假說檢定結果", hypHint:"單樣本 t 檢定，H₀：平均 = 3（中立），單尾",
  approachTitle:"我怎麼做", findTitle:"關鍵發現", recoTitle:"建議", impactTitle:"成果", reflectTitle:"如果重做一次", reflectHint:"我會怎麼做得更嚴謹",
  myRole:"我的角色", methodsUsed:"用到的方法", playbookLinks:"對應方法論", skillsUsed:"技能", prevCase:"← 上一個案例", nextCase:"下一個案例 →", backWork:"作品案例",
  /* 方法論 */
  methEyebrow:"Playbooks", methTitle:"我做事的方法", methLede:"三條職能線，各自對應一種工作：管顧思維對應策略顧問、數據分析與資料科學對應數據分析師、專案管理對應 PM。每一張卡都是我真的在用的做法，並連到我用過它的案例。",
  principles:"三個原則", when:"什麼時候用", steps:"怎麼做", example:"範例", template:"範本", pitfalls:"常見錯誤", usedIn:"我用在", kbLinks:"延伸到知識庫",
  openWorkflow:"打開完整的分析流程頁 →", trackCases:"看這條線的案例", trackResume:"索取對應版本的履歷",
  /* 小工具 */
  wTry:"試算看看", wSizingT:"市場規模估算器（漏斗 × 三情境）", wSizingS:"改數字看看：三個情境差在哪一個假設？",
  wPop:"目標母體（人）", wReach:"可觸及比例（%）", wConv:"基準轉換率（%）", wValue:"每位客戶年價值（元）", wLow:"保守情境倍數", wHigh:"樂觀情境倍數",
  wCons:"保守", wBase:"基準", wOpt:"樂觀", wPerYear:"／年",
  wSizingNote:"情境只改「轉換率」這一個假設，讓差距可以追溯到具體原因；實務上每個情境都應對應一組可觀察的領先指標。",
  wBeT:"損益兩平反推器", wBeS:"不是猜能賺多少，而是問：要多少轉換率提升才回本？",
  wInvest:"一次性投入（元）", wMargin:"每筆新增成交的貢獻（元）", wAud:"觸及名單人數", wBaseRate:"目前轉換率（%）",
  wNeedConv:"需要新增成交", wNeedPP:"需要提升（百分點）", wNeedRel:"相對提升", wBeNote:"若需要的相對提升遠高於同類活動的歷史表現，就是在告訴你：先別做，或先縮小投入做試點。",
  wSsT:"A/B 測試樣本數計算", wSsS:"雙尾檢定、兩組等量；看清楚「想偵測多小的效果」要付出多少流量。",
  wP:"基準轉換率（%）", wMde:"最小可偵測效果 MDE（相對 %）", wAlpha:"顯著水準 α", wPower:"檢定力 1−β", wTraffic:"每日進入實驗的人數",
  wNper:"每組樣本數", wNtot:"總樣本數", wDays:"預估天數", wSsNote:"MDE 減半，樣本數約變 4 倍。事先算好、跑滿再看結果；中途偷看要改用序貫檢定。",
  wChT:"因果推論方法選擇器", wChS:"回答幾個問題，找到最適合的識別策略。", wRestart:"重新開始", wOpen:"打開方法說明 →", wKey:"關鍵假設：",
  wRiceT:"RICE 排序器", wRiceS:"改分數看看排名怎麼變；分數是討論的起點，不是終點。",
  wItem:"項目", wReachR:"觸及（人／季）", wImpact:"影響", wConf:"信心（%）", wEffort:"工時（人月）", wScore:"RICE",
  /* 模型學習 */
  learnEyebrow:"Model Learning", learnTitle:"模型學習", learnLede:"把資料科學的知識整理成好查、好懂的樣子：每個方法先講白話直覺和適用情況，數學放在最後；另外追蹤 Hugging Face 上值得關注的新模型。",
  tRadar:"每日 HF 模型雷達", tRadarD:"從 Hugging Face 熱門榜挑出最值得一看的新模型，並連到背後的演算法。",
  tML:"ML 演算法知識樹", tMLD:"{n} 個機器學習演算法，依學習訊號、問題型態、模型家族分四層。",
  tStat:"統計 × 因果知識樹", tStatD:"{n} 個統計與因果推論方法：A/B 測試、DiD、合成控制、DML……",
  tCrit:"知識樹怎麼切", tCritD:"兩棵樹每一層的切分準則、邊界案例與 MECE 檢查。",
  tQuiz:"隨機抽考", tQuizD:"看白話描述猜方法，五分鐘複習一輪。", tFlow:"資料分析流程", tFlowD:"定義問題 → 資料品質 → 建模 → 落地，四階段的做法與檢核清單。",
  go:"前往 →", backLearn:"← 模型學習", backMethods:"← 方法論",
  /* 雷達 */
  radarEyebrow:"Daily AI Radar · Hugging Face", radarTitle:"今日有趣模型雷達", radarLede:"從 Hugging Face 熱門榜抓取，先過濾掉量化／轉檔等衍生版本，再依熱度動能、按讚速度、新鮮度、原創性與任務稀有度五個維度評分，挑出今天最值得一看的模型。",
  refresh:"更新資料", refreshT:"立即重新抓取 Hugging Face", fetching:"正在抓取最新資料…", noData:"尚無資料", dataTime:"資料時間",
  justNow:"剛剛", minAgo:"{n} 分鐘前", hrAgo:"{n} 小時前", dayAgo:"{n} 天前", monAgo:"{n} 個月前", hours:"{n} 小時", days:"{n} 天", months:"{n} 個月",
  rEmptyT:"雷達資料準備中", rEmptyD:"雷達資料會不定時更新，稍後再回來看看；知識庫的其他頁面現在就能使用。", rEmptyBtn:"先看資料分析流程 →",
  sFetched:"抓取模型", sPicks:"今日精選", sQuant:"已過濾的量化／轉檔版本", sNew:"今日新進榜", sVs:"（對比 {d}）", sUnit:"個", sTomorrow:"明天起可比較",
  distT:"今日熱門任務分布（不含量化轉檔）", wT:"有趣度評分權重", fullExpl:"完整說明", src:"來源", none:"無資料",
  allGroups:"全部", picks:"今日精選", fullList:"完整榜單", sortLabel:"排序", showQuant:"顯示量化／轉檔版本",
  sorts:[["score","依有趣度"],["trending","依 HF 熱度排名"],["velocity","依按讚速度"],["likes","依按讚數"],["downloads","依下載數"],["newest","依最新發布"]],
  noMatchT:"沒有符合條件的模型", noMatchD:"試試切換到「完整榜單」或選擇其他模態。", seeAll:"查看完整榜單（{n} 個）",
  interest:"有趣度", likes:"❤ 按讚", downloads:"⬇ 下載", heat:"🔥 熱度", age:"⏱ 上架", trendRank:"熱門榜 #{n}", pickRank:"今日精選第 {n} 名", trendRankT:"熱門榜第 {n} 名",
  untagged:"未標註任務", newEntry:"今日新進榜", paramsB:"{n}B 參數", activeB:"（啟用 {n}B）", relAlgo:"對應演算法", bd:"分數組成", bdHide:"收合分數", openHF:"在 HF 開啟 ↗",
  bdLabel:{momentum:"熱度動能", velocity:"按讚速度", recency:"新鮮度", originality:"原創性", rarity:"任務稀有度"},
  dataMode:"資料模式", modeServer:"本機伺服器", modeSnap:"隨機更新",
  /* 知識樹 */
  taxEyebrow:"Algorithm Taxonomy · MECE", taxTitle:"機器學習演算法知識樹", taxLede:"由上而下的 MECE 金字塔：每一層只用一個切分準則，點節點往下展開，點演算法看白話直覺、適用情況與數學細節。",
  statEyebrow:"Statistics × Causal Inference · MECE", statTitle:"統計推論 × 因果推論知識樹", statLede:"從「目標量是否涉及介入」切成兩大分支，涵蓋估計、檢定、建模、實驗設計與觀察資料的因果識別。",
  critEyebrow:"MECE Criteria", critTitle:"知識樹怎麼切", critLede:"兩棵樹每一層用什麼準則切分、為什麼互斥且窮盡，以及容易混淆的邊界案例。",
  crumbHint:"點下方節點往下展開", expandHint:"點選一個{a}，往下展開 L{n} {b}", byCrit:"依：",
  mlRoot:"機器學習演算法", mlRootDef:"任何學習演算法都在最佳化某個目標；目標所需的訊號來源決定了第一層的切分。", mlCrumb:"機器學習",
  mlLvl:["","學習範式","問題型態","模型家族","演算法"], mlLeafFork:"代表性演算法：點選查看直覺、適用情況與數學細節", mlLeafHint:"點選演算法，查看白話直覺、目標函數、複雜度與調參要點",
  mlRootSub:"{a} 範式 · {b} 型態 · {c} 家族 · {d} 演算法",
  stRoot:"統計與因果推論", stRootDef:"所有統計方法都在回答「從樣本能對母體說什麼」；第一層依目標量是否涉及介入來切分。", stCrumb:"統計因果",
  stLvl:["","推論類型","問題型態","方法家族","方法"], stLeafFork:"代表性方法：點選查看直覺、關鍵假設、診斷與工具", stLeafHint:"點選方法，查看核心直覺、公式、關鍵假設與診斷方式",
  stRootSub:"{a} 類型 · {b} 型態 · {c} 家族 · {d} 方法", detail:"詳情 ›", todayN:"今日 {n}", viewDetail:"查看 {n} 的詳情",
  /* 切分準則頁 */
  mtML:"ML 演算法知識樹", mtStat:"統計 × 因果知識樹", firstCut:"第一刀：", l1crit:"L1 準則", fourLv:"四層切分準則", fourLvHint:"每個節點的子分支都只用一個準則切分，保證互斥；準則本身的值域完整，保證窮盡。",
  l2ML:"各範式的 L2 切分", l2Stat:"各推論類型的 L2 切分", l2Hint:"箭頭後是該型態往下切 L3 的準則", critWord:"準則", l3by:"→ L3 依 ",
  bndT:"邊界案例：容易混淆的歸類", bndHint:"MECE 的品質取決於邊界怎麼判。", hybML:"組合範式", hybStat:"組合方法",
  hybMLHint:"不是新的學習訊號，而是上述範式的組合；因此不另設 L1。", hybStatHint:"實務上常把不同分支的方法串接使用；它們是組合，不是新的分支。",
  scoreT:"雷達的有趣度評分", scoreHint:"分數 = 100 × Σ 權重 × 維度分數（0–1）", weight:"權重", pickRule:"精選規則",
  pickRuleD:"排除量化轉檔與移除安全對齊版本；依分數貪婪挑選，同作者 ≤2、同任務 ≤3，不足時放寬",
  wd:{momentum:"HF trendingScore 在今日榜單中的百分位（對極端值穩健）", velocity:"按讚數 ÷ 上架天數 的百分位，抓「上升速度」而非累積量", recency:"exp(−天數 ÷ 14)，約兩週衰減一半的新鮮度", originality:"原創 1.0 ＞ 微調 0.45 ＞ 合併／Adapter 0.35 ＞ 量化轉檔 0", rarity:"1 − 該任務在今日榜單的占比，獎勵非 LLM 的模態"},
  notML:"複雜度符號", notStat:"常用符號",
  /* 流程 */
  wfEyebrow:"Analytics Workflow · 4 Stages", wfTitle:"資料分析流程", out:"產出：", flowAria:"分析流程四階段", loopT:"落地後的回饋，成為下一輪的問題定義",
  cmpAspect:"比較面向", howPick:"怎麼選", noLayer:"沒有整合層<br>口徑分散在各應用表", qHint:"每個維度都要有對應的自動化檢查", check:"檢查：",
  rtHint:"點方法可直接跳到對應的知識樹", rtType:"類型", rtQ:"典型問題", rtM:"方法家族", rtL:"到知識樹", key:"關鍵",
  tradeoffs:"關鍵取捨", tradeHint:"先看比較，再看「怎麼選」", core:"核心做法", checks:"檢核與避坑", confirm:"完成這一步前，確認：", traps:"常見陷阱",
  outExt:"產出與延伸", stepOut:"這一步的產出物", toKB:"延伸到知識樹", backTo:"回到", prin3:"貫穿全程的三個原則", mlTreeN:"ML 知識樹", statTreeN:"統計因果知識樹",
  /* 抽屜 */
  dPlain:"白話直覺", dWhen:"適合什麼情況", dUse:"◎ 適用場景", dPros:"✦ 優勢", dCons:"不適合／要小心的地方", dAssume:"關鍵假設與診斷", dAssumeH:"⚠ 關鍵假設（不成立時結論會偏）", dCheckH:"✓ 怎麼檢查",
  dHpML:"實務超參數調校要點", dHpStat:"實務設定要點", dTools:"常用工具", dMath:"數學細節（進階）", dMathHint:"想深入理解再看；只要會用，上面的內容就夠了。", dTech:"技術直覺",
  dObj:"目標函數／損失", dCx:"時間與空間複雜度", dTrain:"訓練", dInfer:"推論", dSpace:"空間", dSym:"符號：", dFormula:"核心公式／估計量", dNote:"歸類說明",
  dFamily:"同家族：", dOnly:"此家族僅收錄這一個代表{w}。", dAlgo:"演算法", dMethod:"方法", dHF:"今日雷達中的相關模型", dYear:"{y} 年", dPete:"我在哪裡用過", dInfo:"說明",
  /* 測驗 */
  quizEyebrow:"Quiz", quizTitle:"隨機抽考", quizLede:"看白話描述猜是哪個方法。答錯也沒關係，點「看詳情」就能複習。",
  qAll:"全部", qML:"ML 演算法", qStat:"統計與因果", qWhich:"這段描述的是哪一個方法？", qRight:"答對了！", qWrong:"再想想：正確答案是 {n}。", qNext:"下一題 →", qSee:"看詳情", qScore:"答對 {a} / {b}",
  /* 關於我 */
  aboutEyebrow:"About", expT:"經歷", projT:"專案與競賽", eduT:"學歷", skillT:"技能", certT:"證照", langT:"語言", contactT:"聯絡方式", factsT:"快速認識", seeCase:"看案例 →",
  /* 履歷 */
  resEyebrow:"Resume", repoT:"程式碼公開在 GitHub", repoText:"這是個人練習專案，完整程式碼與說明文件都放在 GitHub 上。", repoBtn:"看 GitHub 原始碼", resReqT:"對我的履歷有興趣嗎？", resReqText:"完整履歷不放在公開網站上。歡迎寄信給我，告訴我你在看哪個職缺，我會直接回信附上 PDF。", resReqPick:"想看哪個版本？", resReqMail:"寄信索取履歷", resReqSubject:"索取履歷｜{role}版本", resTitle:"網頁版履歷", resLede:"依職缺切換三個版本，可直接列印或另存 PDF。", print:"列印／存成 PDF", resFor:"版本：",
  rsSummary:"摘要", rsEdu:"學歷", rsExp:"工作經歷", rsProj:"領導與專案", rsSkills:"技能與證照", rsLang:"語言", rsCert:"證照",
  resNote:"網頁版已移除電話與實習公司內部數字；完整版履歷可透過 LinkedIn 索取。",
  /* 搜尋 */
  sCases:"案例", sPlay:"方法論", sAlgo:"ML 演算法", sStat:"統計／因果方法", sFlow:"資料分析流程", sNode:"知識樹節點", sModel:"今日模型",
  sEmpty:"站內找不到「{q}」。試試英文名、中文名或概念，或改用 Google 搜尋：", sGoogle:"不是你要找的嗎？改用 Google 搜尋「{q}」", sGoogle2:"用 Google 搜尋「{q}」", sGoogleSub:"在新分頁開啟 google.com 搜尋結果 ↗",
  sHint:"試試：", sTry:["RFM","XGBoost","DiD","市場規模","MECE","RICE","A/B 測試"],
  footNote:"© 2026 Pete Zhang · 本站內容中英雙語；案例中的內部數字已依隱私原則移除。", footKB:"知識庫", footResume:"履歷", footTop:"回到頂端 ↑",
  toastLang:"已切換為中文",
},
en: {
  skip:"Skip to content", brandName:"Pete Zhang", brandSub:"Strategy × Data × Delivery",
  navHome:"Home", navWork:"Case studies", navMethods:"Playbooks", navLearn:"Model Learning", navAbout:"About",
  navWorkShort:"Work", navMethodsShort:"Playbooks", navLearnShort:"Learn", navAboutShort:"About",
  searchBtn:"Search", searchPh:"Search cases, playbooks, algorithms, statistical methods or today's models…", accent:"Color theme", theme:"Toggle dark / light mode", close:"Close",
  langTo:"切換為中文",
  heroCta1:"See case studies", heroCta2:"Request my résumé", heroCta3:"LinkedIn",
  rolesTitle:"What kind of hire are you looking for?", rolesHint:"Pick a role to see the matching strengths and cases",
  rolePlaybook:"See this playbook", roleResume:"See this résumé version", roleCases:"Related cases",
  howTitle:"How I solve a problem", howHint:"Every case follows these four steps",
  how:[["01","Frame","Ask which decision this changes, and write down a Day-1 hypothesis."],["02","Decompose","Break it into a MECE issue tree of sub-questions data can prove or disprove."],["03","Validate","SQL, Python, statistical tests and models answer how sure, how big and why."],["04","Decide","Lead with the answer: priorities, thresholds, next steps — and how to measure impact."]],
  featTitle:"Featured cases", featMore:"All cases →",
  kbTitle:"This site is part of the portfolio", kbHint:"Everything I have learned and used, organized into a knowledge base that keeps itself current",
  contactTitle:"Let's talk", contactText:"Actively seeking roles in commercial planning, data analytics, and strategy.",
  workEyebrow:"Case Studies", workTitle:"Case studies", workLede:"Every case uses the same structure: a 30-second SCQA summary → issue tree → what I did → findings and recommendations → what I'd do differently. Internal figures are removed for confidentiality.",
  all:"All", readCase:"Read the case →", caseCount:"cases",
  scqaTitle:"30-second summary", scqaHint:"Situation → Complication → Question → Answer", S:"Situation", C:"Complication", Q:"Question", A:"Answer",
  treeTitle:"Issue tree", treeHint:"Highlighted branches are where the project focused",
  segTitle:"Five lifecycle tiers", segHint:"R, F and M split high/low gives 8 cells, consolidated into 5 tiers by business meaning",
  hypTitle:"Hypothesis tests", hypHint:"One-sample t-tests, H₀: mean = 3 (neutral), one-tailed",
  approachTitle:"What I did", findTitle:"Key findings", recoTitle:"Recommendations", impactTitle:"Outcome", reflectTitle:"What I'd do differently", reflectHint:"How I would make it more rigorous",
  myRole:"My role", methodsUsed:"Methods used", playbookLinks:"Related playbooks", skillsUsed:"Skills", prevCase:"← Previous case", nextCase:"Next case →", backWork:"Case studies",
  methEyebrow:"Playbooks", methTitle:"How I work", methLede:"Three tracks, one per role: the consulting toolkit for strategy consulting, data analytics & science for analyst roles, and project management for PM roles. Every card is something I actually use, linked to the cases where I used it.",
  principles:"Three principles", when:"When to use it", steps:"How to do it", example:"Example", template:"Template", pitfalls:"Common mistakes", usedIn:"Used in", kbLinks:"In the knowledge base",
  openWorkflow:"Open the full analytics workflow →", trackCases:"See cases for this track", trackResume:"Request the matching résumé",
  wTry:"Try it", wSizingT:"Market-sizing calculator (funnel × 3 scenarios)", wSizingS:"Change the inputs: which assumption drives the gap between scenarios?",
  wPop:"Target population", wReach:"Reachable share (%)", wConv:"Base conversion (%)", wValue:"Annual value per customer", wLow:"Conservative multiplier", wHigh:"Optimistic multiplier",
  wCons:"Conservative", wBase:"Base", wOpt:"Optimistic", wPerYear:"/yr",
  wSizingNote:"Scenarios change only the conversion assumption, so the gap traces back to one cause; in practice each scenario should map to observable leading indicators.",
  wBeT:"Breakeven back-solver", wBeS:"Don't guess the upside — ask how much lift you need to pay back the investment.",
  wInvest:"One-off investment", wMargin:"Contribution per extra sale", wAud:"Audience size", wBaseRate:"Current conversion (%)",
  wNeedConv:"Extra sales needed", wNeedPP:"Lift needed (pp)", wNeedRel:"Relative lift", wBeNote:"If the required relative lift is far above what similar campaigns achieved, the answer is: don't — or shrink the bet into a pilot first.",
  wSsT:"A/B test sample size", wSsS:"Two-sided test, equal groups: see what detecting a small effect really costs in traffic.",
  wP:"Baseline conversion (%)", wMde:"Minimum detectable effect (relative %)", wAlpha:"Significance α", wPower:"Power 1−β", wTraffic:"Daily users entering the test",
  wNper:"Per group", wNtot:"Total", wDays:"Estimated days", wSsNote:"Halving the MDE roughly quadruples the sample. Size it up front and run it to the end; if you must peek, use a sequential test.",
  wChT:"Causal method chooser", wChS:"Answer a few questions to find the right identification strategy.", wRestart:"Start over", wOpen:"Open the method →", wKey:"Key assumption: ",
  wRiceT:"RICE prioritizer", wRiceS:"Change the scores and watch the ranking move; the score starts the discussion, it doesn't end it.",
  wItem:"Initiative", wReachR:"Reach (per quarter)", wImpact:"Impact", wConf:"Confidence (%)", wEffort:"Effort (person-months)", wScore:"RICE",
  learnEyebrow:"Model Learning", learnTitle:"Model Learning", learnLede:"Data-science knowledge made easy to find and easy to understand: every method starts with plain-language intuition and when to use it, with the math last — plus a radar of Hugging Face models worth watching.",
  tRadar:"Daily HF model radar", tRadarD:"The most interesting new models from the Hugging Face trending list, linked to the algorithms behind them.",
  tML:"ML algorithm taxonomy", tMLD:"{n} machine-learning algorithms in four levels: learning signal, problem type, model family.",
  tStat:"Statistics × causal inference", tStatD:"{n} statistical and causal methods: A/B tests, DiD, synthetic control, DML…",
  tCrit:"How the trees are cut", tCritD:"The split criterion at every level, boundary cases and the MECE check.",
  tQuiz:"Random quiz", tQuizD:"Guess the method from a plain-language description — a five-minute review.", tFlow:"Analytics workflow", tFlowD:"Frame → data quality → modeling → delivery: practices and checklists for each stage.",
  go:"Open →", backLearn:"← Model Learning", backMethods:"← Playbooks",
  radarEyebrow:"Daily AI Radar · Hugging Face", radarTitle:"Today's interesting models", radarLede:"Pulled from the Hugging Face trending list, with quantized and format-converted re-uploads filtered out, then scored on momentum, like velocity, recency, originality and task rarity to surface the models most worth a look today.",
  refresh:"Refresh", refreshT:"Fetch the latest from Hugging Face now", fetching:"Fetching the latest data…", noData:"No data yet", dataTime:"Data as of",
  justNow:"just now", minAgo:"{n} min ago", hrAgo:"{n} h ago", dayAgo:"{n} d ago", monAgo:"{n} mo ago", hours:"{n} h", days:"{n} d", months:"{n} mo",
  rEmptyT:"Radar data is on its way", rEmptyD:"The radar refreshes from time to time — check back later. The rest of the knowledge base works right now.", rEmptyBtn:"See the analytics workflow →",
  sFetched:"Models fetched", sPicks:"Today's picks", sQuant:"Quantized / converted filtered", sNew:"New on the list", sVs:" (vs {d})", sUnit:"", sTomorrow:"comparable from tomorrow",
  distT:"Trending tasks today (excl. quantized)", wT:"Interest-score weights", fullExpl:"Full explanation", src:"Source", none:"No data",
  allGroups:"All", picks:"Today's picks", fullList:"Full list", sortLabel:"Sort", showQuant:"Show quantized / converted",
  sorts:[["score","By interest"],["trending","By HF trending rank"],["velocity","By like velocity"],["likes","By likes"],["downloads","By downloads"],["newest","Newest first"]],
  noMatchT:"No models match", noMatchD:"Try the full list or another modality.", seeAll:"See the full list ({n})",
  interest:"interest", likes:"❤ Likes", downloads:"⬇ Downloads", heat:"🔥 Trending", age:"⏱ Age", trendRank:"Trending #{n}", pickRank:"Today's pick #{n}", trendRankT:"Trending rank #{n}",
  untagged:"Untagged task", newEntry:"New today", paramsB:"{n}B params", activeB:" ({n}B active)", relAlgo:"Algorithms", bd:"Score breakdown", bdHide:"Hide breakdown", openHF:"Open on HF ↗",
  bdLabel:{momentum:"Momentum", velocity:"Like velocity", recency:"Recency", originality:"Originality", rarity:"Task rarity"},
  dataMode:"Data mode", modeServer:"Local server", modeSnap:"Periodic snapshot",
  taxEyebrow:"Algorithm Taxonomy · MECE", taxTitle:"Machine-learning algorithm taxonomy", taxLede:"A top-down MECE pyramid: each level uses a single split criterion. Click a node to expand it; click an algorithm for its intuition, use cases and math.",
  statEyebrow:"Statistics × Causal Inference · MECE", statTitle:"Statistics × causal inference taxonomy", statLede:"Split first on whether the target quantity involves an intervention, covering estimation, testing, modeling, experimental design and causal identification from observational data.",
  critEyebrow:"MECE Criteria", critTitle:"How the trees are cut", critLede:"The split criterion at every level of both trees, why the branches are mutually exclusive and collectively exhaustive, and the boundary cases that are easy to confuse.",
  crumbHint:"Click a node below to expand it", expandHint:"Pick a {a} to expand L{n} {b}", byCrit:"By: ",
  mlRoot:"Machine-learning algorithms", mlRootDef:"Every learning algorithm optimizes some objective; where its learning signal comes from defines the first split.", mlCrumb:"ML",
  mlLvl:["","paradigm","problem type","model family","algorithm"], mlLeafFork:"Representative algorithms: click for intuition, use cases and math", mlLeafHint:"Click an algorithm for its intuition, objective, complexity and tuning tips",
  mlRootSub:"{a} paradigms · {b} problem types · {c} families · {d} algorithms",
  stRoot:"Statistics & causal inference", stRootDef:"Every statistical method answers what a sample can tell us about a population; the first split is whether the target involves an intervention.", stCrumb:"Stats & causal",
  stLvl:["","inference type","problem type","method family","method"], stLeafFork:"Representative methods: click for intuition, key assumptions, diagnostics and tools", stLeafHint:"Click a method for its intuition, formulas, key assumptions and diagnostics",
  stRootSub:"{a} types · {b} problem types · {c} families · {d} methods", detail:"Details ›", todayN:"Today {n}", viewDetail:"See details for {n}",
  mtML:"ML algorithm taxonomy", mtStat:"Statistics × causal taxonomy", firstCut:"The first cut: ", l1crit:"L1 criterion", fourLv:"Split criteria by level", fourLvHint:"Each node's children are split by one criterion (mutually exclusive), and that criterion's range is complete (collectively exhaustive).",
  l2ML:"L2 splits within each paradigm", l2Stat:"L2 splits within each inference type", l2Hint:"After the arrow: the criterion used for the L3 split", critWord:"Criterion", l3by:"→ L3 by ",
  bndT:"Boundary cases", bndHint:"The quality of a MECE structure depends on how the boundaries are judged.", hybML:"Hybrid paradigms", hybStat:"Combined methods",
  hybMLHint:"Not new learning signals but combinations of the paradigms above, so they get no L1 of their own.", hybStatHint:"In practice methods from different branches are chained together; they are combinations, not new branches.",
  scoreT:"How the radar scores models", scoreHint:"Score = 100 × Σ weight × factor score (0–1)", weight:"Weight", pickRule:"Pick rules",
  pickRuleD:"Exclude quantized re-uploads and safety-removed versions; greedy selection by score with at most 2 per author and 3 per task, relaxed if needed",
  wd:{momentum:"Percentile of HF trendingScore on today's list (robust to outliers)", velocity:"Percentile of likes ÷ days since release: speed, not accumulation", recency:"exp(−days ÷ 14): freshness that halves in about two weeks", originality:"Original 1.0 > fine-tune 0.45 > merge / adapter 0.35 > quantized 0", rarity:"1 − the task's share of today's list, rewarding non-LLM modalities"},
  notML:"Complexity notation", notStat:"Common notation",
  wfEyebrow:"Analytics Workflow · 4 Stages", wfTitle:"Analytics workflow", out:"Output: ", flowAria:"Four stages of the analytics workflow", loopT:"Feedback after delivery becomes the next round's problem definition",
  cmpAspect:"Aspect", howPick:"How to choose", noLayer:"No integration layer<br>definitions scattered across app tables", qHint:"Every dimension needs an automated check", check:"Check: ",
  rtHint:"Click a method to jump into the knowledge base", rtType:"Type", rtQ:"Typical question", rtM:"Method family", rtL:"Knowledge base", key:"Key",
  tradeoffs:"Key trade-offs", tradeHint:"Read the comparison, then 'how to choose'", core:"Core practices", checks:"Checks & pitfalls", confirm:"Before you finish this stage, confirm:", traps:"Common traps",
  outExt:"Outputs & links", stepOut:"Deliverables of this stage", toKB:"Into the knowledge base", backTo:"Back to", prin3:"Three principles throughout", mlTreeN:"ML taxonomy", statTreeN:"Stats & causal taxonomy",
  dPlain:"Plain-language intuition", dWhen:"When it fits", dUse:"◎ Use cases", dPros:"✦ Strengths", dCons:"Where it doesn't fit / watch out", dAssume:"Key assumptions & diagnostics", dAssumeH:"⚠ Key assumptions (results are biased if they fail)", dCheckH:"✓ How to check",
  dHpML:"Practical tuning tips", dHpStat:"Practical settings", dTools:"Common tools", dMath:"The math (advanced)", dMathHint:"For a deeper understanding; to use the method, the sections above are enough.", dTech:"Technical intuition",
  dObj:"Objective / loss", dCx:"Time and space complexity", dTrain:"Training", dInfer:"Inference", dSpace:"Space", dSym:"Notation: ", dFormula:"Core formulas / estimators", dNote:"Classification note",
  dFamily:"Same family: ", dOnly:"This family has a single representative {w}.", dAlgo:"algorithm", dMethod:"method", dHF:"Related models on today's radar", dYear:"{y}", dPete:"Where I've used it", dInfo:"Info",
  quizEyebrow:"Quiz", quizTitle:"Random quiz", quizLede:"Guess the method from its plain-language description. Wrong answers are fine — open the details to review.",
  qAll:"All", qML:"ML algorithms", qStat:"Stats & causal", qWhich:"Which method does this describe?", qRight:"Correct!", qWrong:"Not quite: the answer is {n}.", qNext:"Next →", qSee:"See details", qScore:"{a} / {b} correct",
  aboutEyebrow:"About", expT:"Experience", projT:"Leadership & projects", eduT:"Education", skillT:"Skills", certT:"Certification", langT:"Languages", contactT:"Contact", factsT:"At a glance", seeCase:"See the case →",
  resEyebrow:"Résumé", repoT:"The code is on GitHub", repoText:"A personal practice project; the full code and README are on GitHub.", repoBtn:"View on GitHub", resReqT:"Interested in my résumé?", resReqText:"My full résumé isn't published here. Email me with the role you're hiring for and I'll reply with a PDF.", resReqPick:"Which version?", resReqMail:"Email me for my résumé", resReqSubject:"Résumé request | {role}", resTitle:"Web résumé", resLede:"Switch between three versions by role; print or save as PDF.", print:"Print / save as PDF", resFor:"Version: ",
  rsSummary:"Summary", rsEdu:"Education", rsExp:"Experience", rsProj:"Leadership & Projects", rsSkills:"Skills & Certifications", rsLang:"Languages", rsCert:"Certification",
  resNote:"The web version omits phone number and internal company figures; the full résumé is available on request via LinkedIn.",
  sCases:"Cases", sPlay:"Playbooks", sAlgo:"ML algorithms", sStat:"Stats & causal methods", sFlow:"Analytics workflow", sNode:"Taxonomy nodes", sModel:"Today's models",
  sEmpty:"Nothing on this site matches \"{q}\". Try another name or concept, or search Google:", sGoogle:"Not what you need? Search Google for \"{q}\"", sGoogle2:"Search Google for \"{q}\"", sGoogleSub:"Opens google.com in a new tab ↗",
  sHint:"Try: ", sTry:["RFM","XGBoost","DiD","market sizing","MECE","RICE","A/B test"],
  footNote:"© 2026 Pete Zhang · Bilingual site; internal figures in case studies are removed for confidentiality.", footKB:"Knowledge base", footResume:"Résumé", footTop:"Back to top ↑",
  toastLang:"Switched to English",
}};
function t(k, vars){
  let s = (UI[LANG] && k in UI[LANG]) ? UI[LANG][k] : UI.zh[k];
  if (s == null) return k;
  if (vars && typeof s === "string") s = s.replace(/\{(\w+)\}/g, (_, v) => v in vars ? vars[v] : "{" + v + "}");
  return s;
}
const nf = () => new Intl.NumberFormat(isEN() ? "en-US" : "zh-TW");
const nfCompact = () => new Intl.NumberFormat(isEN() ? "en-US" : "zh-TW", {notation:"compact", maximumFractionDigits:1});
const fmtN = n => (n == null || isNaN(n)) ? "—" : (Math.abs(n) >= 10000 ? nfCompact().format(n) : nf().format(n));
function relTime(iso){
  if (!iso) return "—"; const tm = new Date(iso).getTime(); if (isNaN(tm)) return "—";
  const m = (Date.now() - tm) / 60000;
  if (m < 1) return t("justNow"); if (m < 60) return t("minAgo", {n:Math.round(m)});
  const h = m / 60; if (h < 24) return t("hrAgo", {n:Math.round(h)});
  const d = h / 24; if (d < 30) return t("dayAgo", {n:Math.round(d)});
  return t("monAgo", {n:Math.round(d / 30)});
}
function fmtLocal(iso){
  const d = new Date(iso); if (!iso || isNaN(d)) return "";
  const p = n => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}
function ageLabel(days){
  if (days == null) return "—";
  if (days < 1) return t("hours", {n:Math.max(1, Math.round(days*24))});
  if (days < 60) return t("days", {n:Math.round(days)});
  return t("months", {n:Math.round(days/30)});
}

/* ═════════════════════════ 數學（KaTeX） ═════════════════════════ */
const TEX_CACHE = new Map();
function texHtml(src, big){
  const key = (big ? "D:" : "i:") + src;
  if (TEX_CACHE.has(key)) return TEX_CACHE.get(key);
  let out;
  try { out = window.katex ? katex.renderToString((big ? "\\displaystyle " : "") + src, {throwOnError:false, strict:"ignore"}) : `<code>${esc(src)}</code>`; }
  catch(e){ out = `<code>${esc(src)}</code>`; }
  TEX_CACHE.set(key, out); return out;
}
function rich(s, big=false){
  const str = String(s ?? "");
  if (str.indexOf("$") < 0) return esc(str);
  return str.split("$").map((p, i) => i % 2 ? texHtml(p, big) : esc(p)).join("");
}
function formulaGroups(src){
  const groups = [];
  for (const line of String(src ?? "").split("\n")){
    const tt = line.trim(), g = groups[groups.length - 1];
    if (g && /^\$\\q?quad\b/.test(tt) && g.joined.trimEnd().endsWith("$")){
      g.joined = g.joined.trimEnd().slice(0, -1) + " " + tt.slice(1).replace(/^\\q?quad\s*/, "");
      g.lines.push(line); g.label = false; continue;
    }
    if (g && g.label && tt.startsWith("$")){ g.joined += tt; g.lines.push(line); g.label = false; continue; }
    groups.push({joined: line, lines: [line], label: !tt.includes("$") && /[：:]\s*$/.test(tt)});
  }
  return groups;
}
const formulaHtml = s => formulaGroups(s).map(g => g.lines.length === 1
  ? `<div class="fl">${rich(g.lines[0], true)}</div>`
  : `<div class="fgroup"><div class="fl fl-one">${rich(g.joined, true)}</div><div class="fl-multi">${g.lines.map(l => `<div class="fl">${rich(l, true)}</div>`).join("")}</div></div>`).join("");
function fitFormulas(root){
  $$(".fgroup", root || document).forEach(g => {
    g.classList.remove("split");
    const one = g.querySelector(".fl-one");
    if (one && one.scrollWidth > one.clientWidth + 1) g.classList.add("split");
  });
}
const plainTex = s => String(s ?? "").replace(/\\(?:text|mathrm|texttt|operatorname\*?|mathbb|mathcal)\{([^}]*)\}/g, " $1 ").replace(/\\[a-zA-Z]+/g, " ").replace(/[$\\{}_^]/g, " ");

/* ═════════════════════════ 資料 ═════════════════════════ */
const DATA = {
  tax: {zh: J("d-tax-zh"), en: J("d-tax-en")},
  stat: {zh: J("d-stat-zh"), en: J("d-stat-en")},
  wf: {zh: J("d-wf-zh"), en: J("d-wf-en")},
};
const PROFILE = J("d-profile");
const PLAYBOOK = J("d-playbook");   // [track, track, track]
const CASES = PROFILE.cases;
const CASE = Object.fromEntries(CASES.map(c => [c.id, c]));
const TRACK = Object.fromEntries(PLAYBOOK.map(tr => [tr.id, tr]));
let TAX, STAT, WF, TREES;
const NODES = Object.create(null);
const LEAVES_BY = { ml: [], stat: [] };
const TREE_VIEW = { ml: "taxonomy", stat: "stats" };
function indexTrees(){
  TAX = DATA.tax[LANG]; STAT = DATA.stat[LANG]; WF = DATA.wf[LANG];
  TREES = { ml: TAX, stat: STAT };
  for (const k in NODES) delete NODES[k];
  LEAVES_BY.ml = []; LEAVES_BY.stat = [];
  for (const [key, T] of Object.entries(TREES)){
    T.children.forEach(l1 => {
      NODES[l1.id] = {node:l1, level:1, parents:[], tree:key};
      l1.children.forEach(l2 => {
        NODES[l2.id] = {node:l2, level:2, parents:[l1], tree:key};
        l2.children.forEach(l3 => {
          NODES[l3.id] = {node:l3, level:3, parents:[l1,l2], tree:key};
          l3.leaves.forEach(lf => { NODES[lf.id] = {node:lf, level:4, parents:[l1,l2,l3], tree:key}; LEAVES_BY[key].push(lf); });
        });
      });
    });
  }
}
indexTrees();
const countLevel = (key, lvl) => Object.values(NODES).filter(n => n.tree === key && n.level === lvl).length;
const shortName = n => { const m = /^(.*?)[（(](.*?)[）)]\s*$/.exec(n.name); if (!m) return n.name; return /^[A-Za-z0-9\- ]{2,12}$/.test(m[2]) ? m[2] : m[1].trim(); };
const leafCount = n => n.leaves ? n.leaves.length : (n.children || []).reduce((a,c) => a + leafCount(c), 0);
/* 反查：哪些案例、哪些方法論卡片用到某個知識庫方法 */
const USED_IN = {};
CASES.forEach(c => (c.methods || []).forEach(m => { const id = typeof m === "string" ? m : m.id; (USED_IN[id] = USED_IN[id] || []).push(c.id); }));

/* ═════════════════════════ 狀態 ═════════════════════════ */
const state = {
  view: "home", data: null, source: "none", server: false, refreshing: false,
  group: "all", sort: "score", showQuant: false, listMode: "picks",
  stage: "frame", mtree: "ml", caseId: null, track: "consulting", openItem: null,
  role: "consulting", workFilter: "all", resTrack: "consulting", quiz: {pool:"all", n:0, ok:0, cur:null, answered:false},
};

/* ═════════════════════════ 通知 ═════════════════════════ */
function toast(msg){
  const el = document.createElement("div"); el.className = "toast"; el.textContent = msg; el.setAttribute("role","status");
  document.body.appendChild(el); setTimeout(() => el.remove(), 4200);
}

/* ═════════════════════════ 圖示 ═════════════════════════ */
const ICON = {
  radar:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><path d="M12 12 19 5"/><circle cx="12" cy="12" r="1.2" fill="currentColor"/>',
  tree:'<rect x="9" y="2.5" width="6" height="5" rx="1.2"/><rect x="2.5" y="16.5" width="6" height="5" rx="1.2"/><rect x="15.5" y="16.5" width="6" height="5" rx="1.2"/><path d="M12 7.5v4M5.5 16.5v-2.5h13v2.5M12 11.5v2.5"/>',
  stats:'<path d="M3.5 3.5v17h17"/><path d="M6.5 17 19 6.5"/><circle cx="8" cy="11" r="1.2" fill="currentColor"/><circle cx="12" cy="14.5" r="1.2" fill="currentColor"/><circle cx="14" cy="8.5" r="1.2" fill="currentColor"/><circle cx="17.5" cy="13" r="1.2" fill="currentColor"/>',
  doc:'<path d="M4 4h11l5 5v11H4z"/><path d="M15 4v5h5M8 13h8M8 17h5"/>',
  quiz:'<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6v.6"/><circle cx="12" cy="17" r=".9" fill="currentColor"/>',
  flow:'<circle cx="5" cy="5.5" r="2.5"/><circle cx="19" cy="18.5" r="2.5"/><path d="M7.5 5.5H15a3.25 3.25 0 0 1 0 6.5H9a3.25 3.25 0 0 0 0 6.5h7.5"/>',
  compass:'<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5z"/>',
  chart:'<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
  kanban:'<rect x="3" y="4" width="18" height="16" rx="2.5"/><path d="M9 4v16M15 4v16M5.5 8h1.5M11.5 8h1.5M11.5 12h1.5M17.5 8h1.5"/>',
  linkedin:'<rect x="3" y="3" width="18" height="18" rx="4"/><path d="M8 10v6M8 7.5v.01M12 16v-3.5a2 2 0 0 1 4 0V16M12 10v6"/>',
  github:'<path d="M9 19c-4.3 1.4-4.3-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21"/>',
  mail:'<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="m4 7 8 6 8-6"/>',
  print:'<path d="M7 9V3h10v6M7 17H4v-6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v6h-3"/><rect x="7" y="14" width="10" height="7" rx="1"/>',
  chev:'<path d="m6 9 6 6 6-6"/>',
};
const ic = (k, s=20) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON[k] || ""}</svg>`;
const TRACK_ICON = {consulting:"compass", data:"chart", pm:"kanban"};
