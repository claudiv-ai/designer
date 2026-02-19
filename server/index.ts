import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { join } from 'path';
import { existsSync } from 'fs';
import { setupApi } from './api.js';
import { setupWatcher } from './watcher.js';

const PORT = parseInt(process.env.PORT || '3200', 10);

export async function startDesignerServer(projectRoot: string) {
  const app = express();
  app.use(cors());
  app.use(express.json());

  const server = createServer(app);

  // Setup REST API
  setupApi(app, projectRoot);

  // Setup WebSocket + file watcher
  setupWatcher(server, projectRoot);

  // Serve built frontend in production
  // When running from dist/server/index.js, client is at ../client
  // When running from server/index.ts (dev), client is at ../dist/client
  const clientDir = existsSync(join(import.meta.dirname, '../client/index.html'))
    ? join(import.meta.dirname, '../client')
    : join(import.meta.dirname, '../dist/client');
  if (existsSync(clientDir)) {
    app.use(express.static(clientDir));
    app.get('/{*path}', (_, res) => {
      res.sendFile(join(clientDir, 'index.html'));
    });
  }

  server.listen(PORT, () => {
    console.log(`Claudiv Designer running at http://localhost:${PORT}`);
  });

  return server;
}

// Run directly
const projectRoot = process.env.PROJECT_ROOT || process.argv[2] || process.cwd();
startDesignerServer(projectRoot);
