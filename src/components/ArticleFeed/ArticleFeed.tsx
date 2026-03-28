/**
 * Renders the **stacked category sections** on Home: each `CategoryFeedSection` is a desk title
 * (`CategoryHeader`) plus a grid of {@link Post} cards. **Visibility cap** (`visiblePostCardCount`)
 * comes from breakpoint rules in `Home.tsx`; first section may prioritize media loading for LCP.
 */
import CategoryHeader from '@components/CategoryHeader';
import PageBreak from '@components/PageBreak';
import Post from '@components/Post';
import type { CategoryFeedSection, WpPost } from 'types/wordpress';

export interface ArticleFeedProps {
  sections: CategoryFeedSection[];
  visiblePostCardCount: number;
  cachedPostsById: ReadonlyMap<number, WpPost>;
}

function ArticleFeed({
  sections,
  visiblePostCardCount,
  cachedPostsById,
}: ArticleFeedProps) {
  return (
    <div id='featured-categories' className='feed-sections px-1 sm:px-3 md:px-5'>
      {sections.map((section, sectionIndex) => (
        <section
          key={section.categoryId}
          className={`feed-section scroll-mt-4 border-t-[3px] border-black pt-6 ${
            sectionIndex === 0 ? 'mt-10' : 'mt-12'
          } mb-16 md:mb-20`}
          aria-labelledby={`category-heading-${section.categoryId}`}
        >
          <CategoryHeader categoryId={section.categoryId} title={section.displayName} />
          <PageBreak />
          <ul className='post-grid mt-8 grid grid-cols-1 gap-8 px-1 sm:px-2 md:mt-10 md:grid-cols-2 md:gap-10 lg:grid-cols-3 lg:gap-8 xl:grid-cols-4'>
            {section.posts.slice(0, visiblePostCardCount).map((post) => (
              <Post
                key={post.id}
                post={post}
                prioritizeMedia={sectionIndex === 0}
                cachedPostsById={cachedPostsById}
              />
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

export default ArticleFeed;
