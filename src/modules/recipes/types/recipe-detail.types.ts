export interface RecipeIngredient {
  id?: string; // Optional for backward compatibility
  ingredientId?: string; // API might use this field name instead
  name: string;
  quantityGram: number;
}

export interface RecipeLabel {
  id: string;
  name: string;
  colorCode: string;
}

export interface CookingStepImageDetail {
  id: string;
  imageUrl?: string;
  imageOrder: number;
}

export interface CookingStepDetail {
  id: string;
  stepOrder: number;
  instruction: string;
  cookingStepImages: CookingStepImageDetail[];
  // Deprecated: keeping for backward compatibility
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
  isFavorited?: boolean;
  isSaved?: boolean;
  createdAtUtc?: string; // New field for creation timestamp
  updatedAtUtc?: string; // New field for update timestamp
  createdAt?: string; // Keep for backward compatibility
  updatedAt?: string; // Keep for backward compatibility
}
