import { z } from 'zod';

export const customHealthGoalSchema = z.object({
  name: z
    .string()
    .min(3, 'Tên phải có ít nhất 3 ký tự')
    .max(100, 'Tên không được vượt quá 100 ký tự'),
  description: z.string().optional(),
  targets: z
    .array(
      z.object({
        nutrientId: z.string().min(1, 'Bắt buộc phải chọn ít nhất một chất dinh dưỡng'),
        targetType: z.string().optional(),
        minValue: z.coerce.number().min(0, 'Giá trị tối thiểu phải lớn hơn hoặc bằng 0'),
        medianValue: z.coerce.number().min(0).optional(),
        maxValue: z.coerce.number().min(0, 'Giá trị tối đa phải lớn hơn 0'),
        minEnergyPct: z.coerce.number().min(0).max(100).optional(),
        medianEnergyPct: z.coerce.number().min(0).max(100).optional(),
        maxEnergyPct: z.coerce.number().min(0).max(100).optional(),
        weight: z.coerce.number().min(0).optional(),
      }),
    )
    .refine((targets) => targets.every((t) => t.maxValue > t.minValue), {
      message: 'Giá trị tối đa phải lớn hơn giá trị tối thiểu',
    }),
});

export type CustomHealthGoalFormData = z.infer<typeof customHealthGoalSchema>;

export interface CustomHealthGoalResponse {
  id: string;
  name: string;
  description?: string;
  targets: Array<{
    nutrientId: string;
    targetType?: string;
    minValue: number;
    medianValue?: number;
    maxValue: number;
    minEnergyPct?: number;
    medianEnergyPct?: number;
    maxEnergyPct?: number;
    weight?: number;
  }>;
}

export const healthGoalSchema = z.object({
  name: z
    .string()
    .min(3, 'Tên phải có ít nhất 3 ký tự')
    .max(100, 'Tên không được vượt quá 100 ký tự'),
  description: z.string().optional(),
  targets: z
    .array(
      z.object({
        nutrientId: z.string().min(1, 'Bắt buộc phải chọn ít nhất một chất dinh dưỡng'),
        targetType: z.string().optional(),
        minValue: z.coerce.number().min(0, 'Giá trị tối thiểu phải lớn hơn hoặc bằng 0'),
        medianValue: z.coerce.number().min(0).optional(),
        maxValue: z.coerce.number().min(0, 'Giá trị tối đa phải lớn hơn 0'),
        minEnergyPct: z.coerce.number().min(0).max(100).optional(),
        medianEnergyPct: z.coerce.number().min(0).max(100).optional(),
        maxEnergyPct: z.coerce.number().min(0).max(100).optional(),
        weight: z.coerce.number().min(0).optional(),
      }),
    )
    .refine((targets) => targets.every((t) => t.maxValue > t.minValue), {
      message: 'Giá trị tối đa phải lớn hơn giá trị tối thiểu',
    }),
});

export type HealthGoalFormData = z.infer<typeof healthGoalSchema>;

export interface HealthGoalResponse {
  id: string;
  name: string;
  description?: string;
  targets: Array<{
    nutrientId: string;
    targetType?: string;
    minValue: number;
    medianValue?: number;
    maxValue: number;
    minEnergyPct?: number;
    medianEnergyPct?: number;
    maxEnergyPct?: number;
    weight?: number;
  }>;
}
