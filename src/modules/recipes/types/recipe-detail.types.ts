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
  id: string;
  stepOrder: number;
  instruction: string;
  imageUrl?: string;
}

export interface RecipeDetail {
  id: string;
  name: string;
  description?: string;
  difficulty: {
    name?: string;
    value: string | number;
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
  author?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatarUrl?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}
