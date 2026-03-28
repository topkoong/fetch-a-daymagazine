import { ROUTES } from '@constants/routes';
import { Link } from 'react-router-dom';

import styles from './RelatedArticles.module.css';
import type { RelatedArticlesProps } from './RelatedArticles.types';

function RelatedArticles({ posts, currentPostId }: RelatedArticlesProps) {
  if (!posts.length) return null;

  return (
    <section
      id={`related-stories-${currentPostId}`}
      className={styles.root}
      aria-label='Related stories'
    >
      <h2 className={styles.label}>Related stories</h2>
      <div className={styles.grid}>
        {posts.map((post) => (
          <article key={post.id} className={styles.card}>
            <Link to={ROUTES.postDetail(post.id)} className={styles.cardLink}>
              <div className={styles.thumb}>
                {post.imageUrl ? (
                  <img src={post.imageUrl} alt='' width={400} height={300} />
                ) : null}
              </div>
              <div className={styles.cardBody}>
                <h3 className={styles.cardTitle}>{post.title}</h3>
              </div>
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}

export default RelatedArticles;
