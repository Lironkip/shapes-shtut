#!/bin/sh
# Renders tools/og.html → assets/og-image.png (1200×630) with headless Chrome.
cd "$(dirname "$0")/.."
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --disable-gpu --hide-scrollbars \
  --force-device-scale-factor=1 --allow-file-access-from-files --virtual-time-budget=6000 \
  --window-size=1200,630 --screenshot="$(pwd)/assets/og-image.png" "file://$(pwd)/tools/og.html" >/dev/null 2>&1
echo "assets/og-image.png"
