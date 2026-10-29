#!/usr/bin/env bash
# HORTUS MANUS — API smoke test.
#
# Exercises the whole local chain against a running API:
#   health -> create -> list -> get -> card/og/qr -> share SSR -> thanks
#   -> validation -> rate limit -> delete -> 404 -> persistence
#
# Usage:
#   ./scripts/smoke.sh                 # API assumed at http://127.0.0.1:8787
#   BASE=http://127.0.0.1:8787 ./scripts/smoke.sh
#   ./scripts/smoke.sh --save          # also write docs/api-smoke.txt
#   ./scripts/smoke.sh --rate-limit   # include section 9, which deliberately
#                                      # exhausts this IP's hourly collect budget
#                                      # (only do this on a throwaway server)
#
# The rate-limit section deliberately burns the hourly collect budget for this
# IP (the limit is read from /api/health, so it follows HORTUS_RL_COLLECT, which
# start.sh raises to 60 for the local demo). Use a scratch data dir to keep the
# real budget intact:
#   HORTUS_DATA_DIR=/tmp/hortus-smoke PORT=8799 pnpm -F @hortus/api start

set -uo pipefail

BASE="${BASE:-http://127.0.0.1:8787}"
SAVE=0
RATE_LIMIT=0
for arg in "$@"; do
  case "$arg" in
    --save) SAVE=1 ;;
    --rate-limit) RATE_LIMIT=1 ;;
    -h|--help) sed -n '2,16p' "$0"; exit 0 ;;
  esac
done

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

PASS=0
FAIL=0
declare -a RESULTS=()

C_OK=$'\033[32m'; C_BAD=$'\033[31m'; C_DIM=$'\033[2m'; C_OFF=$'\033[0m'
if [ ! -t 1 ]; then C_OK=""; C_BAD=""; C_DIM=""; C_OFF=""; fi

line() { printf '%s\n' "------------------------------------------------------------"; }
say()  { printf '%s\n' "$*"; }
ok()   { PASS=$((PASS+1)); RESULTS+=("PASS  $1"); printf '  %s✔%s %s\n' "$C_OK" "$C_OFF" "$1"; }
bad()  { FAIL=$((FAIL+1)); RESULTS+=("FAIL  $1  ($2)"); printf '  %s✘%s %s  %s(%s)%s\n' "$C_BAD" "$C_OFF" "$1" "$C_DIM" "$2" "$C_OFF"; }

# expect <label> <expected-code> <actual-code> [extra-check-command]
expect() {
  local label="$1" want="$2" got="$3"
  if [ "$got" = "$want" ]; then ok "$label [$got]"; else bad "$label" "want $want, got $got"; fi
}

# http <method> <path> [data] -> writes body to $TMP/body, headers to $TMP/head,
#                                echoes the status code
http() {
  local method="$1" path="$2" data="${3:-}" out="$TMP/body"
  local args=(-sS -X "$method" "$BASE$path" -D "$TMP/head" -o "$out" -w '%{http_code}')
  if [ -n "$data" ]; then args+=(-H 'Content-Type: application/json' --data-binary "$data"); fi
  if [ -n "${AUTH:-}" ]; then args+=(-H "Authorization: Bearer $AUTH"); fi
  curl "${args[@]}" 2>"$TMP/curl.err" || { echo "000"; }
}

body() { cat "$TMP/body"; }
jqv()  { jq -r "$1" "$TMP/body" 2>/dev/null; }
hdr()  { grep -i "^$1:" "$TMP/head" 2>/dev/null | head -1 | sed "s/^$1: //I" | tr -d '\r'; }
hdr_ci() { grep -i "^$1:" "$TMP/head" 2>/dev/null | head -1 | cut -d' ' -f2- | tr -d '\r'; }

say ""
say "  HORTUS MANUS · 指间花园 — API smoke"
say "  base: $BASE"
say "  date: $(date -Is)"
line

# ---------------------------------------------------------------- 0. prerequisites
if ! command -v jq >/dev/null 2>&1; then say "jq is required."; exit 1; fi
if ! curl -sS -m 5 "$BASE/api/health" -o "$TMP/health.json" 2>/dev/null; then
  say "API is not reachable at $BASE — start it with: pnpm -F @hortus/api start"
  exit 1
fi

# ---------------------------------------------------------------- 1. health
say "1. health"
code=$(http GET /api/health); expect "GET /api/health" 200 "$code"
jq -e '.ok == true' "$TMP/body" >/dev/null 2>&1 && ok "health.ok = true" || bad "health.ok" "db not ok"
jq -e '.counts.specimens | numbers' "$TMP/body" >/dev/null 2>&1 && ok "health.counts.specimens present" || bad "health counts" "missing"
[ -z "$(hdr cache-control)" ] && ok "health has no cache-control" || ok "health cache-control: $(hdr cache-control)"
grep -qi 'no-store' "$TMP/head" && ok "health is no-store" || bad "health cache" "expected no-store"
[ -n "$(hdr etag)" ] && bad "health etag" "health should not be cached" || ok "health has no ETag"

# ---------------------------------------------------------------- 2. create
say "2. create specimen"
CLIENT_ID="$(python3 - <<'PY'
import uuid; print(uuid.uuid4())
PY
)"
PAYLOAD=$(jq -nc --arg cid "$CLIENT_ID" '{mode:"frame",season:"spring",seed:2317827271,caption:"窗里那株牡丹，跟着我的掌开合。",lang:"zh",clientId:$cid}')
code=$(http POST /api/specimens "$PAYLOAD"); expect "POST /api/specimens" 201 "$code"
ID=$(jqv '.specimen.id'); TOKEN=$(jqv '.deleteToken')
[ ${#ID} -eq 12 ] && ok "id is 12 chars ($ID)" || bad "id length" "got '${ID}'"
[ ${#TOKEN} -ge 20 ] && ok "deleteToken returned (${#TOKEN} chars)" || bad "deleteToken" "missing"
[ -n "$(hdr cache-control)" ] && grep -qi 'no-store' "$TMP/head" && ok "create is no-store" || bad "create cache" "expected no-store"
jq -e --arg id "$ID" '.specimen.shareUrl | endswith("/s/" + $id)' "$TMP/body" >/dev/null && ok "shareUrl points at /s/:id" || bad "shareUrl" "unexpected"
jq -e '.specimen.cardUrl | endswith("/card.png")' "$TMP/body" >/dev/null && ok "cardUrl present" || bad "cardUrl" "missing"
[ -n "$(grep -o 'deleteToken' "$TMP/body")" ] && ! grep -qi 'delete_token_hash' "$TMP/body" && ok "token is returned, hash is not leaked" || bad "token leak" "hash in response"

# ---------------------------------------------------------------- 3. list
say "3. list + filters"
code=$(http GET "/api/specimens?limit=5"); expect "GET /api/specimens" 200 "$code"
jq -e '.items | length <= 5' "$TMP/body" >/dev/null && ok "list respects limit" || bad "list limit" "too many items"
grep -qi 'max-age=15' "$TMP/head" && ok "list cache-control 15s" || bad "list cache" "expected max-age=15"
ETAG_LIST=$(hdr etag)
AUTH="" code=$(http GET "/api/specimens?limit=5" "" ); :
curl -sS -o /dev/null -D "$TMP/head304" -H "If-None-Match: $ETAG_LIST" "$BASE/api/specimens?limit=5" -w '%{http_code}' > "$TMP/code304"
expect "list If-None-Match -> 304" 304 "$(cat "$TMP/code304")"
code=$(http GET "/api/specimens?mode=frame&season=spring&sort=new&limit=3"); expect "list with mode/season/sort" 200 "$code"
code=$(http GET "/api/specimens?limit=0"); expect "list limit=0 rejected" 422 "$code"
code=$(http GET "/api/specimens?mode=bogus"); expect "list bad mode rejected" 422 "$code"
code=$(http GET "/api/specimens?sort=nope"); expect "list bad sort rejected" 422 "$code"

# ---------------------------------------------------------------- 4. detail
say "4. detail"
code=$(http GET "/api/specimens/$ID"); expect "GET /api/specimens/:id" 200 "$code"
grep -qi 'max-age=60' "$TMP/head" && ok "detail cache-control 60s" || bad "detail cache" "expected max-age=60"
ETAG_DETAIL=$(hdr etag)
code304=$(curl -sS -o /dev/null -H "If-None-Match: $ETAG_DETAIL" "$BASE/api/specimens/$ID" -w '%{http_code}')
expect "detail If-None-Match -> 304" 304 "$code304"
code=$(http GET "/api/specimens/zzzzzzzzzzzz"); expect "detail unknown id -> 404" 404 "$code"
jq -e '.error == "not_found"' "$TMP/body" >/dev/null && ok "404 body {error,message}" || bad "404 body" "unexpected shape"
code=$(http GET "/api/specimens/not-an-id"); expect "detail malformed id -> 422" 422 "$code"

# ---------------------------------------------------------------- 5. card / og / qr
say "5. card.png / og.png / qr.png"
code=$(http GET "/api/specimens/$ID/card.png"); expect "card.png" 200 "$code"
SIZE=$(stat -c %s "$TMP/body" 2>/dev/null || stat -f %z "$TMP/body")
TYPE=$(hdr content-type)
[ "$TYPE" = "image/png" ] && ok "card content-type image/png" || bad "card type" "got '$TYPE'"
[ "$SIZE" -gt 100000 ] && ok "card is a real PNG (${SIZE}B)" || bad "card size" "too small ($SIZE)"
grep -qi 'immutable' "$TMP/head" && ok "card cache immutable" || bad "card cache" "expected immutable"
ETAG_CARD=$(hdr etag)
code304=$(curl -sS -o /dev/null -H "If-None-Match: $ETAG_CARD" "$BASE/api/specimens/$ID/card.png" -w '%{http_code}')
expect "card If-None-Match -> 304" 304 "$code304"
code=$(http GET "/api/specimens/$ID/card.png"); [ "$(hdr etag)" = "$ETAG_CARD" ] && ok "card ETag stable across requests" || bad "card etag" "changed between requests"
CARD1_SHA=$(sha256sum "$TMP/body" 2>/dev/null | cut -d' ' -f1)
http GET "/api/specimens/$ID/card.png" >/dev/null; CARD2_SHA=$(sha256sum "$TMP/body" 2>/dev/null | cut -d' ' -f1)
[ "$CARD1_SHA" = "$CARD2_SHA" ] && ok "card bytes deterministic" || bad "card determinism" "bytes differ"
DATA_DIR="$(curl -sS "$BASE/api/health" | jq -r '.dataDir' 2>/dev/null)"
[ -f "$DATA_DIR/cards/$ID.png" ] && ok "card cached on disk ($DATA_DIR/cards/$ID.png)" || say "  (note) card cache file not found under $DATA_DIR/cards"

code=$(http GET "/api/specimens/$ID/og.png"); expect "og.png" 200 "$code"
OSIZE=$(stat -c %s "$TMP/body" 2>/dev/null || stat -f %z "$TMP/body")
[ "$OSIZE" -gt 50000 ] && ok "og is a real PNG (${OSIZE}B)" || bad "og size" "too small"
grep -qi 'immutable' "$TMP/head" && ok "og cache immutable" || bad "og cache" "expected immutable"

code=$(http GET "/api/specimens/$ID/qr.png?size=320"); expect "qr.png?size=320" 200 "$code"
[ "$(hdr content-type)" = "image/png" ] && ok "qr content-type image/png" || bad "qr type" "unexpected"
grep -qi 'immutable' "$TMP/head" && ok "qr cache immutable" || bad "qr cache" "expected immutable"
code=$(http GET "/api/specimens/$ID/qr.png?size=64"); expect "qr size out of range -> 422" 422 "$code"
code=$(http GET "/api/specimens/zzzzzzzzzzzz/card.png"); expect "card for unknown id -> 404" 404 "$code"

# ---------------------------------------------------------------- 6. share SSR
say "6. share page SSR"
code=$(http GET "/s/$ID"); expect "GET /s/:id" 200 "$code"
HTML_SIZE=$(stat -c %s "$TMP/body" 2>/dev/null || stat -f %z "$TMP/body")
[ "$HTML_SIZE" -gt 3000 ] && ok "share HTML is substantial (${HTML_SIZE}B)" || bad "share size" "too small"
for needle in 'og:title' 'og:image' 'twitter:card' 'application/ld+json' 'canonical' '/card.png' '/qr.png'; do
  grep -q "$needle" "$TMP/body" && ok "share has $needle" || bad "share meta" "missing $needle"
done
grep -qi 'no-cache' "$TMP/head" && ok "share Cache-Control: no-cache" || bad "share cache" "expected no-cache"
grep -q "127.0.0.1:8787/s/$ID" "$TMP/body" && ok "share page links its own absolute URL" || say "  (note) absolute share URL uses a different origin"
code=$(http GET "/s/zzzzzzzzzzzz"); expect "share unknown id -> 404" 404 "$code"
grep -q "还没有被压进纸里" "$TMP/body" && ok "404 page uses the contract copy" || bad "404 copy" "missing contract line"

# ---------------------------------------------------------------- 7. thanks
say "7. thanks"
code=$(http POST "/api/specimens/$ID/thanks" '{}'); expect "POST thanks" 200 "$code"
jq -e '.ok == true and (.thanks >= 1)' "$TMP/body" >/dev/null && ok "thanks counted (now $(jqv '.thanks'))" || bad "thanks count" "unexpected"
code=$(http POST "/api/specimens/$ID/thanks" '{}'); expect "thanks is idempotent per visitor/day" 200 "$code"
jq -e '.duplicate == true' "$TMP/body" >/dev/null && ok "second thanks marked duplicate" || bad "thanks duplicate" "not marked"
grep -qi 'no-store' "$TMP/head" && ok "thanks is no-store" || bad "thanks cache" "expected no-store"
code=$(http POST "/api/specimens/zzzzzzzzzzzz/thanks" '{}'); expect "thanks unknown id -> 404" 404 "$code"

# ---------------------------------------------------------------- 8. validation
say "8. validation"
code=$(http POST /api/specimens '{"mode":"bogus","season":"spring","seed":1}'); expect "bad mode -> 422" 422 "$code"
code=$(http POST /api/specimens '{"mode":"frame","season":"spring","seed":4294967296}'); expect "seed > uint32 -> 422" 422 "$code"
code=$(http POST /api/specimens '{"mode":"frame","season":"spring","seed":-1}'); expect "negative seed -> 422" 422 "$code"
code=$(http POST /api/specimens '{"mode":"frame","season":"spring","seed":1,"caption":"abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz0123456789ABCDEF"}'); expect "caption > 80 chars -> 422" 422 "$code"
code=$(http POST /api/specimens "$(printf '{"mode":"frame","season":"spring","seed":1,"caption":"a\\u0000b"}')"); expect "control char in caption -> 422" 422 "$code"
code=$(http POST /api/specimens '{"mode":"frame","season":"spring","seed":1,"lang":"fr"}'); expect "bad lang -> 422" 422 "$code"
code=$(http POST /api/specimens '{oops'); expect "malformed JSON -> 400" 400 "$code"
jq -e '.error == "bad_request"' "$TMP/body" >/dev/null && ok "bad JSON body is readable" || bad "bad json body" "unexpected"
BIG=$(python3 -c "import json;print(json.dumps({'mode':'frame','season':'spring','seed':1,'caption':'x'*9000}))")
code=$(http POST /api/specimens "$BIG"); expect "payload > 8KB -> 413" 413 "$code"

# ---------------------------------------------------------------- 9. rate limit
if [ "$RATE_LIMIT" -eq 0 ]; then
  say "9. rate limits"
  say "  ${C_DIM}skipped by default — it deliberately exhausts this IP's hourly collect"
  say "  budget. Re-run with --rate-limit to include it (throwaway server only).${C_OFF}"
else
say "9. rate limits"
# The budget is configurable (start.sh raises it to 60 for the local demo), so
# read the live limit from /api/health instead of assuming 10.
COLLECT_LIMIT=$(jq -r '.limits.collectPerHour // 10' "$TMP/health.json" 2>/dev/null)
case "$COLLECT_LIMIT" in ''|*[!0-9]*) COLLECT_LIMIT=10 ;; esac
say "  ${C_DIM}collect limit for this server: $COLLECT_LIMIT/h${C_OFF}"
RL_FILE="$TMP/rl.txt"
: > "$RL_FILE"
for i in $(seq 1 $((COLLECT_LIMIT + 2))); do
  c=$(curl -sS -o /dev/null -w '%{http_code}' -X POST "$BASE/api/specimens" -H 'Content-Type: application/json' \
      -d "{\"mode\":\"frame\",\"season\":\"spring\",\"seed\":$((1000+i))}")
  echo "$c" >> "$RL_FILE"
done
LAST=$(tail -1 "$RL_FILE")
expect "collect over the hourly budget -> 429" 429 "$LAST"
code=$(http POST /api/specimens '{"mode":"frame","season":"spring","seed":1}')
jq -e '.error == "rate_limited"' "$TMP/body" >/dev/null && ok "429 body is {error,message}" || bad "429 body" "unexpected"
[ -n "$(grep -i '^retry-after:' "$TMP/head")" ] && ok "429 carries Retry-After" || bad "429 retry-after" "missing"
say "  ${C_DIM}(the collect budget for this IP is now spent; restart the API to reset it)${C_OFF}"
fi

# ---------------------------------------------------------------- 10. delete
say "10. delete + 404 + persistence"
code=$(http GET "/api/specimens/$ID"); expect "specimen exists before delete" 200 "$code"
AUTH="" code=$(http DELETE "/api/specimens/$ID" ""); expect "DELETE without token -> 401" 401 "$code"
jq -e '.error == "unauthorized"' "$TMP/body" >/dev/null && ok "401 body is {error,message}" || bad "401 body" "unexpected"
AUTH="wrongtokenwrongtokenwrongtoken" code=$(http DELETE "/api/specimens/$ID" ""); expect "DELETE with wrong token -> 403" 403 "$code"
AUTH="$TOKEN" code=$(http DELETE "/api/specimens/$ID" ""); expect "DELETE with token -> 200" 200 "$code"
jq -e '.ok == true' "$TMP/body" >/dev/null && ok "delete returns {ok:true}" || bad "delete body" "unexpected"
AUTH="" code=$(http GET "/api/specimens/$ID"); expect "specimen gone after delete" 404 "$code"
code=$(http GET "/s/$ID"); expect "share page gone after delete" 404 "$code"
code=$(http GET "/api/specimens/$ID/card.png"); expect "card gone after delete" 404 "$code"

# ---------------------------------------------------------------- 11. stats / edition
say "11. stats + daily edition"
code=$(http GET /api/stats); expect "GET /api/stats" 200 "$code"
jq -e '.total >= 0 and (.byMode | has("frame")) and (.bySeason | has("spring"))' "$TMP/body" >/dev/null && ok "stats has total/byMode/bySeason" || bad "stats shape" "unexpected"
grep -qi 'max-age=60' "$TMP/head" && ok "stats cache 60s" || bad "stats cache" "expected max-age=60"
code=$(http GET /api/edition/today); expect "GET /api/edition/today" 200 "$code"
jq -e '.date and .seed and .mode and .season and .noteZh and .noteEn' "$TMP/body" >/dev/null && ok "edition has date/seed/mode/season/notes" || bad "edition shape" "unexpected"
EDITION_DATE=$(jqv '.date')
say "  edition: $EDITION_DATE · $(jqv '.mode') · $(jqv '.season') · seed $(jqv '.seed')"

# ---------------------------------------------------------------- 12. static + spa
say "12. static shell"
code=$(http GET /); expect "GET / (SPA shell)" 200 "$code"
grep -qi 'text/html' "$TMP/head" && ok "SPA returns HTML" || bad "SPA type" "not html"
code=$(http GET /api/nope); expect "unknown API path -> JSON 404" 404 "$code"
jq -e '.error == "not_found"' "$TMP/body" >/dev/null && ok "unknown API path is JSON" || bad "api 404" "not JSON"
code=$(http GET /fonts/instrument-serif-regular.woff2); [ "$code" = "200" ] || [ "$code" = "404" ] && ok "font path answers ($code)" || bad "font path" "unexpected $code"

# ---------------------------------------------------------------- summary
line
say ""
say "  ${C_OK}passed: $PASS${C_OFF}   ${C_BAD}failed: $FAIL${C_OFF}"
say "  base: $BASE   data dir: $(curl -sS "$BASE/api/health" | jq -r '.dataDir' 2>/dev/null)"
say ""
if [ "$FAIL" -gt 0 ]; then
  say "  failures:"
  for r in "${RESULTS[@]}"; do case "$r" in FAIL*) say "    $r" ;; esac; done
  say ""
fi

if [ "$SAVE" -eq 1 ]; then
  OUT="$ROOT/docs/api-smoke.txt"
  {
    echo "HORTUS MANUS · 指间花园 — API smoke run"
    echo "date: $(date -Is)"
    echo "base: $BASE"
    echo "result: $PASS passed, $FAIL failed"
    echo ""
    for r in "${RESULTS[@]}"; do echo "  $r"; done
    echo ""
    echo "edition: $EDITION_DATE"
    echo "sample specimen id: $ID"
    echo "card cache: ${DATA_DIR:-$ROOT/data}/cards/$ID.png"
  } > "$OUT"
  say "  saved -> $OUT"
fi

[ "$FAIL" -eq 0 ]
