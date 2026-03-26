#!/usr/bin/env bash
#
# Download posts from a day magazine into:
#   - src/assets/cached/posts.json        (all fetched pages merged)
#   - src/assets/cached/mobile-posts.json (first page only — smaller offline payload for narrow layouts)
# Query params align with src/apis/posts.ts (orderby=date, order=desc).
set -euo pipefail

readonly ORIGIN="${ADAY_MAGAZINE_ORIGIN:-https://adaymagazine.com}"
readonly BASE_URL="${ORIGIN}/wp-json/wp/v2/posts"
readonly PER_PAGE=100
readonly MAX_PAGES="${MAX_PAGES:-0}"
readonly WORKDIR="cachescripts"
readonly POSTS_DIR="${WORKDIR}/posts-json"
readonly MERGED_DIR="${POSTS_DIR}/merged"
readonly POST_PREFIX="post"
readonly OUTPUT_NAME="posts.json"
readonly MOBILE_NAME="mobile-posts.json"
readonly CACHED_DIR="src/assets/cached"

fetch_post_pages() {
  echo "Fetching posts from ${BASE_URL}"
  mkdir -p "${POSTS_DIR}" "${MERGED_DIR}"

  local page=1
  local fetched=0

  while true; do
    if [[ "$MAX_PAGES" -gt 0 && "$page" -gt "$MAX_PAGES" ]]; then
      break
    fi
    local url="${BASE_URL}?page=${page}&per_page=${PER_PAGE}&orderby=date&order=desc"
    local out="${POSTS_DIR}/${POST_PREFIX}-${page}.json"
    echo "  page ${page}..."
    local status_code
    status_code="$(curl -sS -o "$out" -w "%{http_code}" "$url" \
      -H 'Accept: application/json' \
      -H 'Content-Type: application/json')"

    if [[ "$status_code" == "400" || "$status_code" == "404" ]]; then
      rm -f "$out"
      break
    fi
    if [[ "$status_code" != "200" ]]; then
      echo "error: posts request failed at page ${page} (HTTP ${status_code})" >&2
      exit 1
    fi
    jq -e 'type == "array"' "$out" >/dev/null || {
      echo "error: invalid JSON payload for posts page ${page}" >&2
      exit 1
    }

    local count
    count="$(jq 'length' "$out")"
    if [[ "$count" -eq 0 ]]; then
      rm -f "$out"
      break
    fi
    fetched=$((fetched + count))
    if [[ "$count" -lt "$PER_PAGE" ]]; then
      break
    fi
    page=$((page + 1))
  done

  echo "  total post records fetched: ${fetched}"
}

merge_post_json() {
  local pattern="${POSTS_DIR}/${POST_PREFIX}"-*.json
  if ! compgen -G "$pattern" >/dev/null; then
    echo "error: no post JSON files to merge" >&2
    exit 1
  fi

  # Full offline feed: concatenate all pages (same order as API: newest first per page).
  jq -s 'add' $pattern >"${MERGED_DIR}/${OUTPUT_NAME}"

  # Mobile cache: first page only (matches previous script behaviour; keeps file smaller).
  local first="${POSTS_DIR}/${POST_PREFIX}-1.json"
  if [[ -f "$first" ]]; then
    cp -f "$first" "${MERGED_DIR}/${MOBILE_NAME}"
  else
    echo "error: expected ${first}" >&2
    exit 1
  fi

  echo "Copying ${OUTPUT_NAME} and ${MOBILE_NAME} -> ${CACHED_DIR}/"
  mkdir -p "${CACHED_DIR}"
  mv -f "${MERGED_DIR}/${OUTPUT_NAME}" "${CACHED_DIR}/${OUTPUT_NAME}"
  mv -f "${MERGED_DIR}/${MOBILE_NAME}" "${CACHED_DIR}/${MOBILE_NAME}"
  rm -f $pattern
  echo "Done."
}

cd "$(dirname "$0")/.." || exit 1
fetch_post_pages
merge_post_json
