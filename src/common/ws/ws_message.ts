import { z } from 'zod';

import { WsEventSchema } from './ws_event';
import { WsRequestSchema } from './ws_request';
import { WsResponseSchema } from './ws_response';

export const WsMessageSchema = z.discriminatedUnion('kind', [WsRequestSchema, WsResponseSchema, WsEventSchema]);

export type WsMessage = z.infer<typeof WsMessageSchema>;
