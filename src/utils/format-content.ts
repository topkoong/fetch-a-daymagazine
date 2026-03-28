/**
 * Produces plain text from WordPress `rendered` HTML for labels and alt text.
 */
export function stripHtmlTags(raw: string): string {
  if (!raw) return '';
  const withoutTags = raw.replace(/<[^>]*>/g, '');
  if (typeof document !== 'undefined') {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = withoutTags;
    return textarea.value.trim();
  }
  return withoutTags
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#8216;/g, '\u2018')
    .replace(/&#8217;/g, '\u2019')
    .replace(/&#8220;/g, '\u201C')
    .replace(/&#8221;/g, '\u201D')
    .replace(/&#8211;/g, '\u2013')
    .replace(/&#8212;/g, '\u2014')
    .replace(/&nbsp;/g, ' ')
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
