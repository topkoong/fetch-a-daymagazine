/** Centralized React Query cache keys. */
export const queryKeys = {
  allPosts: 'allPosts',
  allCategories: 'allCategories',
  categoryPosts: (categoryId: string) => ['categoryPosts', categoryId] as const,
} as const;
