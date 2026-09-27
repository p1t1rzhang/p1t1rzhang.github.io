#!/usr/bin/env bash
# 跨平台版的方案 B：bash run.sh（macOS / Linux / Windows Git Bash）
set -u
cd "$(dirname "$0")" || exit 1
PY="$(command -v python3 || command -v python || true)"
[ -z "$PY" ] && { echo "❌ 找不到 Python 3"; exit 1; }
"$PY" fetch_hf.py "$@" || echo "⚠️  抓取失敗，將顯示上一次的資料"
case "$(uname -s)" in
  Darwin) open index.html ;;
  Linux)  xdg-open index.html >/dev/null 2>&1 || echo "請手動開啟 $(pwd)/index.html" ;;
  *)      start index.html 2>/dev/null || echo "請手動開啟 index.html" ;;
esac
