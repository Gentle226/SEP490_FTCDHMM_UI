/**
 * Nutrient safety limits and RDA (Recommended Daily Allowance) values
 * RDA = Min recommended value
 * Safety Limit = Max safe value (exceeding may cause toxicity)
 */
export interface NutrientLimit {
  vietnameseName: string;
  rda: number; // Recommended Daily Allowance (minimum)
  safetyLimit: number | null; // Maximum safe limit (null = no limit)
  warningMessage?: string; // Warning message when exceeding safety limit
}

export const NUTRIENT_LIMITS: Record<string, NutrientLimit> = {
  // Macronutrients (by Vietnamese name)
  'Chất Đạm': { vietnameseName: 'Chất Đạm', rda: 50, safetyLimit: null },
  Protein: { vietnameseName: 'Protein', rda: 50, safetyLimit: null },
  'Chất Xơ': { vietnameseName: 'Chất Xơ', rda: 28, safetyLimit: null },
  Fiber: { vietnameseName: 'Fiber', rda: 28, safetyLimit: null },
  'Tinh Bột': { vietnameseName: 'Tinh Bột', rda: 275, safetyLimit: null },
  Starch: { vietnameseName: 'Starch', rda: 275, safetyLimit: null },
  'Chất Béo': { vietnameseName: 'Chất Béo', rda: 78, safetyLimit: null },
  'Total Fat': { vietnameseName: 'Total Fat', rda: 78, safetyLimit: null },
  Fat: { vietnameseName: 'Fat', rda: 78, safetyLimit: null },
  Carbohydrate: { vietnameseName: 'Carbohydrate', rda: 275, safetyLimit: null },

  // Sugar
  Đường: {
    vietnameseName: 'Đường',
    rda: 0,
    safetyLimit: 50,
    warningMessage: 'Cần hạn chế dưới 50g',
  },
  Sugar: {
    vietnameseName: 'Sugar',
    rda: 0,
    safetyLimit: 50,
    warningMessage: 'Cần hạn chế dưới 50g',
  },

  // Minerals
  Canxi: {
    vietnameseName: 'Canxi',
    rda: 1000,
    safetyLimit: 2500,
    warningMessage: 'Thừa gây sỏi thận',
  },
  Calcium: {
    vietnameseName: 'Calcium',
    rda: 1000,
    safetyLimit: 2500,
    warningMessage: 'Thừa gây sỏi thận',
  },
  Sắt: { vietnameseName: 'Sắt', rda: 18, safetyLimit: 45, warningMessage: 'Thừa gây ngộ độc gan' },
  Iron: {
    vietnameseName: 'Iron',
    rda: 18,
    safetyLimit: 45,
    warningMessage: 'Thừa gây ngộ độc gan',
  },
  Natri: {
    vietnameseName: 'Natri',
    rda: 1500,
    safetyLimit: 2300,
    warningMessage: 'Cần hạn chế dưới 2300mg',
  },
  Sodium: {
    vietnameseName: 'Sodium',
    rda: 1500,
    safetyLimit: 2300,
    warningMessage: 'Cần hạn chế dưới 2300mg',
  },
  Đồng: { vietnameseName: 'Đồng', rda: 0.9, safetyLimit: 10 },
  Copper: { vietnameseName: 'Copper', rda: 0.9, safetyLimit: 10 },
  Kẽm: { vietnameseName: 'Kẽm', rda: 11, safetyLimit: 40 },
  Zinc: { vietnameseName: 'Zinc', rda: 11, safetyLimit: 40 },
  Manganese: { vietnameseName: 'Manganese', rda: 2.3, safetyLimit: 11 },
  Mangan: { vietnameseName: 'Mangan', rda: 2.3, safetyLimit: 11 },
  Selenium: { vietnameseName: 'Selenium', rda: 55, safetyLimit: 400 },
  Selen: { vietnameseName: 'Selen', rda: 55, safetyLimit: 400 },
  Phosphorus: { vietnameseName: 'Phosphorus', rda: 700, safetyLimit: 4000 },
  'Phốt pho': { vietnameseName: 'Phốt pho', rda: 700, safetyLimit: 4000 },
  Magie: { vietnameseName: 'Magie', rda: 420, safetyLimit: null },
  Magnesium: { vietnameseName: 'Magnesium', rda: 420, safetyLimit: null },
  Kali: { vietnameseName: 'Kali', rda: 3400, safetyLimit: null },
  Potassium: { vietnameseName: 'Potassium', rda: 3400, safetyLimit: null },
  Cholesterol: { vietnameseName: 'Cholesterol', rda: 0, safetyLimit: 300 },

  // Vitamins
  'Vitamin D': {
    vietnameseName: 'Vitamin D',
    rda: 20,
    safetyLimit: 100,
    warningMessage: 'Thừa gây vôi hóa mạch',
  },
  'Vitamin A': {
    vietnameseName: 'Vitamin A',
    rda: 900,
    safetyLimit: 3000,
    warningMessage: 'Thừa gây dị tật/hại gan',
  },
  'Vitamin B6': { vietnameseName: 'Vitamin B6', rda: 1.7, safetyLimit: 100 },
  'Vitamin C': { vietnameseName: 'Vitamin C', rda: 90, safetyLimit: 2000 },
  'Vitamin E': { vietnameseName: 'Vitamin E', rda: 15, safetyLimit: 1000 },
  Folate: { vietnameseName: 'Folate', rda: 400, safetyLimit: 1000 },
  'Axit Folic': { vietnameseName: 'Axit Folic', rda: 400, safetyLimit: 1000 },
  'Vitamin B3': { vietnameseName: 'Vitamin B3', rda: 16, safetyLimit: 35 },
  Niacin: { vietnameseName: 'Niacin', rda: 16, safetyLimit: 35 },
  'Vitamin B1': { vietnameseName: 'Vitamin B1', rda: 1.2, safetyLimit: null },
  Thiamine: { vietnameseName: 'Thiamine', rda: 1.2, safetyLimit: null },
  'Vitamin B2': { vietnameseName: 'Vitamin B2', rda: 1.3, safetyLimit: null },
  Riboflavin: { vietnameseName: 'Riboflavin', rda: 1.3, safetyLimit: null },
  'Vitamin B12': { vietnameseName: 'Vitamin B12', rda: 2.4, safetyLimit: null },
  'Vitamin K': { vietnameseName: 'Vitamin K', rda: 120, safetyLimit: null },
};

/**
 * Get nutrient limit by Vietnamese name (case-insensitive, partial match)
 */
export function getNutrientLimit(vietnameseName: string): NutrientLimit | null {
  const normalizedName = vietnameseName.toLowerCase().trim();

  // First try exact match
  for (const [key, limit] of Object.entries(NUTRIENT_LIMITS)) {
    if (key.toLowerCase() === normalizedName) {
      return limit;
    }
  }

  // Then try partial match
  for (const [key, limit] of Object.entries(NUTRIENT_LIMITS)) {
    if (normalizedName.includes(key.toLowerCase()) || key.toLowerCase().includes(normalizedName)) {
      return limit;
    }
  }

  return null;
}

/**
 * Validate nutrient value against RDA and safety limits
 */
export interface NutrientValidationResult {
  isValid: boolean;
  belowRda: boolean;
  exceedsSafetyLimit: boolean;
  rdaWarning?: string;
  safetyWarning?: string;
}

export function validateNutrientValue(
  vietnameseName: string,
  value: number,
): NutrientValidationResult {
  const limit = getNutrientLimit(vietnameseName);

  if (!limit) {
    return {
      isValid: true,
      belowRda: false,
      exceedsSafetyLimit: false,
    };
  }

  const belowRda = value < limit.rda && value >= 0;
  const exceedsSafetyLimit = limit.safetyLimit !== null && value > limit.safetyLimit;

  return {
    isValid: !exceedsSafetyLimit,
    belowRda,
    exceedsSafetyLimit,
    rdaWarning: belowRda ? `Chưa đạt mức tối thiểu khuyến nghị (RDA: ${limit.rda})` : undefined,
    safetyWarning: exceedsSafetyLimit
      ? limit.warningMessage ||
        `Vượt quá ngưỡng an toàn (có thể sinh ra độc tính). Giới hạn: ${limit.safetyLimit}`
      : undefined,
  };
}
