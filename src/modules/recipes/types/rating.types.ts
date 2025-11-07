/**
 * Rating request to create or update a recipe rating
 */
export interface CreateRatingRequest {
  score: number;
}

/**
 * Rating response from the API
 */
export interface RatingResponse {
  id: string;
  userId: string;
  recipeId: string;
  score: number;
  createdAtUtc: string;
}

/**
 * Average rating response from the API
 */
export interface AverageRatingResponse {
  averageRating: number;
}
