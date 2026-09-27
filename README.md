# Model Learning：資料科學知識庫 × 每日 AI 模型雷達

**🔗 網站：https://p1t1rzhang.github.io/**　｜　每天台灣時間早上自動更新　｜　手機、電腦皆可瀏覽

把資料科學需要的知識整理成「由上而下、互斥且窮盡（MECE）」的知識樹，搭配一條從定義問題到落地的分析流程，再加上每天自動更新的 Hugging Face 熱門模型雷達。

---

## 內容

| 模組 | 內容 |
|---|---|
| **資料分析流程** | 01 定義問題（問題驅動 vs 資料驅動）→ 02 資料與品質（三層 vs 兩層架構、ETL vs ELT、六大品質維度）→ 03 建模與分析（問題類型 → 方法路由）→ 04 落地與價值（批次 vs 即時、上線驗證、監控）。每階段附比較表、檢核清單、常見陷阱與產出物 |
| **ML 演算法知識樹** | 4 大學習範式 → 13 種問題型態 → 46 個模型家族 → **102 個演算法**。每個演算法附數學直覺、目標函數、時間／空間複雜度、優缺點、適用場景與調參要點 |
| **統計推論 × 因果推論知識樹** | 2 大推論類型 → 6 種問題型態 → 20 個方法家族 → **41 個方法**（MLE、Bootstrap、假設檢定、GLM、存活分析、A/B 測試、CUPED、DiD、合成控制、RDD、IV、PSM、IPW、AIPW、DML、因果森林……）。每個方法附核心直覺、公式、**關鍵假設與診斷方式**、設定要點與常用工具 |
| **每日 AI 模型雷達** | 抓取 Hugging Face 熱門榜，過濾量化／轉檔版本，依 5 個維度評「有趣度」，精選當天最值得看的模型，並連結到知識樹中對應的演算法 |

## 特色

- **金字塔式知識樹**：從第一層往下點開，每個分岔都標示「依什麼準則切分」；方法論頁整理了容易混淆的邊界案例（例如：CUPED 為何不算觀察性調整、「顯著」為何不等於因果）。
- **公式正式排版**：所有公式以 LaTeX 撰寫、KaTeX 渲染，手機上不需左右捲動。
- **流程與知識樹互相連結**：分析流程的「問題類型 → 方法家族」可直接跳到對應的樹節點。
- **全文搜尋與書籤網址**：按 `⌘K` 或 `/` 搜尋演算法、統計方法、概念與流程；每個方法都有自己的網址。
- **單一檔案、離線可用**：資料與公式引擎都內嵌在 `index.html`，沒有外部相依。支援深色模式與手機版面。

### 快速導覽
- XGBoost：https://p1t1rzhang.github.io/#algo/xgboost
- 差異中的差異（DiD）：https://p1t1rzhang.github.io/#algo/did
- 準實驗設計：https://p1t1rzhang.github.io/#node/cau-quasi
- 分析流程・資料與品質：https://p1t1rzhang.github.io/#flow/data

---

## 運作方式

```
每天 08:17（台灣時間）            推送到 main
        │                              │
        └──────────┬───────────────────┘
                   ▼
        GitHub Actions（.github/workflows/）
          ├─ fetch_hf.py 抓取 Hugging Face 熱門榜並評分 → 存到 data 分支（含每日快照）
          ├─ src/build.py 把知識庫資料與 KaTeX 內嵌成 index.html
          └─ 發佈到 GitHub Pages
```

- 每日資料由機器人存在獨立的 **`data` 分支**，與內容所在的 `main` 分支分開，互不衝突。
- 抓取失敗時沿用上一次的資料，網站照常發佈。

### 雷達如何挑出「有趣」的模型

1. **過濾衍生版本**：依 Hugging Face 的 `base_model:quantized / finetune / adapter / merge` 標籤，以及 GGUF、MLX、AWQ、GPTQ 等格式辨識轉檔版本，預設隱藏（網頁可切換顯示）。
2. **有趣度評分（0–100）** ＝ 100 × Σ 權重 × 維度分數：

   | 維度 | 權重 | 計算方式 |
   |---|---|---|
   | 熱度動能 | 35% | HF `trendingScore` 在當日榜單中的百分位 |
   | 按讚速度 | 25% | 按讚數 ÷ 上架天數 的百分位（看上升速度，而非累積量） |
   | 新鮮度 | 15% | exp(−天數 ÷ 14) |
   | 原創性 | 15% | 原創 1.0 ＞ 微調 0.45 ＞ 合併／Adapter 0.35 ＞ 量化轉檔 0 |
   | 任務稀有度 | 10% | 1 − 該任務在榜單的占比（獎勵非 LLM 的模態） |

3. **多樣性精選**：排除量化轉檔與移除安全對齊的版本；依分數挑選，同作者最多 2 個、同任務最多 3 個。

權重可在 `fetch_hf.py` 最上方的 `WEIGHTS`、`RECENCY_HALF_LIFE_DAYS`、`ORIGINALITY` 調整。

---

## 知識樹的切分邏輯

### ML 演算法知識樹

| 層級 | 名稱 | 切分準則 |
|---|---|---|
| L1 | 學習範式 | **學習訊號的來源**：外部標籤（監督）／資料結構本身（非監督）／從資料構造的代理目標（自監督與生成）／環境獎勵（強化學習） |
| L2 | 問題型態 | 各範式各用一個準則：監督依**輸入依存拓撲**（表格／序列／網格／圖）、非監督依**產出物型態**（分群／座標／典型程度／變數關係）、自監督依**代理目標構造方式**（預測／聯合嵌入／生成）、強化學習依**動作是否改變狀態**（Bandit／MDP） |
| L3 | 模型家族 | 同一問題下依**假設空間與歸納偏誤**區分（正規化線性、核方法、梯度提升樹、擴散……） |
| L4 | 具體演算法 | 每個演算法只出現一次，依其最典型的訓練目標歸位 |

監督式的 L2 不直接分「迴歸／分類」，因為 XGBoost、隨機森林、KNN 等兩者都能做，這樣切會讓同一演算法出現兩次、違反互斥。

### 統計推論 × 因果推論知識樹

| 層級 | 名稱 | 切分準則 |
|---|---|---|
| L1 | 推論類型 | **目標量是否涉及介入**：關聯 P(Y \| X)（統計推論）／介入效果 P(Y \| do(X))（因果推論） |
| L2 | 問題型態 | 統計推論依**推論產出的形式**（估計區間／檢定判斷／關聯模型）；因果推論依**處理的分配機制**（隨機分配＝實驗／外生規則或事件＝準實驗／個體自行選擇＝觀察性調整） |
| L3 | 方法家族 | 各型態各用一個準則：不確定性量化方式、檢定流程環節、資料結構、實驗要克服的難題、外生變異來源、目標估計量（ATE vs CATE） |
| L4 | 具體方法 | 每個方法只出現一次，依最典型用途歸位 |

---

## 在本機使用

需要 Python 3（只用標準函式庫，不必安裝套件）。

| 方式 | 做法 |
|---|---|
| 只看知識庫 | 直接用瀏覽器打開 `index.html`，完全離線可用 |
| 抓今日資料並開啟 | `python3 fetch_hf.py && open index.html`（macOS 可對 `run.command` 按兩下；Linux 用 `run.sh`） |
| 本機伺服器 | `python3 server.py` → http://127.0.0.1:8765 ；資料過期時會在背景自動更新（macOS 可對 `start_server.command` 按兩下） |
| 每天自動抓取（macOS） | `bash install_daily_mac.sh`（預設 08:30；`--uninstall` 移除）。若資料夾放在「桌面／文件／下載項目」，macOS 可能阻擋背景存取，建議放在家目錄下的其他資料夾 |

> 第一次打開 `.command` 檔若出現「無法打開，因為它來自未識別的開發者」，請改用 **右鍵 → 打開**。

常用參數：

```bash
python3 fetch_hf.py --limit 100 --top 15    # 抓 100 筆、精選 15 筆
HF_TOKEN=hf_xxx python3 fetch_hf.py         # 帶 token 提高 API 額度（選用，勿把 token 寫進檔案）
python3 server.py --port 9000 --no-browser
```

## 修改內容

1. 編輯 `src/taxonomy.json`（ML）、`src/stat_taxonomy.json`（統計因果）或 `src/workflow.json`（分析流程）。新增方法時，在對應 L3 的 `leaves` 陣列加一個物件，欄位參考現有項目（`id` 在兩棵樹之間必須唯一，只用小寫英數與 `-`）。
2. **公式寫法**：數學用 LaTeX 包在 `$…$` 內，其餘文字照常寫，例如 `閉式解：$\\hat{\\beta} = (X^\\top X)^{-1} X^\\top y$`（JSON 中反斜線要寫兩次）。以 `\n` 分行；過長的式子請拆行。
3. 執行 `python3 src/build.py`：會檢查 id 是否重複、流程頁連結是否有效，並重新產生 `index.html`。
4. 推送到 `main`，約 1–3 分鐘後網站自動更新。

## 部署到你自己的 GitHub Pages

1. Fork 這個 repo（想要 `https://帳號.github.io/` 的網址，就把 repo 命名為 `帳號.github.io`；其他名稱會是 `https://帳號.github.io/repo 名稱/`）。
2. **Settings → Pages → Build and deployment → Source** 選 **GitHub Actions**。
3. Fork 的 repo 預設停用 Actions：到 **Actions** 分頁按啟用，再選「每日更新與部署」→ **Run workflow**。
4. 約 1–3 分鐘後即可瀏覽；之後每天自動更新。GitHub Pages 與 Actions 對公開 repo 免費。

---

## 專案結構

```
├── index.html               ← 網站本體（由 src/build.py 產生，已內嵌所有資料）
├── fetch_hf.py              ← 抓取與評分管線（Python 標準函式庫）
├── server.py                ← 本機伺服器（只綁定 127.0.0.1）
├── run.command / run.sh     ← 抓取並開啟
├── start_server.command     ← 啟動本機伺服器
├── install_daily_mac.sh     ← macOS 每日排程（launchd）
├── .github/workflows/       ← 每日更新與部署（GitHub Actions）
└── src/
    ├── taxonomy.json        ← ML 知識樹
    ├── stat_taxonomy.json   ← 統計推論 × 因果推論知識樹
    ├── workflow.json        ← 資料分析流程
    ├── index.template.html  ← 前端樣板
    ├── vendor/katex/        ← KaTeX（MIT 授權），建置時連同字型內嵌
    └── build.py             ← 建置與檢查
```

本機執行 `fetch_hf.py` 時會另外產生 `daily_models.json`、`daily_models.js` 與 `history/`（已列入 `.gitignore`，不會上傳）。

## 疑難排解

| 狀況 | 解法 |
|---|---|
| 找不到 `python3` | 安裝 Python 3（python.org 或 `brew install python`），或依提示安裝 Command Line Tools |
| SSL 憑證驗證失敗 | python.org 版 Python 需執行一次 `Install Certificates.command`，或 `pip3 install certifi` |
| HTTP 429 | API 請求過於頻繁，稍後再試，或設定 `HF_TOKEN` |
| 抓取失敗 | 舊資料不會被覆蓋，網站照常顯示上一次的結果 |
| Actions 發佈失敗 | 確認 **Settings → Pages** 的 Source 是 **GitHub Actions**，再 **Re-run all jobs** |
| 排程沒有準時執行 | GitHub 排程在尖峰時段可能延後數十分鐘，屬正常現象；可隨時手動 **Run workflow** |

---

## 資料來源與致謝

- 模型資料：[Hugging Face Hub](https://huggingface.co) 公開 API（`/api/models?sort=trendingScore`、`/api/trending`）。
- 公式渲染：[KaTeX](https://katex.org)（MIT 授權，見 `src/vendor/katex/LICENSE`）。
- 演算法與統計方法內容為學習用途的整理；複雜度與公式以常見實作與原始論文為準，實際表現依實作與資料而異。
