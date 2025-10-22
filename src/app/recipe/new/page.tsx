'use client';

import { RecipeForm } from '@/modules/recipes/components';

export default function NewRecipePage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-4xl font-bold text-[#99b94a]">Viết món mới</h1>
        <p className="text-gray-600">Chia sẻ công thức nấu ăn yêu thích của bạn với cộng đồng</p>
      </div>

      <RecipeForm />
    </div>
  );
}
