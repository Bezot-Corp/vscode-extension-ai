import type { WsEvent } from './ws_event';
import type { WsRequest } from './ws_request';
import type { WsResponse } from './ws_response';

export type WsMessage = WsRequest | WsResponse | WsEvent;
