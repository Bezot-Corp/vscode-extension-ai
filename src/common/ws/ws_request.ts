import { z } from 'zod';

export const WsRequestSchema = z.object({
  kind: z.literal('request'),
  requestId: z.string().min(1),
  type: z.string().min(1),
  payload: z.unknown(),
});

export type WsRequest = z.infer<typeof WsRequestSchema>;
