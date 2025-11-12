import { z } from 'zod';

export const generationParametersSchema = z.object({
  persona: z.string()
    .min(3, 'Persona must be at least 3 characters')
    .max(100, 'Persona must be less than 100 characters'),

  emotion: z.string()
    .min(3, 'Emotion must be at least 3 characters')
    .max(50, 'Emotion must be less than 50 characters'),

  topic: z.string()
    .min(3, 'Topic must be at least 3 characters')
    .max(200, 'Topic must be less than 200 characters'),

  temperature: z.number()
    .min(0, 'Temperature must be at least 0')
    .max(1, 'Temperature must be at most 1')
    .optional(),

  maxTokens: z.number()
    .min(100, 'Max tokens must be at least 100')
    .max(8192, 'Max tokens must be at most 8192')
    .optional(),

  category: z.array(z.string()).optional(),
  chunkId: z.string().uuid().optional(),
  documentId: z.string().uuid().optional(),
});

export type GenerationParameters = z.infer<typeof generationParametersSchema>;

