/**
 * Meal Slot Types - User customizable meal slots
 */

export interface MealSlotRequest {
  name: string;
  energyPercent: number;
  orderIndex: number;
}

export interface MealSlotResponse {
  id: string;
  name: string;
  energyPercent: number;
  orderIndex: number;
}
