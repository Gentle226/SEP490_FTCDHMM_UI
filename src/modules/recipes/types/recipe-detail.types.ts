export interface RecipeIngredient {
  id: string;
  name: string;
}

export interface RecipeLabel {
  id: string;
  name: string;
  colorCode: string;
}

export interface CookingStepDetail {
  stepOrder: number;
  instruction: string;
  imageURL?: string;
}

export interface RecipeDetail {
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
  labels: RecipeLabel[];
  ingredients: RecipeIngredient[];
  cookingSteps: CookingStepDetail[];
  createdBy?: {
    id: string;
    userName: string;
    avatarUrl?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}
