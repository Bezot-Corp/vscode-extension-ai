import { z } from 'zod';

export const WsResponseSchema = z.object({
  kind: z.literal('response'),
  requestId: z.string().min(1),
  type: z.string().min(1),
  success: z.boolean(),
  payload: z.unknown().optional(),
  error: z.string().optional(),
});

export type WsResponse = z.infer<typeof WsResponseSchema>;
