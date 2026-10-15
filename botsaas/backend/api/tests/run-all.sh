#!/usr/bin/env bash
# Runs the whole suite. Needs the dev DB up (scripts/dev-mysql.sh start) and,
# for api_isolation, the API served at $API_BASE (default 127.0.0.1:8080).
set -uo pipefail
cd "$(dirname "$0")/.."
PHP="${PHP:-php}"
FAILED=0
for t in smoke queue_probe tenant_isolation auth_flow quota_race repositories explain_check api_isolation; do
  OUT=$("$PHP" "tests/$t.php" 2>&1)
  LINE=$(echo "$OUT" | grep -E "[0-9]+ (passed|plans OK)" | tail -1 | xargs)
  if echo "$OUT" | grep -q "FAIL\|Fatal error"; then
    printf "  %-20s %s  <-- FAILURES\n" "$t" "$LINE"
    echo "$OUT" | grep -E "FAIL|Fatal error" | head -5
    FAILED=1
  else
    printf "  %-20s %s\n" "$t" "$LINE"
  fi
done
exit $FAILED
