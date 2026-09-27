#!/bin/bash
# ─────────────────────────────────────────────────────────────
# 安裝「每日自動抓取」排程（macOS launchd，使用者層級，不需 sudo）
#   bash install_daily_mac.sh            # 每天 08:30 執行（預設）
#   bash install_daily_mac.sh 07 45      # 自訂時間：每天 07:45
#   bash install_daily_mac.sh --uninstall
# Mac 在排定時間睡眠時，launchd 會在下次喚醒後補跑一次。
# ─────────────────────────────────────────────────────────────
set -euo pipefail
DIR="$(cd "$(dirname "$0")" && pwd)"
LABEL="com.modellearning.fetchhf"
PLIST="$HOME/Library/LaunchAgents/$LABEL.plist"
UID_NUM="$(id -u)"

if [ "${1:-}" = "--uninstall" ]; then
  launchctl bootout "gui/$UID_NUM/$LABEL" 2>/dev/null || launchctl unload "$PLIST" 2>/dev/null || true
  rm -f "$PLIST"; echo "✅ 已移除每日排程"; exit 0
fi

HOUR="${1:-08}"; MIN="${2:-30}"
PY="$(command -v python3 || true)"
[ -z "$PY" ] && { echo "❌ 找不到 python3"; exit 1; }
mkdir -p "$DIR/logs" "$HOME/Library/LaunchAgents"

cat > "$PLIST" <<PLIST_EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key><string>$LABEL</string>
  <key>ProgramArguments</key>
  <array>
    <string>$PY</string>
    <string>$DIR/fetch_hf.py</string>
    <string>--quiet</string>
  </array>
  <key>WorkingDirectory</key><string>$DIR</string>
  <key>StartCalendarInterval</key>
  <dict><key>Hour</key><integer>$((10#$HOUR))</integer><key>Minute</key><integer>$((10#$MIN))</integer></dict>
  <key>StandardOutPath</key><string>$DIR/logs/fetch.log</string>
  <key>StandardErrorPath</key><string>$DIR/logs/fetch.log</string>
</dict>
</plist>
PLIST_EOF

launchctl bootout "gui/$UID_NUM/$LABEL" 2>/dev/null || true
launchctl bootstrap "gui/$UID_NUM" "$PLIST" 2>/dev/null || launchctl load -w "$PLIST"
echo "✅ 已安裝：每天 $(printf %02d $((10#$HOUR))):$(printf %02d $((10#$MIN))) 自動執行 fetch_hf.py"
echo "   紀錄檔：$DIR/logs/fetch.log"
echo "   立即測試：launchctl kickstart -k gui/$UID_NUM/$LABEL"
case "$DIR" in
  "$HOME/Desktop"*|"$HOME/Documents"*|"$HOME/Downloads"*)
    echo ""
    echo "⚠️  注意：此資料夾位於「桌面／文件／下載項目」，macOS 可能禁止背景排程存取這些位置。"
    echo "   若 logs/fetch.log 出現 Operation not permitted，請把整個資料夾移到例如 ~/ModelLearning 後重新執行本腳本。"
    echo "   （不建議為 python3 開啟「完整磁碟取用權限」：那會讓所有 Python 程式都能讀取你的全部檔案。）" ;;
esac
