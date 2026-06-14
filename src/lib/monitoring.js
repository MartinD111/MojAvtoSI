// Sentry — frontend error & performance monitoring ("crashlytics").
// No-op when VITE_SENTRY_DSN is unset. Lazy-imported to keep it out of the
// first paint path.
import { ENV } from './env.js';

let sentry = null;

export async function initMonitoring() {
  if (!ENV.sentryDsn || sentry) return;
  const Sentry = await import('@sentry/browser');
  Sentry.init({
    dsn: ENV.sentryDsn,
    environment: ENV.isDev ? 'development' : 'production',
    tracesSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    replaysSessionSampleRate: 0.0,
    initialScope: { tags: { platform: ENV.platform } },
  });
  sentry = Sentry;
}

export function captureError(error, context) {
  if (sentry) sentry.captureException(error, context ? { extra: context } : undefined);
  else console.error(error);
}

export function setMonitoringUser(user) {
  sentry?.setUser(user ? { id: user.id, email: user.email } : null);
}
