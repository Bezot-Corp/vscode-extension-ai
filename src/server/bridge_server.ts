import * as http from 'node:http';

import { VSCODE_PORT } from '../constants';
import { handleActiveFile } from './active_file_handler';
import { handleOpenFiles } from './open_files_handler';
import { handlePatch } from './patch_handler';

export function createBridgeServer(): http.Server {
  const server = http.createServer((req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');

    if (req.method === 'GET' && req.url === '/active-file') {
      handleActiveFile(res);
      return;
    }

    if (req.method === 'GET' && req.url === '/open-files') {
      handleOpenFiles(res);
      return;
    }

    if (req.method === 'POST' && req.url === '/patch') {
      handlePatch(req, res);
      return;
    }

    res.writeHead(404);
    res.end(JSON.stringify({ error: 'not found' }));
  });

  server.on('error', (error) => {
    console.error('BezotCorp AI bridge server error:', error);
  });

  server.listen(VSCODE_PORT, '127.0.0.1', () => {
    console.log(`BezotCorp AI extension listening on http://127.0.0.1:${VSCODE_PORT}`);
  });

  return server;
}
