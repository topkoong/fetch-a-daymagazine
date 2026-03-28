#!/usr/bin/env bash
# Shared curl options for WordPress REST JSON on adaymagazine.com.
# Edge/WAF layers often return HTTP 403 for the default curl User-Agent (common on CI runners).

aday_wp_rest_curl_opts() {
  local origin="$1"
  local ua="${ADAY_CURL_USER_AGENT:-Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36}"
  ADAY_WP_REST_CURL_OPTS=(
    --connect-timeout 25
    --max-time 120
    --retry 4
    --retry-delay 4
    --retry-all-errors
    -H 'Accept: application/json'
    -H 'Content-Type: application/json'
    -H "User-Agent: ${ua}"
    -H "Referer: ${origin}/"
  )
}
