'use client';

import { ChevronDown, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

import {
  type IngredientListItem,
  ingredientPublicService,
} from '@/modules/ingredients/services/ingredient-public.service';

import { useCreateIngredientRestriction } from '../hooks';
import { RestrictionType } from '../types';

interface CreateIngredientRestrictionFormProps {
  onSuccess?: () => void;
}

/**
 * Form component for creating ingredient-level dietary restrictions
 */
export function CreateIngredientRestrictionForm({
  onSuccess,
}: CreateIngredientRestrictionFormProps) {
  const [ingredients, setIngredients] = useState<IngredientListItem[]>([]);
  const [selectedIngredient, setSelectedIngredient] = useState<string>('');
  const [type, setType] = useState<RestrictionType>(RestrictionType.ALLERGY);
  const [notes, setNotes] = useState('');
  const [expiredAtUtc, setExpiredAtUtc] = useState('');
  const [isLoadingIngredients, setIsLoadingIngredients] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  const { mutate: createRestriction, isPending } = useCreateIngredientRestriction();

  // Fetch ingredients on component mount and when search changes
  useEffect(() => {
    const fetchIngredients = async () => {
      setIsLoadingIngredients(true);
      try {
        const response = await ingredientPublicService.getIngredients({
          search: searchQuery || undefined,
          pageSize: 20,
        });
        setIngredients(response.items);
      } catch (error) {
        console.error('Failed to fetch ingredients:', error);
      } finally {
        setIsLoadingIngredients(false);
      }
    };

    const timeoutId = setTimeout(fetchIngredients, 300); // Debounce search
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleSelectIngredient = (id: string) => {
    setSelectedIngredient(id);
    setShowDropdown(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedIngredient) {
      alert('Vui lòng chọn thực phẩm');
      return;
    }

    createRestriction(
      {
        ingredientId: selectedIngredient,
        type,
        notes: notes || undefined,
        expiredAtUtc: expiredAtUtc || undefined,
      },
      {
        onSuccess: () => {
          setSelectedIngredient('');
          setType(RestrictionType.ALLERGY);
          setNotes('');
          setExpiredAtUtc('');
          setSearchQuery('');
          onSuccess?.();
        },
      },
    );
  };

  const selectedIngredientName = ingredients.find((ing) => ing.id === selectedIngredient)?.name;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Ingredient Selector */}
      <div>
        <label htmlFor="ingredient-search" className="mb-2 block text-sm font-medium text-gray-700">
          Chọn thực phẩm <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex w-full items-center justify-between rounded-lg border border-gray-300 px-3 py-2 text-left hover:border-gray-400 focus:ring-2 focus:ring-[#99b94a] focus:outline-none"
          >
            <span className={selectedIngredientName ? 'text-gray-900' : 'text-gray-500'}>
              {selectedIngredientName || 'Chọn thực phẩm...'}
            </span>
            <ChevronDown
              size={18}
              className={`transition-transform ${showDropdown ? 'rotate-180' : ''}`}
            />
          </button>

          {showDropdown && (
            <div className="absolute top-full right-0 left-0 z-10 mt-1 rounded-lg border border-gray-300 bg-white shadow-lg">
              {/* Search input */}
              <input
                type="text"
                placeholder="Tìm kiếm thực phẩm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full border-b border-gray-200 px-3 py-2 focus:ring-2 focus:ring-[#99b94a] focus:outline-none"
                autoFocus
              />

              {/* Dropdown items */}
              <div className="max-h-48 overflow-y-auto">
                {isLoadingIngredients ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 size={20} className="animate-spin text-gray-400" />
                  </div>
                ) : ingredients.length === 0 ? (
                  <div className="px-3 py-8 text-center text-sm text-gray-500">
                    Không tìm thấy thực phẩm nào
                  </div>
                ) : (
                  ingredients.map((ingredient) => (
                    <button
                      key={ingredient.id}
                      type="button"
                      onClick={() => handleSelectIngredient(ingredient.id)}
                      className="flex w-full items-center gap-2 border-b border-gray-100 px-3 py-2 text-left last:border-b-0 hover:bg-gray-100"
                    >
                      {ingredient.imageUrl && (
                        <div className="h-8 w-8 flex-shrink-0 overflow-hidden rounded">
                          <img
                            src={ingredient.imageUrl}
                            alt={ingredient.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{ingredient.name}</p>
                        {ingredient.categoryNames?.length > 0 && (
                          <p className="text-xs text-gray-500">
                            {ingredient.categoryNames.map((c) => c.name).join(', ')}
                          </p>
                        )}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Restriction Type */}
      <div>
        <label htmlFor="type" className="mb-2 block text-sm font-medium text-gray-700">
          Loại hạn chế <span className="text-red-500">*</span>
        </label>
        <select
          id="type"
          value={type}
          onChange={(e) => setType(e.target.value as RestrictionType)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-[#99b94a] focus:outline-none"
        >
          <option value={RestrictionType.ALLERGY}>Dị ứng</option>
          <option value={RestrictionType.DISLIKE}>Không thích</option>
          <option value={RestrictionType.TEMPORARYAVOID}>Tạm tránh</option>
        </select>
      </div>

      {/* Notes */}
      <div>
        <label htmlFor="notes" className="mb-2 block text-sm font-medium text-gray-700">
          Ghi chú (tuỳ chọn)
        </label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value.slice(0, 255))}
          maxLength={255}
          placeholder="Ví dụ: Dị ứng với động vật có vỏ, tránh sữa bò..."
          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-[#99b94a] focus:outline-none"
          rows={3}
        />
        <p className="mt-1 text-xs text-gray-400">{notes.length}/255</p>
      </div>

      {/* Expiry Date */}
      <div>
        <label htmlFor="expiry" className="mb-2 block text-sm font-medium text-gray-700">
          Ngày hết hạn (tuỳ chọn)
        </label>
        <input
          id="expiry"
          type="datetime-local"
          value={expiredAtUtc}
          onChange={(e) => setExpiredAtUtc(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-[#99b94a] focus:outline-none"
        />
        <p className="mt-1 text-xs text-gray-500">Để trống nếu hạn chế không có thời hạn</p>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isPending || isLoadingIngredients}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#99b94a] px-4 py-2 font-medium text-white hover:bg-[#88a43a] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending && <Loader2 size={18} className="animate-spin" />}
        {isPending ? 'Đang thêm...' : 'Thêm hạn chế'}
      </button>
    </form>
  );
}
