import { z } from 'zod';

export const WsEventSchema = z.object({
  kind: z.literal('event'),
  type: z.string().min(1),
  payload: z.unknown(),
});

export type WsEvent = z.infer<typeof WsEventSchema>;
