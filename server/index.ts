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
  const clientDir = join(import.meta.dirname, '../dist/client');
  if (existsSync(clientDir)) {
    app.use(express.static(clientDir));
    app.get('*', (_, res) => {
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
