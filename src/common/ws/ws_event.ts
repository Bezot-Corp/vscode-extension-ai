export type WsEvent<TType extends string = string, TPayload = unknown> = {
  kind: 'event';
  type: TType;
  payload: TPayload;
};
