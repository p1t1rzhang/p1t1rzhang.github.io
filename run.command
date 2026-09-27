#!/bin/bash
# ─────────────────────────────────────────────────────────────
# 方案 B（無後端純靜態）：在 Finder 按兩下即可
#   1. 執行 fetch_hf.py 抓取今日 Hugging Face 熱門模型
#   2. 用預設瀏覽器開啟 index.html
# 抓取失敗時仍會開啟頁面，並顯示上一次成功的資料。
# ─────────────────────────────────────────────────────────────
cd "$(dirname "$0")" || exit 1
echo "🌸 Model Learning · 每日模型雷達"
echo "────────────────────────────────"
PY="$(command -v python3 || true)"
if [ -z "$PY" ]; then
  echo "❌ 找不到 python3。請先安裝 Python 3：https://www.python.org/downloads/ 或 brew install python"
  read -n 1 -s -r -p "按任意鍵關閉…"; exit 1
fi
if "$PY" fetch_hf.py; then
  echo "✅ 資料已更新"
else
  echo "⚠️  本次抓取失敗，將以上一次的資料開啟儀表板（知識樹不受影響）"
fi
open "index.html"
sleep 1
