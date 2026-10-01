# 專案工作規則（給 Claude）

Pete's website：https://p1t1rzhang.github.io/ （repo：p1t1rzhang/p1t1rzhang.github.io）

## 版本控制分工
- **Claude 只修改資料夾裡的檔案**，不執行 `git add / commit / push / reset / merge / branch` 等會寫入 git 的指令，不論是在這台 Mac 或在雲端。
- 唯一例外：Pete **當次**明確說「推上去」或「上線」，而且只推那一次；之後的修改仍回到「改檔案＋給 commit 摘要」。不要自己判斷「順便」推送。
- Pete 請 Claude「檢查」git 狀況時，只做唯讀檢查並說明；要重設、刪檔、建分支前先問。
- **Pete 用 GitHub Desktop** 檢查差異、commit 到 `main` 並 push；推上 `main` 後 GitHub Actions 約 1–3 分鐘自動部署。
- 盡量不要在這台電腦上執行任何 git 指令（連 `git status` 都會留下 `.git/index.lock`，讓 GitHub Desktop 卡住）。需要看差異時改用檔案比對；若不得已執行，結束後確認已刪除 `.git/index.lock`。

## 隱私（最重要）
- 這個 repo 是**公開的**。`src/data/profile.json` 只能放公開版資料：完整履歷、案例的議題樹／分析步驟／發現／反思、實習公司內部數字一律不放。
- 完整版資料只留在本機 `versions/`（已被 .gitignore 排除）。
- 不寫 Pete 沒做過的事；方法、數字都要有 CV、作品檔或 GitHub 可對照。

## 修改流程
1. 內容改 `src/data/`（`profile.json` 個人資料與案例、`playbook_*.json` 方法論、`taxonomy*.json` / `stat_taxonomy*.json` / `workflow*.json` 知識庫）；前端改 `src/template.html`、`src/*.css`、`src/app_*.js`。不要直接改根目錄的 `index.html`。
2. 改完執行 `python3 src/build.py` 重新產生 `index.html`（同時產生 og-image.jpg、robots.txt、sitemap.xml、llms.txt）。
3. 用瀏覽器實際打開檢查（中／英、手機、深色模式），再告訴 Pete 改了哪些檔案，讓他在 GitHub Desktop 檢查後 commit。
4. **每次修改完都要附上 commit 摘要**，對應 GitHub Desktop 左下角的兩個欄位，放在程式碼區塊方便複製：
   - **Summary**（必填）：一行、50 字以內，說明這次改了什麼。repo 是公開的：commit 訊息不寫具體數字、公司內部資訊或個人資料，用中性描述（例如「更新關於我的文字」）。
   - **Description**（選填）：條列重點，每行以「- 」開頭，寫改了哪些功能與檔案、需要注意的地方。
   - 若改動包含不相關的多件事，建議拆成幾個 commit，並分別給摘要與對應檔案。
   - Pete 會累積多次修改才一起 commit：每次都直接給**涵蓋所有未 commit 改動的完整新摘要**。

## 內容慣例
- 全站中英雙語（繁體中文為主），右下角一鍵切換。
- 作品依日期排序（最新在前）；`tail` 欄位可指定放在最後的作品。開源練習專案用 `repo` 欄位連到 GitHub。
- 履歷不公開，履歷頁只放「寫信索取」。
- 雷達資料：只有 Mac 執行 `start_server.command` 時才抓新資料；公開網站的資料在推送 `main`、每日排程或手動 Run workflow 時更新。
- 每個演算法／方法：`plain`（白話直覺）放最前面；`intuition`、`objective`（公式）、`complexity` 放在最後的「數學細節（進階）」。
- 公式用 LaTeX 包在 `$…$`，JSON 中反斜線寫兩次。
- 配色：主色＋淡色＋白三色。可切換五個主題（酒紅預設、冰川藍、銀、黑、深紫）。顏色都用 `:root` 的 CSS 變數（`--brand`、`--pink*`），不要寫死色碼，並確認五個主題 × 淺色／深色都看得清楚。
