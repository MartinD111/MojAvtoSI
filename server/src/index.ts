// Entry point. Builds the Fastify app and starts listening on 0.0.0.0:PORT
// (0.0.0.0 is required so the container is reachable inside ECS Fargate).
import { buildApp } from './app.js';
import { env } from './config/env.js';
import { initSentry, flushSentry } from './lib/sentry.js';
import { shutdownPosthog } from './lib/posthog.js';

initSentry();

const app = await buildApp();

const shutdown = async (signal: string) => {
  app.log.info({ signal }, 'shutting down');
  try {
    await app.close();
    await shutdownPosthog();
    await flushSentry();
  } finally {
    process.exit(0);
  }
};

process.on('SIGTERM', () => void shutdown('SIGTERM'));
process.on('SIGINT', () => void shutdown('SIGINT'));

try {
  await app.listen({ port: env.PORT, host: '0.0.0.0' });
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
