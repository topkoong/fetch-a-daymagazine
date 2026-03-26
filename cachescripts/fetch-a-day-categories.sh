#!/usr/bin/env bash
#
# Download all categories from a day magazine (WordPress REST) into src/assets/cached/categories.json
# Query params align with src/apis/categories.ts (orderby=name, order=asc).
set -euo pipefail

readonly ORIGIN="${ADAY_MAGAZINE_ORIGIN:-https://adaymagazine.com}"
readonly BASE_URL="${ORIGIN}/wp-json/wp/v2/categories"
readonly PER_PAGE=100
readonly MAX_PAGES="${MAX_PAGES:-0}"
readonly WORKDIR="cachescripts"
readonly CATEGORIES_DIR="${WORKDIR}/categories-json"
readonly MERGED_DIR="${CATEGORIES_DIR}/merged"
readonly CATEGORIES_FILE="category-group"
readonly OUTPUT_NAME="categories.json"
readonly CACHED_DIR="src/assets/cached"

fetch_category_pages() {
  echo "Fetching categories from ${BASE_URL}"
  mkdir -p "${CATEGORIES_DIR}" "${MERGED_DIR}"

  local page=1
  local fetched=0

  while true; do
    if [[ "$MAX_PAGES" -gt 0 && "$page" -gt "$MAX_PAGES" ]]; then
      break
    fi
    local url="${BASE_URL}?page=${page}&per_page=${PER_PAGE}&orderby=name&order=asc"
    local out="${CATEGORIES_DIR}/${CATEGORIES_FILE}-${page}.json"
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
      echo "error: categories request failed at page ${page} (HTTP ${status_code})" >&2
      exit 1
    fi
    jq -e 'type == "array"' "$out" >/dev/null || {
      echo "error: invalid JSON payload for categories page ${page}" >&2
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

  echo "  total category records fetched: ${fetched}"
}

merge_category_json() {
  local pattern="${CATEGORIES_DIR}/${CATEGORIES_FILE}"-*.json
  if ! compgen -G "$pattern" >/dev/null; then
    echo "error: no category JSON files to merge" >&2
    exit 1
  fi
  jq -s 'add' $pattern >"${MERGED_DIR}/${OUTPUT_NAME}"
  echo "Copying ${OUTPUT_NAME} -> ${CACHED_DIR}/"
  mkdir -p "${CACHED_DIR}"
  mv -f "${MERGED_DIR}/${OUTPUT_NAME}" "${CACHED_DIR}/${OUTPUT_NAME}"
  rm -f $pattern
  echo "Done."
}

cd "$(dirname "$0")/.." || exit 1
fetch_category_pages
merge_category_json
