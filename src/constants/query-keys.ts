/** Centralized TanStack Query cache keys (always use array keys). */
export const queryKeys = {
  allPosts: ['posts', 'all'] as const,
  allCategories: ['categories', 'all'] as const,
  categoryPosts: (categoryId: string) => ['posts', 'category', categoryId] as const,
} as const;
