export interface IngredientName {
  id: string;
  name: string;
}

export interface Label {
  id: string;
  name: string;
  colorCode: string;
}

export interface MyRecipe {
  id: string;
  name: string;
  description?: string;
  difficulty: {
    name: string;
    value: number;
  };
  cookTime: number;
  ration: number;
  imageUrl?: string;
  labels: Label[];
  ingredients: IngredientName[];
}

export interface MyRecipeResponse {
  items: MyRecipe[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}
