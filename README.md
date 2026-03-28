# Toppy × a day magazine

Preact + Vite reader for [a day magazine](https://adaymagazine.com/), with category-first navigation, cached WordPress data, and GitHub Pages deployment.

## Scripts

| Command              | Purpose                                        |
| -------------------- | ---------------------------------------------- |
| `pnpm dev`           | Local dev server                               |
| `pnpm build`         | Typecheck + production bundle                  |
| `pnpm lint`          | Prettier + ESLint                              |
| `pnpm cache:build`   | Refresh `src/assets/cached/*.json` (see below) |
| `pnpm cache:details` | Run only the post-detail cache step            |

## Cache pipeline (`pnpm cache:build`)

`package.json` runs `cachescripts/cache-build.sh`, which either:

1. **Online (default)** — Fetches live data from the WordPress REST API and writes JSON into `src/assets/cached/`.
2. **Offline** — If `CACHE_FETCH_OFFLINE=1`, skips the network and checks that committed JSON under `src/assets/cached/` is present and valid. GitHub Actions and the deploy workflow set this because `adaymagazine.com` often returns **HTTP 403** to GitHub-hosted runner IPs.

**Requirements:** `bash`, `curl`, `jq`. On macOS/Linux, install `jq` if missing.

### Environment variables

| Variable                    | Used by                       | Meaning                                                                                              |
| --------------------------- | ----------------------------- | ---------------------------------------------------------------------------------------------------- |
| `CACHE_FETCH_OFFLINE`       | `cache-build.sh`              | Set to `1` to validate committed cache only (no HTTP).                                               |
| `ADAY_MAGAZINE_ORIGIN`      | All fetch scripts             | Base URL (default `https://adaymagazine.com`).                                                       |
| `ADAY_CURL_USER_AGENT`      | `aday-fetch-opts.sh`          | Override the browser-like User-Agent sent with `curl`.                                               |
| `MAX_PAGES`                 | posts + categories scripts    | Cap pagination (`0` = unlimited).                                                                    |
| `MAX_DETAILS`               | `fetch-a-day-post-details.sh` | Max number of post bodies to fetch this run (`0` = unlimited).                                       |
| `CACHE_MERGE_EXISTING`      | post-details                  | `1` (default) merges with existing `post-details.json` and skips IDs that already have body content. |
| `DETAIL_REQUEST_DELAY_SECS` | post-details                  | Seconds to sleep between detail requests (polite / rate limits).                                     |

### Shell scripts in `cachescripts/`

| File                          | Role                                                                                                                                                                  |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `cache-build.sh`              | Entry point: offline validation **or** the three fetch steps in order.                                                                                                |
| `validate-committed-cache.sh` | Asserts `posts.json`, `mobile-posts.json`, `categories.json`, and `post-details.json` exist, parse as JSON, and meet minimum shape (non-empty arrays where required). |
| `aday-fetch-opts.sh`          | Defines `aday_wp_rest_curl_opts` — shared `curl` flags (timeouts, retries, `User-Agent`, `Referer`) sourced by the fetch scripts.                                     |
| `fetch-a-day-posts.sh`        | Paginates `/wp-json/wp/v2/posts`, merges pages into `posts.json`, copies first page to `mobile-posts.json`.                                                           |
| `fetch-a-day-categories.sh`   | Paginates `/wp-json/wp/v2/categories` into `categories.json`.                                                                                                         |
| `fetch-a-day-post-details.sh` | For each post id in `posts.json`, fetches full post JSON and builds keyed `post-details.json`.                                                                        |

After a successful **online** run, commit updated files under `src/assets/cached/` if you want CI and new clones to use them without hitting the API.

## Deploy

Push to `master` triggers the GitHub Pages workflow (see `.github/workflows/deployment.yml`). The app uses base path `/fetch-a-daymagazine/`.

## License

Private project; see repository settings.
