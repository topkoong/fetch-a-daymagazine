/**
 * Produces plain text from WordPress `rendered` HTML for labels and alt text.
 */
export function stripHtmlTags(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Light hardening for trusted WordPress HTML before `dangerouslySetInnerHTML`.
 * Not a full XSS filter; strips common active content vectors.
 */
export function sanitizeArticleBodyHtml(html: string): string {
  return html
    .replace(/<script\b[\s\S]*?<\/script>/gi, '')
    .replace(/<style\b[\s\S]*?<\/style>/gi, '')
    .replace(/\s(on\w+|javascript:)\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '');
}
