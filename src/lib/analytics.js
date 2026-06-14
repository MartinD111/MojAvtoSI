// PostHog — product analytics, heatmaps & session replay for UI/UX issues.
// Safe no-op when VITE_POSTHOG_KEY is unset (e.g. local dev). Lazy-imported so
// the SDK isn't in the critical bundle until analytics is actually initialized.
import { ENV } from './env.js';

let ph = null;

export async function initAnalytics() {
  if (!ENV.posthogKey || ph) return;
  const { default: posthog } = await import('posthog-js');
  posthog.init(ENV.posthogKey, {
    api_host: ENV.posthogHost,
    person_profiles: 'identified_only',
    capture_pageview: true,
    autocapture: true,
    session_recording: { maskAllInputs: true }, // GDPR: never record raw input
  });
  posthog.register({ platform: ENV.platform }); // tag every event with avto|navtika
  ph = posthog;
}

export function trackEvent(name, props) {
  ph?.capture(name, props);
}

export function identifyUser(userId, traits) {
  ph?.identify(userId, traits);
}

export function resetAnalytics() {
  ph?.reset();
}
