import type { CreateUserHealthMetricRequest } from '../types/health-metric.types';

export interface ValidationError {
  field: string;
  message: string;
}

export function validateHealthMetric(
  data: Partial<CreateUserHealthMetricRequest>,
): ValidationError[] {
  const errors: ValidationError[] = [];

  if (
    !data.weightKg ||
    typeof data.weightKg !== 'number' ||
    data.weightKg <= 0 ||
    data.weightKg > 300
  ) {
    errors.push({
      field: 'weightKg',
      message: 'Cân nặng phải nằm trong khoảng từ 0.1 đến 300 kg',
    });
  }

  if (
    !data.heightCm ||
    typeof data.heightCm !== 'number' ||
    data.heightCm < 30 ||
    data.heightCm > 250
  ) {
    errors.push({
      field: 'heightCm',
      message: 'Chiều cao phải nằm trong khoảng từ 30 đến 250 cm',
    });
  }

  if (data.bodyFatPercent !== undefined && data.bodyFatPercent !== null) {
    if (
      typeof data.bodyFatPercent === 'number' &&
      (data.bodyFatPercent < 2 || data.bodyFatPercent > 70)
    ) {
      errors.push({
        field: 'bodyFatPercent',
        message: 'Tỷ lệ mỡ cơ thể phải nằm trong khoảng từ 2% đến 70%',
      });
    }
  }

  if (data.muscleMassKg !== undefined && data.muscleMassKg !== null) {
    if (
      typeof data.muscleMassKg === 'number' &&
      (data.muscleMassKg < 10 || data.muscleMassKg > 150)
    ) {
      errors.push({
        field: 'muscleMassKg',
        message: 'Khối lượng cơ phải nằm trong khoảng từ 10 đến 150 kg',
      });
    }
  }

  if (data.notes && typeof data.notes === 'string' && data.notes.length > 300) {
    errors.push({
      field: 'notes',
      message: 'Ghi chú không được vượt quá 300 ký tự',
    });
  }

  return errors;
}

export function calculateBMI(weightKg: number, heightCm: number): number {
  const heightM = heightCm / 100;
  return parseFloat((weightKg / (heightM * heightM)).toFixed(2));
}

export function getBMIStatus(bmi: number): string {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal Weight';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
}

export function getBMIColor(bmi: number): string {
  if (bmi < 18.5) return '#3b82f6'; // Blue
  if (bmi < 25) return '#10b981'; // Green
  if (bmi < 30) return '#f59e0b'; // Amber
  return '#ef4444'; // Red
}
