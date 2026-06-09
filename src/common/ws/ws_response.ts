export type WsResponse<TType extends string = string, TPayload = unknown> = {
  kind: 'response';
  requestId: string;
  type: TType;
  success: boolean;
  payload?: TPayload;
  error?: string;
};
