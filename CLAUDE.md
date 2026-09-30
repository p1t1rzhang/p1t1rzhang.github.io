# 專案工作規則（給 Claude）

Pete 的資料科學網站：https://p1t1rzhang.github.io/ （repo：p1t1rzhang/p1t1rzhang.github.io）

## 版本控制分工
- **Claude 只修改資料夾裡的檔案**，不執行 `git add / commit / push / reset` 等會寫入 git 的指令。
- **Pete 用 GitHub Desktop** 檢查差異、commit 到 `main` 並 push；推上 `main` 後 GitHub Actions 約 1–3 分鐘自動部署。
- 盡量不要在這台電腦上執行任何 git 指令（連 `git status` 都會留下 `.git/index.lock`，讓 GitHub Desktop 卡住）。需要看差異時改用檔案比對；若不得已執行，結束後確認已刪除 `.git/index.lock`。

## 修改流程
1. 內容改 `src/taxonomy.json`（ML）、`src/stat_taxonomy.json`（統計因果）、`src/workflow.json`（分析流程）；前端改 `src/index.template.html`。不要直接改根目錄的 `index.html`。
2. 改完執行 `python3 src/build.py` 重新產生 `index.html`（會檢查 id 重複與連結）。
3. 用瀏覽器實際打開檢查，再告訴 Pete 改了哪些檔案，讓他在 GitHub Desktop 檢查後 commit。

## 內容慣例
- 全站繁體中文。
- 每個演算法／方法：`plain`（白話直覺，一兩句＋生活比喻，不放公式）放最前面；`intuition`（技術直覺）、`objective`（公式）、`complexity` 集中在說明頁最後的「數學細節（進階）」。新增方法時兩個欄位都要寫。
- 公式用 LaTeX 包在 `$…$`，JSON 中反斜線寫兩次。
