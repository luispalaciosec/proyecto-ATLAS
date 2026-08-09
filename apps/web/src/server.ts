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
import {
  BrandDuplicateError,
  BrandReservedError,
  BrandValidationError,
} from './presentation/brand-errors.js';
import { mapChatResponse } from './presentation/map-chat-response.js';
import type { ActivityItemType } from './presentation/map-activity.js';
import { SessionStore } from './session-store.js';

function resolveWorkspaceParam(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

function resolveQueryParam(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

async function handleKnowledgeSearch(
  sessionStore: SessionStore,
  workspace: string | undefined,
  query: string,
  response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const payload = await sessionStore.searchKnowledge(workspace, query);
    sessionStore.recordKnowledgeActivity(workspace, query, payload.total);
    response.json(payload);
  } catch (error) {
    next(error);
  }
}

function resolveLimitParam(value: unknown): number | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }

  const parsed = Number.parseInt(value, 10);

  if (Number.isNaN(parsed) || parsed <= 0) {
    return undefined;
  }

  return parsed;
}

function resolveActivityType(value: unknown): ActivityItemType | undefined {
  if (
    value === 'conversation' ||
    value === 'knowledge' ||
    value === 'correction' ||
    value === 'error'
  ) {
    return value;
  }

  return undefined;
}

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

  app.get('/api/brands', async (request, response, next) => {
    try {
      const activeWorkspace =
        resolveWorkspaceParam(request.query.activeWorkspace) ??
        resolveWorkspaceParam(request.query.workspace);
      const payload = await sessionStore.listBrands(activeWorkspace);

      response.json(payload);
    } catch (error) {
      next(error);
    }
  });

  app.post('/api/brands', async (request, response, next) => {
    try {
      const name = typeof request.body?.name === 'string' ? request.body.name : '';
      const purpose = typeof request.body?.purpose === 'string' ? request.body.purpose : undefined;
      const activeWorkspace =
        resolveWorkspaceParam(request.body?.activeWorkspace) ??
        resolveWorkspaceParam(request.body?.workspace);
      const payload = await sessionStore.createBrand(name, purpose, activeWorkspace);

      response.status(201).json(payload);
    } catch (error) {
      if (
        error instanceof BrandDuplicateError ||
        error instanceof BrandValidationError ||
        error instanceof BrandReservedError
      ) {
        response.status(error.statusCode).json({
          error: error.message,
          technical: error.name,
        });
        return;
      }

      next(error);
    }
  });

  app.get('/api/history', async (request, response, next) => {
    try {
      const workspace = resolveWorkspaceParam(request.query.workspace);
      const session = await sessionStore.getOrCreate(workspace);
      const payload = sessionStore.getConversationHistory(session, workspace);

      response.json(payload);
    } catch (error) {
      next(error);
    }
  });

  app.get('/api/activity', async (request, response, next) => {
    try {
      const workspace = resolveWorkspaceParam(request.query.workspace);
      const payload = sessionStore.getActivity(workspace, {
        limit: resolveLimitParam(request.query.limit),
        type: resolveActivityType(request.query.type),
      });

      response.json(payload);
    } catch (error) {
      next(error);
    }
  });

  app.get('/api/knowledge/search', async (request, response, next) => {
    await handleKnowledgeSearch(
      sessionStore,
      resolveWorkspaceParam(request.query.workspace),
      resolveQueryParam(request.query.query),
      response,
      next,
    );
  });

  app.get('/api/memory/search', async (request, response, next) => {
    await handleKnowledgeSearch(
      sessionStore,
      resolveWorkspaceParam(request.query.workspace),
      resolveQueryParam(request.query.query),
      response,
      next,
    );
  });

  app.post('/api/knowledge/search', async (request, response, next) => {
    await handleKnowledgeSearch(
      sessionStore,
      resolveWorkspaceParam(request.body?.workspace),
      resolveQueryParam(request.body?.query),
      response,
      next,
    );
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

      if (payload.mode === 'deterministic') {
        const view = mapChatResponse(payload);
        sessionStore.recordDeterministicExchange(workspace, goal, view.assistantMessage);
      }

      sessionStore.recordConversationActivity(workspace, payload);
      response.json(payload);
    } catch (error) {
      const workspace =
        typeof request.body?.workspace === 'string' ? request.body.workspace : undefined;
      const goal = typeof request.body?.goal === 'string' ? request.body.goal.trim() : '';
      const message = error instanceof Error ? error.message : String(error);

      if (goal.length > 0) {
        sessionStore.recordConversationError(workspace, goal, message);
      }

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

      sessionStore.recordCorrectionActivity(
        workspace,
        correction,
        outcome,
        session.lastTurn?.goal,
      );

      response.json(outcome);
    } catch (error) {
      next(error);
    }
  });

  app.use((request, response, next) => {
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      next();
      return;
    }

    if (request.path.startsWith('/api/')) {
      next();
      return;
    }

    response.sendFile(join(publicDirectory, 'index.html'), (sendError) => {
      if (sendError !== undefined) {
        next(sendError);
      }
    });
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
