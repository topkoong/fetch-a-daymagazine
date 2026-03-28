import { PRIMARY_NAV_CATEGORIES } from '@constants/nav-categories';
import { Link } from 'react-router-dom';

import styles from './CategoryChips.module.css';

const SORTED = Object.entries(PRIMARY_NAV_CATEGORIES).sort((a, b) =>
  a[1].localeCompare(b[1], 'en'),
);

function CategoryChips() {
  return (
    <nav className='mx-auto max-w-6xl px-1 sm:px-3' aria-label='Browse categories'>
      <div className={styles.track}>
        {SORTED.map(([categoryId, label]) => (
          <Link
            key={categoryId}
            to={`/posts/categories/${categoryId}`}
            state={{ category: label }}
            className={styles.chip}
          >
            {label}
          </Link>
        ))}
      </div>
    </nav>
  );
}

export default CategoryChips;
