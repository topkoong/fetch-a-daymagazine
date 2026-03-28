/**
 * **Hero** for the newest post on Home: uses `PostCardViewModel` (plain strings, optional image URL).
 * CTA copy comes from `COPY`; internal links use {@link ROUTES.postDetail}.
 */
import { COPY } from '@constants/copy.constants';
import { ROUTES } from '@constants/routes';
import { Link } from 'react-router-dom';

import styles from './FeaturedArticle.module.css';
import type { FeaturedArticleProps } from './FeaturedArticle.types';

function formatPublishedDate(iso: string | undefined): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function FeaturedArticle({ post }: FeaturedArticleProps) {
  const dateLabel = formatPublishedDate(post.date);

  return (
    <section className={styles.root} aria-labelledby='featured-article-heading'>
      <div className={styles.metaRow}>
        <span className={styles.featuredLabel} id='featured-article-label'>
          Featured
        </span>
        {post.categoryLabel ? (
          <span className={styles.categoryLabel}>{post.categoryLabel}</span>
        ) : null}
      </div>

      <div className={styles.imageWrap}>
        {post.imageUrl ? (
          <img src={post.imageUrl} alt={post.title} width={1200} height={675} />
        ) : null}
      </div>

      <div className={styles.body}>
        <h2 className={styles.title} id='featured-article-heading'>
          <Link className={styles.titleLink} to={ROUTES.postDetail(post.id)}>
            {post.title}
          </Link>
        </h2>
        {post.excerpt ? <p className={styles.excerpt}>{post.excerpt}</p> : null}
        <div className={styles.footerRow}>
          {dateLabel ? <time className={styles.date}>{dateLabel}</time> : <span />}
          <Link
            to={ROUTES.postDetail(post.id)}
            className={`${styles.cta} btn-primary text-sm font-semibold normal-case`}
          >
            {COPY.CARD_CTA} →
          </Link>
        </div>
      </div>
    </section>
  );
}

export default FeaturedArticle;
