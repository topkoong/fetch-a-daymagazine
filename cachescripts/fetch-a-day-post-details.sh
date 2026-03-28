#!/usr/bin/env bash
#
# Build a structured article-detail cache for in-app post detail pages.
# Source IDs come from src/assets/cached/posts.json; each detail is fetched from
# WordPress POST /wp-json/wp/v2/posts/:id
#
# Hardening:
# - curl timeouts + retries
# - optional delay between requests (DETAIL_REQUEST_DELAY_SECS)
# - merge with existing post-details.json: skip refetch when entry has usable content
# - MAX_DETAILS caps network fetches per run (0 = unlimited; use in CI for PR speed)
set -euo pipefail

readonly ORIGIN="${ADAY_MAGAZINE_ORIGIN:-https://adaymagazine.com}"
readonly BASE_URL="${ORIGIN}/wp-json/wp/v2/posts"
readonly CACHED_DIR="src/assets/cached"
readonly POSTS_LIST_FILE="${CACHED_DIR}/posts.json"
readonly OUTPUT_FILE="${CACHED_DIR}/post-details.json"
readonly MAX_DETAILS="${MAX_DETAILS:-0}"
readonly CACHE_MERGE_EXISTING="${CACHE_MERGE_EXISTING:-1}"
readonly DETAIL_REQUEST_DELAY_SECS="${DETAIL_REQUEST_DELAY_SECS:-0}"
readonly TMP_DIR="cachescripts/post-details-tmp"
readonly MERGED_STATE="${TMP_DIR}/merged-state.json"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=aday-fetch-opts.sh
source "${SCRIPT_DIR}/aday-fetch-opts.sh"
aday_wp_rest_curl_opts "${ORIGIN}"

readonly CURL_COMMON=(
  -sS
  "${ADAY_WP_REST_CURL_OPTS[@]}"
)

has_usable_cached_detail() {
  local id="$1"
  [[ -f "${MERGED_STATE}" ]] || return 1
  jq -e --arg id "$id" '
    (.[$id] | type) == "object"
    and (.[$id].id | type) == "number"
    and (.[$id].id == ($id | tonumber))
    and (.[$id].content.rendered | type == "string")
    and ((.[$id].content.rendered | length) > 0)
  ' "${MERGED_STATE}" >/dev/null 2>&1
}

fetch_post_details() {
  if [[ ! -f "${POSTS_LIST_FILE}" ]]; then
    echo "error: ${POSTS_LIST_FILE} is missing. Run fetch-a-day-posts.sh first." >&2
    exit 1
  fi

  mkdir -p "${TMP_DIR}" "${CACHED_DIR}"

  if [[ "${CACHE_MERGE_EXISTING}" == "1" ]] && [[ -f "${OUTPUT_FILE}" ]] &&
    jq -e 'type == "object"' "${OUTPUT_FILE}" >/dev/null 2>&1; then
    jq -c '.' "${OUTPUT_FILE}" >"${MERGED_STATE}"
  else
    echo '{}' >"${MERGED_STATE}"
  fi

  local ids
  ids="$(jq -r '.[].id // empty' "${POSTS_LIST_FILE}" | awk '!seen[$0]++')"

  local network_fetches=0
  local skipped=0
  local failed=0
  local post_id

  while IFS= read -r post_id; do
    [[ -z "${post_id}" ]] && continue

    if [[ "${CACHE_MERGE_EXISTING}" == "1" ]] && has_usable_cached_detail "${post_id}"; then
      skipped=$((skipped + 1))
      continue
    fi

    if [[ "${MAX_DETAILS}" -gt 0 && "${network_fetches}" -ge "${MAX_DETAILS}" ]]; then
      echo "  reached MAX_DETAILS=${MAX_DETAILS}, stopping further network fetches"
      break
    fi

    local detail_file="${TMP_DIR}/post-${post_id}.json"
    local status_code
    status_code="$(curl "${CURL_COMMON[@]}" -o "${detail_file}" -w "%{http_code}" \
      "${BASE_URL}/${post_id}")"

    if [[ "${DETAIL_REQUEST_DELAY_SECS}" != "0" ]]; then
      sleep "${DETAIL_REQUEST_DELAY_SECS}"
    fi

    if [[ "${status_code}" != "200" ]]; then
      rm -f "${detail_file}"
      failed=$((failed + 1))
      continue
    fi

    if ! jq -e 'type == "object" and (.id | type) == "number"' "${detail_file}" >/dev/null; then
      rm -f "${detail_file}"
      failed=$((failed + 1))
      continue
    fi

    jq -c '.' "${detail_file}" >"${TMP_DIR}/single-post.json"
    jq --arg id "${post_id}" --slurpfile post "${TMP_DIR}/single-post.json" \
      '. + {($id): $post[0]}' "${MERGED_STATE}" >"${TMP_DIR}/merged-next.json"
    mv -f "${TMP_DIR}/merged-next.json" "${MERGED_STATE}"
    rm -f "${detail_file}"
    network_fetches=$((network_fetches + 1))
  done <<<"${ids}"

  local entry_count
  entry_count="$(jq 'length' "${MERGED_STATE}")"
  local post_count
  post_count="$(jq 'length' "${POSTS_LIST_FILE}")"

  if [[ "${entry_count}" -eq 0 && "${post_count}" -gt 0 ]]; then
    echo "error: post-details cache is empty but posts.json has rows (fetched=${network_fetches}, skipped=${skipped}, failed=${failed})" >&2
    exit 1
  fi

  mv -f "${MERGED_STATE}" "${OUTPUT_FILE}"
  echo "post detail cache: ${OUTPUT_FILE} (entries=${entry_count}, fetched=${network_fetches}, skipped_merge=${skipped}, failed=${failed})"
}

cd "$(dirname "$0")/.." || exit 1
fetch_post_details
