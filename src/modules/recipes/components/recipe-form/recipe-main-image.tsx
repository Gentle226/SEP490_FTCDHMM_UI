'use client';

import { ImageIcon, Salad, X } from 'lucide-react';
import Image from 'next/image';

import { Label } from '@/base/components/ui/label';

interface RecipeMainImageProps {
  mainImagePreview: string | null;
  isDragOver: boolean;
  onRemoveImage: () => void;
  onMainImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDragOver: (e: React.DragEvent<HTMLLabelElement>) => void;
  onDragLeave: (e: React.DragEvent<HTMLLabelElement>) => void;
  onDrop: (e: React.DragEvent<HTMLLabelElement>) => void;
}

export function RecipeMainImage({
  mainImagePreview,
  isDragOver,
  onRemoveImage,
  onMainImageChange,
  onDragOver,
  onDragLeave,
  onDrop,
}: RecipeMainImageProps) {
  return (
    <div className="space-y-2">
      <Label>
        <ImageIcon className="h-4 w-4 text-[#99b94a]" />
        Hình ảnh món ăn
      </Label>
      {mainImagePreview ? (
        <div className="relative h-75 w-full overflow-hidden rounded-lg border">
          <Image
            src={mainImagePreview}
            alt="Recipe preview"
            fill
            sizes="(max-width: 768px) 100vw, 300px"
            className="object-cover"
          />
          <button
            type="button"
            onClick={onRemoveImage}
            className="absolute top-2 right-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
            aria-label="Remove image"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <label
          className={`flex h-75 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-all ${
            isDragOver
              ? 'border-[#99b94a] bg-green-50 ring-2 ring-[#b2df3f]'
              : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
          }`}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
        >
          <Salad
            className={`h-8 w-8 transition-colors ${
              isDragOver ? 'text-[#99b94a]' : 'text-gray-400'
            }`}
          />
          <span
            className={`mt-2 px-2 text-center text-xs transition-colors ${
              isDragOver ? 'text-[#99b94a]' : 'text-gray-500'
            }`}
          >
            {isDragOver ? 'Thả ảnh vào đây' : 'Tải ảnh lên hoặc kéo thả'}
          </span>
          <input type="file" accept="image/*" className="hidden" onChange={onMainImageChange} />
        </label>
      )}
    </div>
  );
}
