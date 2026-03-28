/** Normalized post fields for cards and featured layouts (no raw WP HTML). */
export interface PostCardViewModel {
  id: number;
  title: string;
  excerpt: string;
  date: string | undefined;
  imageUrl: string | null;
  categoryIds: number[];
  /** Primary ASCII category label for chips, when resolved. */
  categoryLabel: string | null;
  link: string;
}
