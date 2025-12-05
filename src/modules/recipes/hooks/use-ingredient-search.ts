'use client';

import { useEffect, useState } from 'react';

import { useDebounce } from '@/base/hooks';
import {
  Ingredient,
  IngredientNameResponse,
  capitalizeFirstLetter,
  ingredientManagementService,
} from '@/modules/ingredients/services/ingredient-management.service';
import { ingredientPublicService } from '@/modules/ingredients/services/ingredient-public.service';
import { SelectedIngredient } from '@/modules/recipes/components/recipe-form/types';

export interface UseIngredientSearchResult {
  // State
  ingredientSearch: string;
  setIngredientSearch: (value: string) => void;
  ingredientSearchResults: Ingredient[];
  usdaSearchResults: IngredientNameResponse[];
  isIngredientPopoverOpen: boolean;
  setIsIngredientPopoverOpen: (value: boolean) => void;
  isLoadingIngredients: boolean;
  isLoadingUsdaSearch: boolean;
  debouncedIngredientSearch: string;

  // Selected ingredients
  selectedIngredients: SelectedIngredient[];
  setSelectedIngredients: React.Dispatch<React.SetStateAction<SelectedIngredient[]>>;

  // Actions
  addIngredient: (ingredient: Ingredient | IngredientNameResponse) => void;
  removeIngredient: (ingredientId: string) => void;
  updateIngredientQuantity: (ingredientId: string, quantityGram: number) => void;
  handleSearchFromUsda: () => Promise<void>;
}

export function useIngredientSearch(
  initialIngredients: SelectedIngredient[] = [],
): UseIngredientSearchResult {
  const [selectedIngredients, setSelectedIngredients] =
    useState<SelectedIngredient[]>(initialIngredients);
  const [ingredientSearch, setIngredientSearch] = useState('');
  const [ingredientSearchResults, setIngredientSearchResults] = useState<Ingredient[]>([]);
  const [usdaSearchResults, setUsdaSearchResults] = useState<IngredientNameResponse[]>([]);
  const [isIngredientPopoverOpen, setIsIngredientPopoverOpen] = useState(false);
  const [isLoadingIngredients, setIsLoadingIngredients] = useState(false);
  const [isLoadingUsdaSearch, setIsLoadingUsdaSearch] = useState(false);
  const debouncedIngredientSearch = useDebounce(ingredientSearch, 300);

  // Search ingredients from local database (using public API for recipe creation)
  useEffect(() => {
    async function searchIngredients() {
      if (!isIngredientPopoverOpen) return;

      setIsLoadingIngredients(true);
      setUsdaSearchResults([]); // Clear USDA results when starting new search
      try {
        const response = await ingredientPublicService.getIngredients({
          keyword: debouncedIngredientSearch,
          pageNumber: 1,
          pageSize: 50,
        });
        // Map public service response to Ingredient interface
        const mappedItems = response.items.map((item) => ({
          id: item.id,
          name: item.name,
          description: item.description,
          image: item.imageUrl,
          ingredientCategoryIds: item.categoryNames?.map((cat) => cat.id) || [],
          categoryNames: item.categoryNames?.map((cat) => cat.name) || [],
          nutrients: [],
          lastUpdatedUtc: item.lastUpdatedUtc,
          isNew: item.isNew,
        }));
        setIngredientSearchResults(mappedItems);
      } catch (error) {
        console.error('Failed to search ingredients:', error);
      } finally {
        setIsLoadingIngredients(false);
      }
    }

    searchIngredients();
  }, [debouncedIngredientSearch, isIngredientPopoverOpen]);

  // Manual USDA search function (triggered by button click)
  const handleSearchFromUsda = async () => {
    if (debouncedIngredientSearch.trim().length < 2) {
      return;
    }

    setIsLoadingUsdaSearch(true);
    try {
      const results = await ingredientManagementService.searchForRecipe(debouncedIngredientSearch);
      setUsdaSearchResults(results);
    } catch (error) {
      console.error('Failed to search from USDA:', error);
      setUsdaSearchResults([]);
    } finally {
      setIsLoadingUsdaSearch(false);
    }
  };

  // Add ingredient from local database or USDA search
  const addIngredient = (ingredient: Ingredient | IngredientNameResponse) => {
    if (!selectedIngredients.some((i) => i.id === ingredient.id)) {
      // Capitalize the first letter of ingredient name for consistency
      const normalizedName = capitalizeFirstLetter(ingredient.name);
      setSelectedIngredients((prev) => [
        ...prev,
        { id: ingredient.id, name: normalizedName, quantityGram: 0 },
      ]);
    }
    setIsIngredientPopoverOpen(false);
    setIngredientSearch('');
    setUsdaSearchResults([]);
  };

  const removeIngredient = (ingredientId: string) => {
    setSelectedIngredients((prev) => prev.filter((i) => i.id !== ingredientId));
  };

  const updateIngredientQuantity = (ingredientId: string, quantityGram: number) => {
    setSelectedIngredients((prev) =>
      prev.map((ing) => (ing.id === ingredientId ? { ...ing, quantityGram } : ing)),
    );
  };

  return {
    ingredientSearch,
    setIngredientSearch,
    ingredientSearchResults,
    usdaSearchResults,
    isIngredientPopoverOpen,
    setIsIngredientPopoverOpen,
    isLoadingIngredients,
    isLoadingUsdaSearch,
    debouncedIngredientSearch,
    selectedIngredients,
    setSelectedIngredients,
    addIngredient,
    removeIngredient,
    updateIngredientQuantity,
    handleSearchFromUsda,
  };
}
