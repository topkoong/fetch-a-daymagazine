# Toppy × a day magazine

Preact + Vite reader for [a day magazine](https://adaymagazine.com/), with category-first navigation, cached WordPress data, and GitHub Pages deployment.

## Documentation map

| What                                      | Where                                                                                                                                                                                                                                                                                                                             |
| ----------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Product roadmap, achievements, PR history | [`plan.md`](./plan.md) in the repo root                                                                                                                                                                                                                                                                                           |
| Inline / JSDoc                            | **Entry + routing** (`main.tsx`, `app.tsx`), **pages**, **navbar/feeds/cards**, **SEO hook**, and **APIs** include file-level JSDoc (cache keys, fallbacks, routing intent). Utilities such as `related-posts` and `structured-data` were documented earlier. Prefer reading types first; comments explain _why_ and cross-links. |
| PR checklist                              | [`.github/pull_request_template.md`](./github/pull_request_template.md)                                                                                                                                                                                                                                                           |

## Stack

- **UI:** Preact 10, Tailwind CSS 4, TanStack Query
- **Routing:** `react-router-dom` with `BrowserRouter` basename `/fetch-a-daymagazine` (see `src/main.tsx`)
- **Data:** WordPress REST (`/wp-json/wp/v2/posts`, categories), plus bundled JSON under `src/assets/cached/` when live fetches fail (home feed, category pages, article detail)

## Repository layout

| Path              | Role                                                                                          |
| ----------------- | --------------------------------------------------------------------------------------------- |
| `src/app.tsx`     | Routes + query client                                                                         |
| `src/pages/`      | Route screens (`Home`, `PostDetails`, `Posts` category feed, topic landings, evergreen pages) |
| `src/components/` | UI pieces (navbar, cards, feeds, JSON-LD script tag)                                          |
| `src/apis/`       | HTTP + fallback helpers for posts/categories                                                  |
| `src/constants/`  | Routes copy, nav categories, topic landings, query keys                                       |
| `src/hooks/`      | SEO meta, breakpoints, media queries                                                          |
| `src/types/`      | Shared TS types (posts, cards, SEO graph)                                                     |
| `src/utils/`      | Normalization, HTML stripping, related posts, structured data                                 |
| `cachescripts/`   | Bash pipeline that fills `src/assets/cached/`                                                 |
| `public/`         | `sitemap.xml`, `robots.txt`                                                                   |

## Routes (client)

All paths are under the [basename](https://reactrouter.com/en/main/router-components/browser-router#basename): `/fetch-a-daymagazine/`.

| Path                                  | Page                                                             |
| ------------------------------------- | ---------------------------------------------------------------- |
| `/`                                   | Home — featured story + category feeds                           |
| `/about`, `/collections`, `/insights` | Evergreen editorial pages                                        |
| `/topics/:slug`                       | Topic hub (filtered by `topic-landings`)                         |
| `/posts/:id`                          | Article reader                                                   |
| `/posts/categories/:id`               | WordPress category id feed (live API with `posts.json` fallback) |

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

**Vite (frontend)** — optional at build/dev time:

| Variable                    | Meaning                                                                                                       |
| --------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `VITE_ADAY_MAGAZINE_ORIGIN` | WordPress site origin (no trailing slash). Default: `https://adaymagazine.com`. See `src/constants/index.ts`. |

**Cache scripts (bash)**:

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
