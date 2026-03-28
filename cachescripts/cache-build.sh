#!/usr/bin/env bash
# Runs WordPress cache fetch scripts, or validates committed cache only when CACHE_FETCH_OFFLINE=1.
# GitHub-hosted runners often get HTTP 403 from adaymagazine.com (edge/WAF); offline mode keeps CI green.
set -euo pipefail

cd "$(dirname "$0")/.." || exit 1

if [[ "${CACHE_FETCH_OFFLINE:-}" == "1" ]]; then
  echo 'CACHE_FETCH_OFFLINE=1 — skipping remote WordPress fetch; validating committed src/assets/cached/*.json'
  bash ./cachescripts/validate-committed-cache.sh
  exit 0
fi

bash ./cachescripts/fetch-a-day-posts.sh
bash ./cachescripts/fetch-a-day-categories.sh
bash ./cachescripts/fetch-a-day-post-details.sh
