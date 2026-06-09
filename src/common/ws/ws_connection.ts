import { RawData, WebSocket } from 'ws';

import { parseWsMessage, serializeWsMessage, WsMessage } from './ws_message';

export type WsMessageHandler = (message: WsMessage) => void | Promise<void>;

export class WsConnection {
  constructor(private readonly socket: WebSocket) {}

  send(message: WsMessage): void {
    if (this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(serializeWsMessage(message));
    }
  }

  onMessage(handler: WsMessageHandler): void {
    this.socket.on('message', (rawMessage: RawData) => {
      void this.handleRawMessage(rawMessage.toString(), handler);
    });
  }

  close(): void {
    this.socket.close();
  }

  private async handleRawMessage(rawMessage: string, handler: WsMessageHandler): Promise<void> {
    try {
      await handler(parseWsMessage(rawMessage));
    } catch (error) {
      this.send({
        kind: 'event',
        type: 'ws.error',
        payload: {
          message: String(error),
        },
      });
    }
  }
}