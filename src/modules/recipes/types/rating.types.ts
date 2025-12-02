/**
 * User interaction response (for rating display)
 */
export interface UserInteractionResponse {
  id: string;
  avatarUrl?: string;
  firstName: string;
  lastName: string;
}

/**
 * Rating request to create or update a recipe rating
 */
export interface CreateRatingRequest {
  score: number;
  feedback: string; // Required field (1-256 characters)
}

/**
 * Rating response from the API
 */
export interface RatingResponse {
  id: string;
  userId?: string;
  recipeId?: string;
  score: number;
  feedback?: string;
  userInteractionResponse?: UserInteractionResponse;
  createdAtUtc: string;
  isOwner: boolean;
}

/**
 * Average rating response from the API
 */
export interface AverageRatingResponse {
  ratingCount: number;
  avgRating: number;
}
