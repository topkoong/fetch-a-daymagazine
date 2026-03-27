#!/usr/bin/env bash
#
# Build a structured article-detail cache for in-app post detail pages.
# Source IDs come from src/assets/cached/posts.json and each post detail is
# fetched from the WordPress post-by-id endpoint.
set -euo pipefail

readonly ORIGIN="${ADAY_MAGAZINE_ORIGIN:-https://adaymagazine.com}"
readonly BASE_URL="${ORIGIN}/wp-json/wp/v2/posts"
readonly CACHED_DIR="src/assets/cached"
readonly POSTS_LIST_FILE="${CACHED_DIR}/posts.json"
readonly OUTPUT_FILE="${CACHED_DIR}/post-details.json"
readonly MAX_DETAILS="${MAX_DETAILS:-0}"
readonly TMP_DIR="cachescripts/post-details-tmp"
readonly TMP_LIST="${TMP_DIR}/post-details.ndjson"

fetch_post_details() {
  if [[ ! -f "${POSTS_LIST_FILE}" ]]; then
    echo "error: ${POSTS_LIST_FILE} is missing. Run fetch-a-day-posts.sh first." >&2
    exit 1
  fi

  mkdir -p "${TMP_DIR}" "${CACHED_DIR}"
  : >"${TMP_LIST}"

  local processed=0
  local failed=0
  local ids
  ids="$(jq -r '.[].id // empty' "${POSTS_LIST_FILE}" | awk '!seen[$0]++')"

  while IFS= read -r post_id; do
    [[ -z "${post_id}" ]] && continue
    if [[ "${MAX_DETAILS}" -gt 0 && "${processed}" -ge "${MAX_DETAILS}" ]]; then
      break
    fi

    local detail_file="${TMP_DIR}/post-${post_id}.json"
    local status_code
    status_code="$(curl -sS -o "${detail_file}" -w "%{http_code}" "${BASE_URL}/${post_id}" \
      -H 'Accept: application/json' \
      -H 'Content-Type: application/json')"

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

    jq -c '.' "${detail_file}" >>"${TMP_LIST}"
    rm -f "${detail_file}"
    processed=$((processed + 1))
  done <<<"${ids}"

  if [[ ! -s "${TMP_LIST}" ]]; then
    echo "error: no post details were fetched successfully." >&2
    exit 1
  fi

  jq -s 'map({key: (.id | tostring), value: .}) | from_entries' "${TMP_LIST}" >"${OUTPUT_FILE}"
  echo "post detail cache generated: ${OUTPUT_FILE} (items=${processed}, failed=${failed})"
}

cd "$(dirname "$0")/.." || exit 1
fetch_post_details
