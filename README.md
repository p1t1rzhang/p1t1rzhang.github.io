# Pete's website

**🔗 https://p1t1rzhang.github.io/**

張方燡（Fang-I Pete Zhang）的個人網站：策略顧問 × 數據分析 × 專案管理。中英雙語，一鍵切換。

| 頁面 | 內容 |
|---|---|
| 首頁 | 點狀球捲動敘事：角色、數字、近況 |
| 關於我 | 自我介紹、學歷、經歷、專案、技能 |
| 作品案例 | 每個案例公開「情境 → 衝突 → 問題 → 答案」摘要；完整拆解與履歷來信索取 |
| 方法論 | 管顧思維、數據分析與資料科學、專案管理三條線的做法卡 |
| 模型學習 | 143 個 ML／統計／因果方法的雙語知識庫，與每日 Hugging Face 模型雷達 |

## 針對職缺的連結

`?for=consulting`、`?for=da`、`?for=pm`，可加 `&co=公司名`，例如
`https://p1t1rzhang.github.io/?for=da&co=Deloitte` → 首頁先秀對應角色，履歷索取信件自動帶入版本與公司名。

## 建置

```bash
python3 src/build.py          # 產生 index.html、og-image.jpg、robots.txt、sitemap.xml、llms.txt
```

- 推上 `main` 後由 GitHub Actions 重建並部署；每天也會自動更新模型雷達。
- `src/data/profile.json` 只放**公開版**資料。完整履歷與案例細節不在這個 repo。

## 結構

```
src/
  template.html                 頁面骨架
  tokens.css legacy.css styles.css design.css ez.css
  app_core.js app_kb.js app_pages.js app_home.js app_ez.js app_boot.js
  build.py                      內嵌所有資料成單一 index.html
  data/                         個人資料（公開版）、方法論、知識樹、模型雷達快照
  vendor/                       KaTeX、字型、分頁圖示、頭像、分享預覽圖
fetch_hf.py                     抓取 Hugging Face 熱門模型
server.py / start_server.command 本機預覽與更新雷達
```
