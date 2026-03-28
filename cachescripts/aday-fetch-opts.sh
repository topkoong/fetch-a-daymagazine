#!/usr/bin/env bash
#
# aday-fetch-opts.sh
# ------------------
# Sourced by fetch-a-day-posts.sh, fetch-a-day-categories.sh, and fetch-a-day-post-details.sh.
#
# Defines bash function aday_wp_rest_curl_opts <origin> which fills global array
# ADAY_WP_REST_CURL_OPTS with curl arguments: timeouts, retries, Accept/Content-Type,
# a Chrome-like User-Agent, and Referer pointing at the magazine origin.
#
# Rationale:
#   Default curl User-Agent is often blocked by CDNs/WAFs with HTTP 403. Browser-like
#   headers help for developer machines; GitHub Actions may still be blocked by IP and
#   should use CACHE_FETCH_OFFLINE=1 via cache-build.sh instead.
#
# Override User-Agent:
#   export ADAY_CURL_USER_AGENT='MyBot/1.0'
#

aday_wp_rest_curl_opts() {
  local origin="$1"
  # Default UA mimics a current desktop Chrome build.
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
