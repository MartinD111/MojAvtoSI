// Central access to frontend (Vite) environment variables. Everything here is
// PUBLIC — only VITE_-prefixed vars are exposed to the browser, and none of
// these are secrets (anon keys, public URLs, search-only flows).
import { getPlatform } from '../config/platform.js';

const e = import.meta.env;

export const ENV = {
  // Base URL of the Fastify API on Fargate (e.g. https://api.mojavto.si).
  apiBaseUrl: e.VITE_API_BASE_URL || 'http://localhost:8080',

  // Supabase (DB + Auth) — anon key is safe to ship; RLS protects the data.
  supabaseUrl: e.VITE_SUPABASE_URL || '',
  supabaseAnonKey: e.VITE_SUPABASE_ANON_KEY || '',

  // Typesense search node (the search-only key is fetched at runtime from /api/search/key).
  typesense: {
    host: e.VITE_TYPESENSE_HOST || '',
    port: Number(e.VITE_TYPESENSE_PORT || 443),
    protocol: e.VITE_TYPESENSE_PROTOCOL || 'https',
  },

  // Observability.
  sentryDsn: e.VITE_SENTRY_DSN || '',
  posthogKey: e.VITE_POSTHOG_KEY || '',
  posthogHost: e.VITE_POSTHOG_HOST || 'https://eu.i.posthog.com',

  // Public CDN base for R2 images (used to build/normalize image URLs).
  cdnBaseUrl: e.VITE_R2_PUBLIC_BASE_URL || '',

  // Cloudflare Turnstile public site key (anti-bot widget).
  turnstileSiteKey: e.VITE_TURNSTILE_SITE_KEY || '',

  platform: getPlatform(), // 'avto' | 'navtika'
  isDev: !!e.DEV,
};
