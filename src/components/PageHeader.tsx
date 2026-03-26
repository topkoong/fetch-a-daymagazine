interface PageHeaderProps {
  title: string;
  subtitle?: string;
}

function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <header className='mx-auto max-w-5xl px-4 text-center'>
      <h1 className='page-title'>{title}</h1>
      {subtitle ? (
        <p className='mx-auto max-w-3xl text-sm font-medium leading-relaxed text-dull-black/80 sm:text-base'>
          {subtitle}
        </p>
      ) : null}
    </header>
  );
}

export default PageHeader;
