import { createServer, Server } from 'node:http';
import { AddressInfo } from 'node:net';
import { WebSocket, WebSocketServer } from 'ws';

import { WsConnection } from './ws_connection';

export type WsConnectionHandler = (connection: WsConnection) => void | Promise<void>;

export class WsServer {
  private readonly httpServer: Server;
  private readonly wsServer: WebSocketServer;

  constructor(private readonly handleConnection: WsConnectionHandler) {
    this.httpServer = createServer();
    this.wsServer = new WebSocketServer({ server: this.httpServer });

    this.wsServer.on('connection', (socket: WebSocket) => {
      void this.handleConnection(new WsConnection(socket));
    });
  }

  async start(): Promise<number> {
    await new Promise<void>((resolve) => {
      this.httpServer.listen(0, '127.0.0.1', resolve);
    });

    return (this.httpServer.address() as AddressInfo).port;
  }

  async stop(): Promise<void> {
    for (const client of this.wsServer.clients) {
      client.close();
    }

    await new Promise<void>((resolve) => this.wsServer.close(() => resolve()));
    await new Promise<void>((resolve) => this.httpServer.close(() => resolve()));
  }
}

export function openWsServer(handleConnection: WsConnectionHandler): WsServer {
  return new WsServer(handleConnection);
}
