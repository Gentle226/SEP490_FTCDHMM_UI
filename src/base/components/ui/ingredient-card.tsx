import Image from 'next/image';

import { Skeleton } from './skeleton';

interface IngredientCardProps {
  name?: string;
  image?: string;
  isLoading?: boolean;
  onClick?: () => void;
}

export function IngredientCard({ name, image, isLoading, onClick }: IngredientCardProps) {
  if (isLoading) {
    return (
      <div className="group relative overflow-hidden rounded-lg bg-white shadow-sm transition-shadow hover:shadow-md">
        <Skeleton className="aspect-square w-full" />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3">
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    );
  }

  return (
    <div
      className="group relative cursor-pointer overflow-hidden rounded-lg bg-white shadow-sm transition-shadow hover:shadow-md"
      onClick={onClick}
    >
      <div className="relative aspect-square w-full overflow-hidden bg-gray-100">
        <Image
          src={image || '/outline-illustration-card.png'}
          alt={name || 'Ingredient'}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-110"
          sizes="(max-width: 640px) 25vw, (max-width: 768px) 20vw, (max-width: 1024px) 16vw, 12vw"
        />
      </div>
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3">
        <p className="line-clamp-1 text-left text-sm font-medium text-white">{name || 'Unnamed'}</p>
      </div>
    </div>
  );
}
