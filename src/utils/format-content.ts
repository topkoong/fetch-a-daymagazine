/**
 * Produces plain text from WordPress `rendered` HTML for labels and alt text.
 */
export function stripHtmlTags(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
