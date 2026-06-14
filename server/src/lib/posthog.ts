// PostHog — server-side product analytics (heatmaps & session replay are done
// in the browser; this captures trusted server events like payments/conversions).
// No-op when POSTHOG_API_KEY is unset.
import { PostHog } from 'posthog-node';
import { env } from '../config/env.js';

let client: PostHog | null = null;

if (env.POSTHOG_API_KEY) {
  client = new PostHog(env.POSTHOG_API_KEY, { host: env.POSTHOG_HOST });
}

export function captureServerEvent(opts: {
  distinctId: string;
  event: string;
  properties?: Record<string, unknown>;
}) {
  client?.capture({
    distinctId: opts.distinctId,
    event: opts.event,
    properties: opts.properties,
  });
}

export async function shutdownPosthog() {
  await client?.shutdown();
}
