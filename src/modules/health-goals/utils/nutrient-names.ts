// Vietnamese names for nutrients
const NUTRIENT_VIETNAMESE_NAMES: { [key: string]: string } = {
  Protein: 'Chất đạm',
  Calories: 'Năng lượng',
  Fat: 'Tổng chất béo',
  Carbohydrate: 'Tinh bột',
  Phosphorus: 'Phốt pho',
  Zinc: 'Kẽm',
  Sugars: 'Đường',
  Copper: 'Đồng',
  Iron: 'Sắt',
  Calcium: 'Canxi',
  Selenium: 'Selen',
  Manganese: 'Mangan',
  Magnesium: 'Magie',
  Potassium: 'Kali',
  Sodium: 'Natri',
  Cholesterol: 'Cholesterol',
  'Dietary Fiber': 'Chất xơ',
  'Folate (Folic Acid)': 'Axit folic',
  'Vitamin B1 (Thiamin)': 'Vitamin B1',
  'Vitamin B2 (Riboflavin)': 'Vitamin B2',
  'Vitamin B3 (Niacin)': 'Vitamin B3',
  'Vitamin B6': 'Vitamin B6',
  'Vitamin B12': 'Vitamin B12',
  'Vitamin A': 'Vitamin A',
  'Vitamin C': 'Vitamin C',
  'Vitamin D': 'Vitamin D',
  'Vitamin E': 'Vitamin E',
  'Vitamin K': 'Vitamin K',
};

/**
 * Get Vietnamese name for a nutrient
 * @param englishName - The English name of the nutrient
 * @returns The Vietnamese name if found, otherwise returns the original name
 */
export function getVietnameseNutrientName(englishName: string): string {
  return NUTRIENT_VIETNAMESE_NAMES[englishName] || englishName;
}

/**
 * Format nutrient target display value based on target type
 * @param target - The nutrient target object
 * @returns Formatted display string
 */
export function formatNutrientTargetValue(target: {
  targetType?: string;
  minValue?: number;
  maxValue?: number;
  minEnergyPct?: number;
  maxEnergyPct?: number;
}): string {
  if (target.targetType === 'ENERGYPERCENT') {
    const minPct = target.minEnergyPct ?? 0;
    const maxPct = target.maxEnergyPct ?? 0;
    return `${minPct}-${maxPct}%`;
  }
  // Default to ABSOLUTE
  const minVal = target.minValue ?? 0;
  const maxVal = target.maxValue ?? 0;
  return `${minVal}-${maxVal}g`;
}
