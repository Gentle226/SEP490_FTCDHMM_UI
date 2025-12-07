'use client';

import { Lightbulb, X } from 'lucide-react';
import { useState } from 'react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/base/components/ui/dialog';
import { Input } from '@/base/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/base/components/ui/popover';
import { ingredientPublicService } from '@/modules/ingredients/services/ingredient-public.service';

interface IngredientCardProps {
  ingredient: {
    id: string;
    name: string;
    quantityGram: number;
  };
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
}

interface IngredientDetails {
  id: string;
  name: string;
  description?: string;
  calories?: number;
  image?: string;
  ingredientCategoryIds?: string[];
  lastUpdatedUtc?: string;
  nutrients?: Array<{
    vietnameseName?: string;
    unit?: string;
    min?: number;
    max?: number;
    median?: number;
  }>;
}

export function IngredientCardWithDetails({
  ingredient,
  onUpdateQuantity,
  onRemove,
}: IngredientCardProps) {
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isHoverPopoverOpen, setIsHoverPopoverOpen] = useState(false);
  const [ingredientDetails, setIngredientDetails] = useState<IngredientDetails | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  const fetchIngredientDetails = async () => {
    if (ingredientDetails) return; // Already loaded

    setIsLoadingDetails(true);
    try {
      const apiResponse = await ingredientPublicService.getIngredientById(ingredient.id);
      // Map public service response to component's IngredientDetails interface
      const details: IngredientDetails = {
        id: apiResponse.id,
        name: apiResponse.name,
        description: apiResponse.description,
        calories: apiResponse.calories,
        image: apiResponse.imageUrl,
        ingredientCategoryIds: apiResponse.categories?.map((c) => c.id) || [],
        lastUpdatedUtc: apiResponse.lastUpdatedUtc,
        nutrients:
          apiResponse.nutrients?.map((n) => ({
            vietnameseName: n.vietnameseName,
            unit: n.unit,
            min: n.minValue,
            max: n.maxValue,
            median: n.medianValue,
          })) || [],
      };
      setIngredientDetails(details);
    } catch (error) {
      console.error('Failed to fetch ingredient details:', error);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const handleCardClick = async (e: React.MouseEvent) => {
    // Don't trigger if clicking on input or remove button
    if ((e.target as HTMLElement).closest('input') || (e.target as HTMLElement).closest('button')) {
      return;
    }

    await fetchIngredientDetails();
    setIsDetailDialogOpen(true);
  };

  const handleMouseEnter = async () => {
    await fetchIngredientDetails();
    setIsHoverPopoverOpen(true);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const utcDateString = dateString.endsWith('Z') ? dateString : dateString + 'Z';
    return new Date(utcDateString).toLocaleDateString();
  };

  // Get key nutrients for popover preview - prioritize macronutrients
  const getKeyNutrients = () => {
    if (!ingredientDetails?.nutrients) return [];

    const nutrients = ingredientDetails.nutrients;
    const macroKeywords = [
      'protein',
      'chất đạm',
      'fat',
      'tổng chất béo',
      'carbohydrate',
      'tinh bột',
    ];
    const prioritizedNutrients: typeof nutrients = [];
    const remainingNutrients: typeof nutrients = [];

    // Separate macronutrients and others
    nutrients.forEach((nutrient) => {
      const name = (nutrient.vietnameseName || '').toLowerCase();
      if (macroKeywords.some((keyword) => name.includes(keyword))) {
        prioritizedNutrients.push(nutrient);
      } else {
        remainingNutrients.push(nutrient);
      }
    });

    // Return top 3 macronutrients + 1 other
    return [...prioritizedNutrients.slice(0, 3), ...remainingNutrients.slice(0, 1)];
  };

  return (
    <>
      <Popover open={isHoverPopoverOpen} onOpenChange={setIsHoverPopoverOpen}>
        <PopoverTrigger asChild>
          <div
            onMouseEnter={handleMouseEnter}
            onMouseLeave={() => setIsHoverPopoverOpen(false)}
            onClick={handleCardClick}
            className="group flex cursor-pointer flex-col gap-2 rounded-lg border bg-white px-2 py-2 transition-all hover:border-lime-400 hover:bg-lime-50 hover:shadow-md sm:flex-row sm:items-center sm:gap-3 sm:px-3 sm:py-2.5"
            title="Nhấp để xem chi tiết đầy đủ"
          >
            <span className="flex-1 text-xs font-medium group-hover:text-lime-700 sm:text-sm">
              {ingredient.name}
            </span>
            <div className="flex items-center justify-between gap-2 sm:justify-end">
              <Input
                type="number"
                placeholder="0"
                value={ingredient.quantityGram || ''}
                onChange={(e) => {
                  const newValue = parseFloat(e.target.value) || 0;
                  onUpdateQuantity(ingredient.id, newValue);
                }}
                onClick={(e) => e.stopPropagation()}
                min="0"
                step="0.1"
                className="h-8 w-16 text-right text-sm sm:h-9 sm:w-20 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                required
              />
              <span className="text-xs text-gray-500 sm:text-sm">g</span>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onRemove(ingredient.id);
              }}
              className="flex-shrink-0 rounded-full p-1 hover:bg-red-100"
              aria-label={`Xóa ${ingredient.name}`}
            >
              <X className="h-4 w-4 text-red-600" />
            </button>
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-80" side="right" align="start">
          {isLoadingDetails ? (
            <div className="flex items-center justify-center py-4">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-lime-600 border-t-transparent" />
            </div>
          ) : ingredientDetails ? (
            <div className="space-y-3">
              <div>
                <h4 className="font-semibold text-lime-700">{ingredientDetails.name}</h4>
                {ingredientDetails.description && (
                  <p className="text-muted-foreground mt-1 text-xs">
                    {ingredientDetails.description.slice(0, 100)}
                    {ingredientDetails.description.length > 100 ? '...' : ''}
                  </p>
                )}
              </div>

              {getKeyNutrients().length > 0 && (
                <div className="space-y-1">
                  <p className="text-xs font-medium text-gray-700">Dinh dưỡng chính (100g):</p>
                  <div className="grid grid-cols-2 gap-2">
                    {getKeyNutrients().map((nutrient, index) => (
                      <div key={index} className="rounded border bg-gray-50 p-2">
                        <div className="text-xs font-medium">
                          {nutrient.vietnameseName || 'N/A'}
                        </div>
                        <div className="text-xs text-gray-600">
                          {nutrient.median !== undefined ? (
                            <>
                              {nutrient.median} {nutrient.unit}
                            </>
                          ) : (
                            'N/A'
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="border-t pt-4">
                <p className="flex items-center justify-center gap-1 text-xs text-lime-600">
                  <Lightbulb className="h-4 w-4 text-lime-600" />
                  Nhấp vào thẻ để xem chi tiết đầy đủ
                </p>
              </div>
            </div>
          ) : null}
        </PopoverContent>
      </Popover>

      {/* Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle className="text-3xl text-[#99b94a]">Chi tiết nguyên liệu</DialogTitle>
            <DialogDescription>Thông tin chi tiết và hàm lượng dinh dưỡng</DialogDescription>
          </DialogHeader>

          {ingredientDetails && (
            <div className="space-y-4">
              {/* Image and Basic Info - Side by Side Layout */}
              <div className="flex flex-col gap-4 sm:flex-row">
                {/* Image on the left */}
                <div className="flex-shrink-0">
                  {ingredientDetails.image ? (
                    <div className="flex justify-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={ingredientDetails.image}
                        alt={ingredientDetails.name}
                        className="h-48 w-48 rounded-lg object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex h-48 w-48 items-center justify-center rounded-lg bg-gray-100">
                      <span className="text-muted-foreground text-sm">Không có hình ảnh</span>
                    </div>
                  )}
                </div>

                {/* Info on the right */}
                <div className="flex-1 space-y-3">
                  <div>
                    <span className="font-semibold">Tên: </span>
                    <span>{ingredientDetails.name}</span>
                  </div>

                  {ingredientDetails.description && (
                    <div>
                      <span className="font-semibold">Mô tả: </span>
                      <span>{ingredientDetails.description}</span>
                    </div>
                  )}

                  {ingredientDetails.calories !== undefined && (
                    <div>
                      <span className="font-semibold">Năng lượng: </span>
                      <span>{ingredientDetails.calories} kcal/100g</span>
                    </div>
                  )}

                  <div>
                    <span className="font-semibold">Cập nhật lần cuối: </span>
                    <span>{formatDate(ingredientDetails.lastUpdatedUtc)}</span>
                  </div>
                </div>
              </div>

              {/* Nutrients */}
              <div className="space-y-2">
                <h4 className="font-semibold text-[#99b94a]">Hàm lượng dinh dưỡng (trên 100g)</h4>
                {!ingredientDetails.nutrients || ingredientDetails.nutrients.length === 0 ? (
                  <p className="text-muted-foreground text-sm">Chưa có thông tin dinh dưỡng</p>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {ingredientDetails.nutrients.map((nutrient, index) => (
                      <div key={index} className="rounded-lg border bg-lime-50 p-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">
                            {nutrient.vietnameseName || `Dinh dưỡng ${index + 1}`}
                          </span>
                          {nutrient.unit && (
                            <span className="text-muted-foreground text-xs">({nutrient.unit})</span>
                          )}
                        </div>
                        <div className="mt-1 space-y-1 text-xs">
                          {nutrient.min !== undefined && (
                            <div>
                              <span className="text-muted-foreground">Min: </span>
                              <span className="font-medium">{nutrient.min}</span>
                            </div>
                          )}
                          {nutrient.median !== undefined && (
                            <div>
                              <span className="text-muted-foreground">Median: </span>
                              <span className="font-medium text-lime-700">{nutrient.median}</span>
                            </div>
                          )}
                          {nutrient.max !== undefined && (
                            <div>
                              <span className="text-muted-foreground">Max: </span>
                              <span className="font-medium">{nutrient.max}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
