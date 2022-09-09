import placeholderImage from '@assets/images/placeholder.png';
import useIntersectionObserver from '@hooks/useIntersectionObserver';
import { useRef } from 'preact/hooks';

function Post({ post, group }: any) {
  const ref = useRef<HTMLImageElement | null>(null);
  const entry = useIntersectionObserver(ref, {});
  const isVisible = !!entry?.isIntersecting;
  return (
    <li
      className='bg-bright-yellow p-8 shadow-md'
      key={
        post?.id || Date.now().toString(16) + Math.random().toString(16) + '0'.repeat(16)
      }
    >
      <article className='grid grid-rows-3'>
        <header>
          <h2 className='post-title'>{post?.title?.rendered || ''}</h2>
        </header>
        <div className='flex flex-wrap justify-center'>
          <img
            ref={ref}
            className={`object-contain w-full duration-700 ease-in-out ${
              !isVisible && group !== 0
                ? 'grayscale blur-md scale-110'
                : 'grayscale-0 blur-0 scale-100'
            }
          `}
            src={
              // First category group is always in the viewport
              !isVisible && group !== 0
                ? placeholderImage
                : post?.featured_image?.sizes?.medium?.src
            }
            loading='lazy'
          />
        </div>
        <div className='text-center my-8'>
          <button className='btn-primary' onClick={() => window.open(post.link)}>
            <span className='text-black font-bold w-full h-full uppercase text-lg lg:text-xl'>
              Check this out!
            </span>
          </button>
        </div>
      </article>
    </li>
  );
}

export default Post;
