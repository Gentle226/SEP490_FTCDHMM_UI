import Image from 'next/image';

import { Skeleton } from '@/base/components/ui/skeleton';
import { cn } from '@/base/lib';

interface RecipeCardProps {
  title?: string;
  author?: string;
  authorAvatar?: string;
  image?: string;
  className?: string;
  isLoading?: boolean;
}

export function RecipeCard({
  title,
  author,
  authorAvatar,
  image,
  className,
  isLoading = true,
}: RecipeCardProps) {
  if (isLoading) {
    return (
      <div className={cn('group cursor-pointer', className)}>
        <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
          <Skeleton className="h-full w-full" />
        </div>
        <div className="mt-2 space-y-1">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
    );
  }

  return (
    <div className={cn('group cursor-pointer', className)}>
      <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-gray-100">
        <Image
          src={image || '/Outline Illustration Card.png'}
          alt={title || 'Recipe Image'}
          width={400}
          height={300}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
          priority={false}
        />
      </div>
      <div className="mt-2 flex items-center gap-2">
        {authorAvatar && (
          <Image
            src={authorAvatar}
            alt={author || 'Author'}
            width={32}
            height={32}
            className="h-8 w-8 flex-shrink-0 rounded-full object-cover"
            priority={false}
          />
        )}
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-medium text-gray-900 group-hover:text-orange-600">
            {title || 'Tên món ăn'}
          </h3>
          <p className="truncate text-xs text-gray-500">{author || 'Tác giả'}</p>
        </div>
      </div>
    </div>
  );
}
