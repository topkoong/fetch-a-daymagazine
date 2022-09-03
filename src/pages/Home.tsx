import '../app.css';

import fetchCategories from '@apis/categories';
import fetchPosts from '@apis/posts';
import CategoryHeader from '@components/CategoryHeader';
import PageBreak from '@components/PageBreak';
import PageHeader from '@components/PageHeader';
import Post from '@components/Post';
import Spinner from '@components/Spinner';
import { REFETCH_INTERVAL } from '@constants/index';
import { useMemo } from 'preact/hooks';
import { useQuery } from 'react-query';

interface Keyable {
  [key: string]: string;
}

function Home() {
  const {
    data: postData,
    error: postError,
    status: postStatus,
  } = useQuery('allposts', fetchPosts, {
    refetchInterval: REFETCH_INTERVAL,
  });
  const {
    data: categoryData,
    error: categoryError,
    status: categoryStatus,
  } = useQuery('allcategories', fetchCategories, {
    refetchInterval: REFETCH_INTERVAL,
  });

  const nonThaiCategories = useMemo(() => {
    const regEx = /^[A-Za-z0-9]*$/;
    const nonThaiCategoriesObj: any = {};
    categoryData
      ?.filter((section: any) => regEx.test(section.name))
      ?.forEach((section: any) => {
        nonThaiCategoriesObj[section.id] = section.name;
      });
    return nonThaiCategoriesObj;
  }, [categoryData]);

  const nonThaiCategoryNames = useMemo(() => {
    const nonThaiCategoryNamesArr: string[] = Object.values(nonThaiCategories);
    return nonThaiCategoryNamesArr;
  }, [nonThaiCategories]);

  const postsWithCategoryNames = useMemo(
    () =>
      postData
        ?.map((fetchedPost: any) => ({
          ...fetchedPost,
          categories: fetchedPost?.categories
            ?.map((category: any) =>
              Object.keys(nonThaiCategories).includes(`${category}`)
                ? nonThaiCategories[`${category}`]
                : null,
            )
            ?.filter(Boolean),
        }))
        ?.filter((fetchedPost: any) => fetchedPost?.categories?.length),
    [nonThaiCategories, postData],
  );

  const groupPostByCategories = useMemo(
    () =>
      nonThaiCategoryNames
        ?.map((nonThaiCategoryName: any) => ({
          [nonThaiCategoryName]: postsWithCategoryNames
            ?.filter(({ categories }: any) => categories.includes(nonThaiCategoryName))
            ?.flat(),
        }))
        ?.filter((elem) => elem && Object.values(elem)[0]?.length),
    [nonThaiCategoryNames, postsWithCategoryNames],
  );

  const categories = useMemo(
    () =>
      groupPostByCategories?.map(
        (groupPostByCategory) => Object.keys(groupPostByCategory)[0],
      ),
    [groupPostByCategories],
  ) as any[];

  return (
    <article className='bg-bright-green w-full h-full pb-4'>
      <PageHeader title='Fetch a day magazine' />
      {(postStatus || categoryStatus) === 'loading' ? (
        <div className='spinner-container h-full'>
          <Spinner />
        </div>
      ) : (postError || categoryError) instanceof Error ? (
        <span>
          Error:
          {(postError as Keyable)?.message || (categoryError as Keyable)?.message}
        </span>
      ) : (
        <ul className='px-6 h-full'>
          {categories.map((category, idx) => (
            <li
              className='w-full my-16 h-full'
              key={
                category +
                Date.now().toString(16) +
                Math.random().toString(16) +
                '0'.repeat(16)
              }
            >
              <CategoryHeader
                category={category}
                nonThaiCategoriesMapping={nonThaiCategories}
              />
              <PageBreak />
              {groupPostByCategories && (
                <ul className='grid grid-cols-1 gap-12 lg:gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 px-6 my-8'>
                  {groupPostByCategories[idx][category].slice(0, 5).map((post: any) => (
                    <Post key={post.id} post={post} />
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}

export default Home;
