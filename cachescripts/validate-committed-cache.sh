#!/usr/bin/env bash
# Ensure committed JSON under src/assets/cached/ is valid for builds when remote fetch is skipped (e.g. CI blocked with HTTP 403).
set -euo pipefail

cd "$(dirname "$0")/.." || exit 1

readonly CACHED_DIR='src/assets/cached'
readonly POSTS="${CACHED_DIR}/posts.json"
readonly MOBILE="${CACHED_DIR}/mobile-posts.json"
readonly CATEGORIES="${CACHED_DIR}/categories.json"
readonly DETAILS="${CACHED_DIR}/post-details.json"

require_json_file() {
  local f="$1"
  local label="$2"
  [[ -f "$f" ]] || {
    echo "error: missing ${label} (${f})" >&2
    exit 1
  }
  jq -e . "$f" >/dev/null || {
    echo "error: invalid JSON for ${label} (${f})" >&2
    exit 1
  }
}

require_json_file "$POSTS" 'posts.json'
require_json_file "$MOBILE" 'mobile-posts.json'
require_json_file "$CATEGORIES" 'categories.json'
require_json_file "$DETAILS" 'post-details.json'

jq -e 'type == "array" and length > 0' "$POSTS" >/dev/null || {
  echo 'error: posts.json must be a non-empty array' >&2
  exit 1
}
jq -e 'type == "array" and length > 0' "$MOBILE" >/dev/null || {
  echo 'error: mobile-posts.json must be a non-empty array' >&2
  exit 1
}
jq -e 'type == "array" and length > 0' "$CATEGORIES" >/dev/null || {
  echo 'error: categories.json must be a non-empty array' >&2
  exit 1
}
jq -e 'type == "object"' "$DETAILS" >/dev/null || {
  echo 'error: post-details.json must be a JSON object' >&2
  exit 1
}

echo "Committed cache OK — posts=$(jq length "$POSTS") mobile=$(jq length "$MOBILE") categories=$(jq length "$CATEGORIES") postDetailKeys=$(jq 'length' "$DETAILS")"
