#!/usr/bin/env node
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  applyCorrection,
  executeChatTurn,
  listWorkspaces,
} from '@atlas/cli';
import express, { type Express, type NextFunction, type Request, type Response } from 'express';

import { formatWebUrl, resolveWebHost, resolveWebPort } from './config.js';
import { SessionStore } from './session-store.js';

const moduleDirectory = dirname(fileURLToPath(import.meta.url));
const publicDirectory = join(moduleDirectory, 'public');

export function createWebServer(sessionStore: SessionStore = new SessionStore()): Express {
  const app = express();

  app.use(express.json({ limit: '1mb' }));
  app.use(express.static(publicDirectory));

  app.get('/api/health', (_request, response) => {
    response.json({ ok: true });
  });

  app.get('/api/workspaces', (_request, response) => {
    response.json({
      workspaces: ['default', ...listWorkspaces()],
    });
  });

  app.post('/api/chat', async (request, response, next) => {
    try {
      const goal = typeof request.body?.goal === 'string' ? request.body.goal.trim() : '';

      if (goal.length === 0) {
        response.status(400).json({ error: 'goal must not be empty' });
        return;
      }

      const workspace =
        typeof request.body?.workspace === 'string' ? request.body.workspace : undefined;
      const session = await sessionStore.getOrCreate(workspace);
      const payload = await executeChatTurn(sessionStore.atlasService, session, goal);

      response.json(payload);
    } catch (error) {
      next(error);
    }
  });

  app.post('/api/correct', async (request, response, next) => {
    try {
      const correction =
        typeof request.body?.correction === 'string' ? request.body.correction.trim() : '';

      if (correction.length === 0) {
        response.status(400).json({ error: 'correction must not be empty' });
        return;
      }

      const workspace =
        typeof request.body?.workspace === 'string' ? request.body.workspace : undefined;
      const session = await sessionStore.getOrCreate(workspace);
      const outcome = await applyCorrection(session, correction);

      response.json(outcome);
    } catch (error) {
      next(error);
    }
  });

  app.use((error: unknown, _request: Request, response: Response, _next: NextFunction) => {
    const message = error instanceof Error ? error.message : String(error);
    response.status(500).json({ error: message });
  });

  return app;
}

export function startWebServer(sessionStore?: SessionStore): void {
  const host = resolveWebHost();
  const port = resolveWebPort();
  const app = createWebServer(sessionStore);

  app.listen(port, host, () => {
    process.stdout.write(`Atlas Web listening at ${formatWebUrl(host, port)}\n`);
  });
}

const isDirectExecution =
  process.argv[1] !== undefined &&
  fileURLToPath(import.meta.url) === process.argv[1];

if (isDirectExecution) {
  startWebServer();
}
