export type WsRequest<TType extends string = string, TPayload = unknown> = {
  kind: 'request';
  requestId: string;
  type: TType;
  payload: TPayload;
};
