/**
 * Internal path helpers. Paths are **relative to** the router basename (`/fetch-a-daymagazine`);
 * `Link` / `navigate` resolve them the same way as string `to="/posts/1"`.
 */
export const ROUTES = {
  postDetail: (id: number) => `/posts/${id}`,
} as const;
