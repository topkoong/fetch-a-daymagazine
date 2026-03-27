/** WordPress REST API shapes used by this app (subset). */

export interface WpRenderedField {
  rendered: string;
}

export interface WpNullableRenderedField {
  rendered: string | null;
}

export interface WpImageSize {
  id: number;
  width: number;
  height: number;
  src: string;
}

export interface WpFeaturedImage {
  alt?: string;
  title?: string;
  sizes?: Record<string, WpImageSize>;
}

export interface WpPost {
  id: number;
  link: string;
  title: WpRenderedField;
  excerpt?: WpNullableRenderedField;
  content?: WpNullableRenderedField;
  date?: string;
  categories: number[];
  featured_image?: WpFeaturedImage;
}

export interface WpCategory {
  id: number;
  name: string;
  slug: string;
}

export interface WpPostWithResolvedCategories extends WpPost {
  resolvedCategoryLabels: string[];
}

export interface CategoryFeedSection {
  categoryId: string;
  displayName: string;
  posts: WpPostWithResolvedCategories[];
}

export interface CategoryPostsPage {
  posts: WpPost[];
  hasMore: boolean;
  nextOffset: number;
}
