interface SpinnerProps {
  /** Accessible status label for screen readers. */
  label?: string;
  className?: string;
}

function Spinner({ label = 'Loading', className = '' }: SpinnerProps) {
  return (
    <div
      className={`loader flex space-x-3 rounded-full p-5 ${className}`}
      role='status'
      aria-live='polite'
      aria-busy
      aria-label={label}
    >
      <span className='sr-only'>{label}</span>
      <div className='h-5 w-5 animate-bounce rounded-full bg-dull-black' />
      <div className='h-5 w-5 animate-bounce rounded-full bg-dull-black' />
      <div className='h-5 w-5 animate-bounce rounded-full bg-dull-black' />
    </div>
  );
}

export default Spinner;
