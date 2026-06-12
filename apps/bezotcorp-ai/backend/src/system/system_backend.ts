import { openWsServer, WsConnection, WsMessage, WsServer } from '@bezot/common';

export class SystemBackend {
  private server: WsServer | undefined;

  async start(): Promise<number> {
    this.server = openWsServer((connection) => {
      connection.onMessage((message) => {
        void this.handleMessage(connection, message);
      });
    });

    return this.server.start();
  }

  async stop(): Promise<void> {
    await this.server?.stop();
    this.server = undefined;
  }

  private async handleMessage(connection: WsConnection, message: WsMessage): Promise<void> {
    if (message.kind !== 'request') {
      return;
    }

    connection.send({
      kind: 'response',
      requestId: message.requestId,
      type: message.type,
      success: true,
      payload: {
        received: message,
      },
    });
  }
}
