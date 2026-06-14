// Sentry — server-side error tracking. Safe no-op when SENTRY_DSN is unset
// (e.g. local dev), so nothing else has to guard its calls.
import * as Sentry from '@sentry/node';
import type { FastifyRequest } from 'fastify';
import { env, isProd } from '../config/env.js';

let enabled = false;

export function initSentry() {
  if (!env.SENTRY_DSN) return;
  Sentry.init({
    dsn: env.SENTRY_DSN,
    environment: env.NODE_ENV,
    tracesSampleRate: isProd ? env.SENTRY_TRACES_SAMPLE_RATE : 0,
  });
  enabled = true;
}

export function sentryErrorHandler(error: unknown, request?: FastifyRequest, errorId?: string) {
  if (!enabled) return;
  Sentry.withScope((scope) => {
    if (errorId) scope.setTag('error_id', errorId); // correlate with the code shown to the user
    if (request) {
      scope.setContext('request', {
        method: request.method,
        url: request.url,
        ip: request.ip,
      });
      const userId = (request as { user?: { id?: string } }).user?.id;
      if (userId) scope.setUser({ id: userId });
    }
    Sentry.captureException(error);
  });
}

export async function flushSentry() {
  if (enabled) await Sentry.flush(2000);
}
