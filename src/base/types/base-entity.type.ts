import { z } from 'zod';

export const baseEntitySchema = z.object({
  id: z.string().trim(),
  createTimestamp: z.string().trim(),
  updateTimestamp: z.string().trim(),
  deleteTimestamp: z.string().trim().nullable().optional(),
});

export type BaseEntity = z.infer<typeof baseEntitySchema>;
