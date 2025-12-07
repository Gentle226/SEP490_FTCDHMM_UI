'use client';

import { Lightbulb } from 'lucide-react';
import { useState } from 'react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/base/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/base/components/ui/popover';
import {
  IngredientRestrictionBadge,
  UserDietRestrictionResponse,
  checkIngredientCategoryRestriction,
  checkIngredientRestriction,
} from '@/modules/diet-restriction';
import { ingredientPublicService } from '@/modules/ingredients';

interface IngredientCardDetailProps {
  ingredient: {
    id?: string;
    name: string;
    quantityGram: number;
  };
  dietRestrictions?: UserDietRestrictionResponse[];
}

interface IngredientDetails {
  id: string;
  name: string;
  description?: string;
  calories?: number;
  image?: string;
  ingredientCategoryIds?: string[];
  categories?: Array<{
    id: string;
    name: string;
  }>;
  lastUpdatedUtc?: string;
  nutrients?: Array<{
    vietnameseName?: string;
    unit?: string;
    value?: number;
  }>;
}

export function IngredientCardDetail({
  ingredient,
  dietRestrictions = [],
}: IngredientCardDetailProps) {
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isHoverPopoverOpen, setIsHoverPopoverOpen] = useState(false);
  const [ingredientDetails, setIngredientDetails] = useState<IngredientDetails | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  // Check if this ingredient has any diet restrictions (by name)
  const restrictionMatches = checkIngredientRestriction(ingredient.name, dietRestrictions);

  // Check if this ingredient's categories have restrictions
  const categoryRestrictionMatches = ingredientDetails?.ingredientCategoryIds
    ? checkIngredientCategoryRestriction(ingredientDetails.ingredientCategoryIds, dietRestrictions)
    : [];

  const fetchIngredientDetails = async () => {
    if (ingredientDetails || !ingredient.id) return; // Already loaded or no ID

    setIsLoadingDetails(true);
    try {
      const details = await ingredientPublicService.getIngredientById(ingredient.id);
      setIngredientDetails({
        id: details.id,
        name: details.name,
        description: details.description,
        calories: details.calories,
        image: details.imageUrl,
        ingredientCategoryIds: details.categories?.map((c) => c.id) || [],
        categories: details.categories || [],
        lastUpdatedUtc: details.lastUpdatedUtc,
        nutrients: (details.nutrients || []).map((n) => ({
          vietnameseName: n.vietnameseName,
          unit: n.unit,
          value: n.value,
        })),
      });
    } catch (error) {
      console.error('Failed to fetch ingredient details:', error);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const handleCardClick = async () => {
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
            className="group flex cursor-pointer items-center justify-between rounded-lg border bg-gray-50 px-4 py-3 transition-all hover:border-lime-400 hover:bg-lime-50 hover:shadow-md"
            title="Nhấp để xem chi tiết đầy đủ"
          >
            <div className="flex-1 space-y-1">
              <span className="flex items-center gap-2 text-sm font-semibold text-gray-800 group-hover:text-lime-700">
                {ingredient.name || 'Không tên'}
                {(restrictionMatches.length > 0 || categoryRestrictionMatches.length > 0) && (
                  <IngredientRestrictionBadge
                    restrictions={[...restrictionMatches, ...categoryRestrictionMatches]}
                    compact
                  />
                )}
              </span>
            </div>
            <span className="ml-2 text-xs font-medium text-gray-600">
              {ingredient.quantityGram ? `${ingredient.quantityGram}g` : ''}
            </span>
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

              {ingredientDetails.categories && ingredientDetails.categories.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-gray-700">Phân loại:</p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {ingredientDetails.categories.map((category) => (
                      <span
                        key={category.id}
                        className="inline-flex rounded-md bg-lime-100 px-2 py-1 text-xs font-medium text-lime-700"
                      >
                        {category.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

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
                          {nutrient.value !== undefined ? (
                            <>
                              {nutrient.value} {nutrient.unit}
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
                        className="h-56 w-56 rounded-lg object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex h-56 w-56 items-center justify-center rounded-lg bg-gray-100">
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

                  {ingredientDetails.categories && ingredientDetails.categories.length > 0 && (
                    <div>
                      <span className="font-semibold">Phân loại: </span>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {ingredientDetails.categories.map((category) => (
                          <span
                            key={category.id}
                            className="inline-flex rounded-md bg-lime-100 px-3 py-1 text-sm font-medium text-lime-700"
                          >
                            {category.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
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
                        <div className="mt-1">
                          {nutrient.value !== undefined ? (
                            <span className="text-lg font-semibold text-lime-700">
                              {nutrient.value}
                            </span>
                          ) : (
                            <span className="text-muted-foreground text-sm">N/A</span>
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
