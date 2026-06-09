import { z } from 'zod';

export const WsMessageSchema = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('request'),
    requestId: z.string().min(1),
    type: z.string().min(1),
    payload: z.unknown(),
  }),
  z.object({
    kind: z.literal('response'),
    requestId: z.string().min(1),
    type: z.string().min(1),
    success: z.boolean(),
    payload: z.unknown().optional(),
    error: z.string().optional(),
  }),
  z.object({
    kind: z.literal('event'),
    type: z.string().min(1),
    payload: z.unknown(),
  }),
]);

export type WsMessage = z.infer<typeof WsMessageSchema>;
export type WsRequest = Extract<WsMessage, { kind: 'request' }>;
export type WsResponse = Extract<WsMessage, { kind: 'response' }>;
export type WsEvent = Extract<WsMessage, { kind: 'event' }>;

export function parseWsMessage(raw: string): WsMessage {
  return WsMessageSchema.parse(JSON.parse(raw));
}

export function serializeWsMessage(message: WsMessage): string {
  return JSON.stringify(WsMessageSchema.parse(message));
}
