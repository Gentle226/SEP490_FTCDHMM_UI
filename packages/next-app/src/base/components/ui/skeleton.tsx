import { cn } from '@/base/lib/index';

function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="skeleton"
      className={cn('bg-muted-foreground/45 animate-pulse rounded-md', className)}
      {...props}
    />
  );
}

export { Skeleton };
