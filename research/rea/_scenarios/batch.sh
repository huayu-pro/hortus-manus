#!/bin/bash
# REA batch evidence collection for HORTUS MANUS.
# For each site: launch CDP Chromium at that URL, run inspect-web-page + analyze-web-bundle
# (passive CDP Evidence), then a provider-owned capture-browser-scenario (launch mode),
# then export-web-scripts from the capture. Everything saved under research/rea/{slug}/.
set -u
ROOT="/home/huayu/Agent工作区/DSHarness/1/hortus-manus/research/rea"
EXE="$HOME/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome"
PORT=9223
REA="npx -y rea-agents@latest"
mkdir -p "$ROOT/_scenarios"

# slug|url|why
SITES=(
"kern-society|https://shockingmike.github.io/kern-society|gsap+ScrollTrigger+SplitText+Lenis+canvas; type-foundry kinetic type"
"voice-tag-gods|https://voicetaggods.com|gsap+ScrollTrigger+SplitText; 2 canvases; audio-reel art direction"
"everline-studio|https://onepagelove.com/go/everline-studio|Squarespace; gsap+Typed; 2 canvases; studio portfolio"
"swash|https://swashmotion.com/|Vercel; lenis; motion studio one-pager"
"bausola-banch|https://banch.bausola.com/|Next.js on Vercel; 3 canvases; editorial architecture studio"
"superlocal-2026|https://www.superlocaldesign.com/|Vercel; lenis; 3 canvases; design studio scroll choreography"
"possible-monuments|https://possiblemonuments.se/|Matter.js physics canvas; memorial project"
"dabbit|https://dabbit.app|Astro; 8 canvases; color-picker product page with shader-ish visuals"
"duo-case|https://www.duocase.lol|gsap+ScrollTrigger+SplitText+Lenis; e-commerce one-pager"
"magma|https://magma.build|gsap+ScrollTrigger+SplitText+Lenis; AI tool one-pager"
"isa-de-burgh|https://isadeburgh.com|gsap+ScrollTrigger+SplitText; artist portfolio"
"jopecuro|https://jopecuro.com|gsap+ScrollTrigger+Lenis; photography portfolio"
)

wait_cdp() {
  for i in $(seq 1 40); do
    if curl -s --max-time 2 "http://127.0.0.1:$PORT/json/version" >/dev/null 2>&1; then return 0; fi
    sleep 0.5
  done
  return 1
}

for entry in "${SITES[@]}"; do
  slug="${entry%%|*}"; rest="${entry#*|}"; url="${rest%%|*}"; why="${rest#*|}"
  out="$ROOT/$slug"; mkdir -p "$out"
  echo "=== $slug  $url"
  echo "$url" > "$out/source-url.txt"; echo "$why" > "$out/why.txt"
  # kill previous CDP browser
  pkill -f "user-data-dir=/tmp/rea-batch" 2>/dev/null; sleep 1
  "$EXE" --headless=new --no-sandbox --disable-dev-shm-usage --enable-unsafe-swiftshader \
    --remote-debugging-port=$PORT --user-data-dir=/tmp/rea-batch \
    --proxy-server=http://127.0.0.1:7897 --proxy-bypass-list='127.0.0.1;localhost' \
    --window-size=1440,900 --mute-audio "$url" > /tmp/rea-chrome-$slug.log 2>&1 &
  CHROME_PID=$!
  if ! wait_cdp; then echo "CDP_FAILED" > "$out/LIMITATION.txt"; kill $CHROME_PID 2>/dev/null; continue; fi
  sleep 4
  TARGET=$(curl -s "http://127.0.0.1:$PORT/json/list" | python3 -c "
import json,sys
ts=json.load(sys.stdin)
pages=[t for t in ts if t.get('type')=='page' and t.get('url','').startswith('http')]
print(pages[0]['id'] if pages else '')")
  ORIGIN=$(python3 -c "
from urllib.parse import urlparse;u=urlparse('$url');print(f'{u.scheme}://{u.netloc}')")
  echo "target=$TARGET origin=$ORIGIN"
  if [ -z "$TARGET" ]; then echo "NO_TARGET" > "$out/LIMITATION.txt"; kill $CHROME_PID 2>/dev/null; continue; fi
  # 1) passive inspect
  timeout 150 $REA list-browser-targets "http://127.0.0.1:$PORT" --allowed-origins "$ORIGIN" --format json > "$out/list-browser-targets.json" 2>"$out/list.err"
  timeout 200 $REA inspect-web-page "http://127.0.0.1:$PORT" "$TARGET" --allowed-origins "$ORIGIN" \
    --observation-ms 3000 --include-script-sources --include-console-text --include-storage-keys \
    --format json > "$out/inspect-web-page.json" 2>"$out/inspect.err" || echo "inspect failed" > "$out/inspect.LIMITATION"
  # 2) bundle analysis
  timeout 240 $REA analyze-web-bundle "http://127.0.0.1:$PORT" "$TARGET" --allowed-origins "$ORIGIN" \
    --observation-ms 2500 --format json > "$out/analyze-web-bundle.json" 2>"$out/analyze.err" || echo "analyze failed" > "$out/analyze.LIMITATION"
  kill $CHROME_PID 2>/dev/null; sleep 1
  # 3) provider-owned scenario capture (launch mode, screenshots + dom + console/network events)
  cat > "$ROOT/_scenarios/$slug.json" <<JSON
{
  "browser": {"mode": "launch", "executable_path": "$EXE", "headless": true},
  "start_url": {"url": "$url", "query": []},
  "environment": {"viewport": {"width": 1440, "height": 900, "device_scale_factor": 1}, "locale": "en-US", "timezone": "UTC", "color_scheme": "light", "reduced_motion": "no-preference", "service_workers": "allow"},
  "actions": [
    {"step_id": "settle", "action": "wait_for_timeout", "duration_ms": 2500},
    {"step_id": "scroll1", "action": "press", "key": "PageDown", "locator": {"kind": "css", "selector": "body"}},
    {"step_id": "settle2", "action": "wait_for_timeout", "duration_ms": 1200},
    {"step_id": "scroll2", "action": "press", "key": "PageDown", "locator": {"kind": "css", "selector": "body"}},
    {"step_id": "settle3", "action": "wait_for_timeout", "duration_ms": 1200}
  ],
  "capture": {"after_each_step": ["screenshot", "url"], "at_end": ["dom", "url", "screenshot"], "events": ["console", "network"], "network": {"request_body": false, "response_body": false, "header_values": false}}
}
JSON
  timeout 260 $REA capture-browser-scenario "$ROOT/_scenarios/$slug.json" --format json > "$out/capture-browser-scenario.json" 2>"$out/capture.err" || echo "capture failed" > "$out/capture.LIMITATION"
  # 4) export scripts from the capture (best effort)
  if [ -s "$out/capture-browser-scenario.json" ]; then
    timeout 120 $REA export-web-scripts "$out/capture-browser-scenario.json" "$out/scripts" --format json > "$out/export-web-scripts.json" 2>"$out/export.err" || echo "export failed" > "$out/export.LIMITATION"
  fi
  # record exact commands
  cat > "$out/COMMANDS.txt" <<CMDS
rea list-browser-targets http://127.0.0.1:$PORT --allowed-origins $ORIGIN
rea inspect-web-page http://127.0.0.1:$PORT $TARGET --allowed-origins $ORIGIN --observation-ms 3000 --include-script-sources --include-console-text --include-storage-keys
rea analyze-web-bundle http://127.0.0.1:$PORT $TARGET --allowed-origins $ORIGIN --observation-ms 2500
rea capture-browser-scenario _scenarios/$slug.json
rea export-web-scripts $slug/capture-browser-scenario.json $slug/scripts
# CDP browser: $EXE --headless=new --no-sandbox --enable-unsafe-swiftshader --remote-debugging-port=$PORT --user-data-dir=/tmp/rea-batch --proxy-server=http://127.0.0.1:7897 "$url"
CMDS
  echo "done $slug: $(du -sh "$out" | cut -f1)"
done
echo "ALL_DONE"
