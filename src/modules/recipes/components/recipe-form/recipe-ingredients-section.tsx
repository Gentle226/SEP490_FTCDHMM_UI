'use client';

import { Beef, Globe, Plus, Search } from 'lucide-react';

import { Button } from '@/base/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/base/components/ui/command';
import { Label } from '@/base/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/base/components/ui/popover';
import {
  Ingredient,
  IngredientNameResponse,
  capitalizeFirstLetter,
} from '@/modules/ingredients/services/ingredient-management.service';

import { IngredientCardWithDetails } from '../ingredient-card-with-details';
import { SelectedIngredient } from './types';

interface RecipeIngredientsSectionProps {
  selectedIngredients: SelectedIngredient[];
  ingredientSearch: string;
  ingredientSearchResults: Ingredient[];
  usdaSearchResults: IngredientNameResponse[];
  isIngredientPopoverOpen: boolean;
  isLoadingIngredients: boolean;
  isLoadingUsdaSearch: boolean;
  debouncedIngredientSearch: string;
  onIngredientSearchChange: (value: string) => void;
  onPopoverOpenChange: (open: boolean) => void;
  onAddIngredient: (ingredient: Ingredient | IngredientNameResponse) => void;
  onRemoveIngredient: (ingredientId: string) => void;
  onUpdateQuantity: (ingredientId: string, quantityGram: number) => void;
  onSearchFromUsda: () => void;
}

export function RecipeIngredientsSection({
  selectedIngredients,
  ingredientSearch,
  ingredientSearchResults,
  usdaSearchResults,
  isIngredientPopoverOpen,
  isLoadingIngredients,
  isLoadingUsdaSearch,
  debouncedIngredientSearch,
  onIngredientSearchChange,
  onPopoverOpenChange,
  onAddIngredient,
  onRemoveIngredient,
  onUpdateQuantity,
  onSearchFromUsda,
}: RecipeIngredientsSectionProps) {
  return (
    <div className="space-y-4">
      <Label className="flex items-center gap-2">
        <Beef className="h-4 w-4 text-[#99b94a]" />
        Nguyên liệu
        <span className="text-red-500">*</span>
      </Label>

      {/* Selected Ingredients */}
      <div className="min-h-[150px] rounded-lg border p-3">
        {selectedIngredients.length === 0 ? (
          <div className="flex h-full items-center justify-center pt-13 text-sm text-gray-400">
            Chưa có nguyên liệu nào được chọn
          </div>
        ) : (
          <div className="space-y-3">
            {selectedIngredients.map((ingredient) => (
              <IngredientCardWithDetails
                key={ingredient.id}
                ingredient={ingredient}
                onUpdateQuantity={onUpdateQuantity}
                onRemove={onRemoveIngredient}
              />
            ))}
          </div>
        )}
      </div>

      {/* Search and Add Ingredients */}
      <Popover open={isIngredientPopoverOpen} onOpenChange={onPopoverOpenChange}>
        <PopoverTrigger asChild>
          <Button type="button" variant="outline" className="w-full">
            <Plus className="mr-2 h-4 w-4" />
            Nguyên liệu
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[calc(100vw-2rem)] max-w-[354px] p-0 sm:w-[354px]"
          align="start"
        >
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Tìm kiếm nguyên liệu..."
              value={ingredientSearch}
              onValueChange={onIngredientSearchChange}
            />
            <CommandList>
              {isLoadingIngredients ? (
                <div className="py-6 text-center text-sm text-gray-500">Đang tải...</div>
              ) : (
                <>
                  {/* Local ingredients results */}
                  {ingredientSearchResults.length > 0 && (
                    <CommandGroup heading="Nguyên liệu có sẵn">
                      {ingredientSearchResults.map((ingredient) => {
                        const isSelected = selectedIngredients.some((i) => i.id === ingredient.id);
                        return (
                          <CommandItem
                            key={ingredient.id}
                            onSelect={() => onAddIngredient(ingredient)}
                            disabled={isSelected}
                            className="cursor-pointer"
                          >
                            <div className="flex w-full items-center gap-2">
                              <span className="flex-1">{ingredient.name}</span>
                              {isSelected && <span className="text-xs text-gray-500">Đã chọn</span>}
                            </div>
                          </CommandItem>
                        );
                      })}
                    </CommandGroup>
                  )}

                  {/* USDA search results */}
                  {usdaSearchResults.length > 0 && (
                    <CommandGroup heading="Tìm thấy từ USDA">
                      {usdaSearchResults.map((ingredient) => {
                        const isSelected = selectedIngredients.some((i) => i.id === ingredient.id);
                        return (
                          <CommandItem
                            key={ingredient.id}
                            onSelect={() => onAddIngredient(ingredient)}
                            disabled={isSelected}
                            className="cursor-pointer"
                          >
                            <div className="flex w-full items-center gap-2">
                              <span className="flex-1">
                                {capitalizeFirstLetter(ingredient.name)}
                              </span>
                              <span className="text-xs text-amber-600">USDA</span>
                              {isSelected && <span className="text-xs text-gray-500">Đã chọn</span>}
                            </div>
                          </CommandItem>
                        );
                      })}
                    </CommandGroup>
                  )}

                  {/* Empty state */}
                  {ingredientSearchResults.length === 0 &&
                    usdaSearchResults.length === 0 &&
                    !isLoadingUsdaSearch &&
                    (debouncedIngredientSearch.trim().length >= 2 ? (
                      <CommandEmpty>Không tìm thấy nguyên liệu trong hệ thống.</CommandEmpty>
                    ) : (
                      <div className="py-6 text-center text-sm text-gray-500">
                        Nhập ít nhất 2 ký tự để tìm kiếm
                      </div>
                    ))}

                  {/* USDA Search Button */}
                  {debouncedIngredientSearch.trim().length >= 2 && (
                    <div className="border-t p-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="w-full gap-2"
                        disabled={isLoadingUsdaSearch}
                        onClick={onSearchFromUsda}
                      >
                        {isLoadingUsdaSearch ? (
                          <>
                            <Search className="h-4 w-4 animate-pulse" />
                            Đang tìm từ USDA...
                          </>
                        ) : (
                          <>
                            <Globe className="h-4 w-4" />
                            Tìm từ USDA
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
