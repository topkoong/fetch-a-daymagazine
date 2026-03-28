#!/usr/bin/env bash
#
# cache-build.sh
# --------------
# Invoked by `pnpm cache:build` from the repository root.
#
# Two modes:
#   CACHE_FETCH_OFFLINE=1
#       Does not call the WordPress API. Runs validate-committed-cache.sh so CI/deploy
#       can build using JSON already committed under src/assets/cached/.
#
#   (variable unset or not 1)
#       Runs the three fetch scripts in order: posts → categories → post-details
#       (details depend on posts.json existing).
#
# Working directory: always changes to repo root (parent of cachescripts/).
#
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
