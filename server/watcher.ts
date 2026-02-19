import { WebSocketServer, WebSocket } from 'ws';
import { watch } from 'chokidar';
import { readFile } from 'fs/promises';
import { relative } from 'path';
import type { Server } from 'http';
import { parseSpecFile, type ComponentDefinition } from '@claudiv/core';

interface WsMessage {
  type: string;
  [key: string]: any;
}

export function setupWatcher(server: Server, projectRoot: string) {
  const wss = new WebSocketServer({ server, path: '/ws' });
  const clients = new Set<WebSocket>();

  wss.on('connection', (ws) => {
    clients.add(ws);

    ws.on('message', (data) => {
      try {
        const msg = JSON.parse(data.toString()) as WsMessage;
        if (msg.type === 'subscribe') {
          // Client subscribed — could track per-client subscriptions
        }
      } catch {
        // ignore malformed messages
      }
    });

    ws.on('close', () => {
      clients.delete(ws);
    });
  });

  function broadcast(msg: WsMessage) {
    const data = JSON.stringify(msg);
    for (const client of clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    }
  }

  // Watch .cdml files
  const watcher = watch('**/*.cdml', {
    cwd: projectRoot,
    ignored: ['node_modules/**', '.git/**', '.claudiv/**', 'dist/**'],
    ignoreInitial: true,
  });

  watcher.on('change', async (filePath) => {
    try {
      const fullPath = `${projectRoot}/${filePath}`;
      const content = await readFile(fullPath, 'utf-8');
      const parsed = parseSpecFile(content);

      if (parsed.component) {
        parsed.component.file = filePath;
        broadcast({
          type: 'file-changed',
          file: filePath,
          component: parsed.component,
        });
      } else {
        broadcast({
          type: 'file-changed',
          file: filePath,
        });
      }
    } catch {
      broadcast({ type: 'file-changed', file: filePath });
    }
  });

  watcher.on('add', async (filePath) => {
    try {
      const fullPath = `${projectRoot}/${filePath}`;
      const content = await readFile(fullPath, 'utf-8');
      const parsed = parseSpecFile(content);

      if (parsed.component) {
        parsed.component.file = filePath;
        broadcast({
          type: 'file-created',
          file: filePath,
          component: parsed.component,
        });
      } else {
        broadcast({ type: 'file-created', file: filePath });
      }
    } catch {
      broadcast({ type: 'file-created', file: filePath });
    }
  });

  watcher.on('unlink', (filePath) => {
    broadcast({
      type: 'file-deleted',
      file: filePath,
    });
  });

  return { wss, watcher };
}
