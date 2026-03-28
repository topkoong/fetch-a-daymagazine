import type { WpPost } from 'types/wordpress';

export interface TopicLandingDefinition {
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  keywords: readonly string[];
  categoryIds: readonly number[];
}

export const TOPIC_LANDINGS: readonly TopicLandingDefinition[] = [
  {
    slug: 'business',
    title: 'Business Stories',
    subtitle:
      'Strategic ideas, market movement, and leadership stories curated for decision-makers.',
    description:
      'Explore business stories from a day magazine with curated context for leaders, founders, and operators.',
    keywords: ['business stories', 'market insights', 'leadership', 'strategy'],
    categoryIds: [302, 15299],
  },
  {
    slug: 'world',
    title: 'World and News',
    subtitle:
      'Global signals, society shifts, and cross-industry updates that shape tomorrow.',
    description:
      'Read global and world-focused news collections from a day magazine in a cleaner reading experience.',
    keywords: ['world news', 'global trends', 'society', 'news'],
    categoryIds: [299],
  },
  {
    slug: 'culture',
    title: 'Culture and Ideas',
    subtitle:
      'Culture, thought, and creative momentum from voices driving contemporary perspectives.',
    description:
      'Discover culture and ideas from a day magazine with category-first navigation and editorial clarity.',
    keywords: ['culture', 'ideas', 'creative thinking', 'editorial'],
    categoryIds: [15302, 300, 14358],
  },
  {
    slug: 'design',
    title: 'Design and Style',
    subtitle:
      'Art, design systems, visual trends, and style narratives for modern creators.',
    description:
      'Browse design and style collections from a day magazine including art, aesthetics, and visual storytelling.',
    keywords: ['design', 'art', 'style', 'visual storytelling'],
    categoryIds: [301, 14361, 15310],
  },
  {
    slug: 'lifestyle',
    title: 'Life and Wellbeing',
    subtitle:
      'Practical stories on life, movement, happiness, and sustainable personal growth.',
    description:
      'Read lifestyle and wellbeing stories from a day magazine with focused, premium reading flow.',
    keywords: ['lifestyle', 'wellbeing', 'life', 'happiness'],
    categoryIds: [14360, 303, 304],
  },
] as const;

export function getTopicBySlug(slug: string | undefined): TopicLandingDefinition | null {
  if (!slug) return null;
  return TOPIC_LANDINGS.find((topic) => topic.slug === slug) ?? null;
}

/** First topic hub whose category ids overlap the post (stable list order). */
export function getPrimaryTopicLandingForPost(
  post: WpPost,
): TopicLandingDefinition | null {
  const ids = new Set(post.categories);
  for (const topic of TOPIC_LANDINGS) {
    if (topic.categoryIds.some((cid) => ids.has(cid))) return topic;
  }
  return null;
}
