# src/lib — backend client layer

The frontend's interface to the new backend. Replaces direct Firebase usage.
All modules are safe no-ops / lazy when their env vars are unset, so the app
keeps running locally before credentials exist.

| Module          | Service        | Use for                                            |
| --------------- | -------------- | -------------------------------------------------- |
| `env.js`        | —              | Reads `VITE_*` config (single source of truth).    |
| `supabase.js`   | Supabase       | DB queries + session/token. Replaces `firebase.js` db/auth. |
| `auth.js`       | Supabase Auth  | register / login / Google / password reset / logout. |
| `apiClient.js`  | Fargate API    | `api.get/post/put/del` — auto-attaches the JWT.    |
| `uploads.js`    | R2 (via API)   | `uploadImage()` — presigned direct-to-R2 upload.   |
| `search.js`     | Typesense      | `searchListings()` — instant search/filtering.     |
| `analytics.js`  | PostHog        | `trackEvent`, heatmaps, session replay.            |
| `monitoring.js` | Sentry         | `captureError` + auto error/replay capture.        |

## Bootstrapping (do once at app start, e.g. in `src/main.jsx`)

```js
import { initMonitoring } from './lib/monitoring.js';
import { initAnalytics } from './lib/analytics.js';

initMonitoring(); // Sentry
initAnalytics();  // PostHog
```

## Migration status

`src/firebase.js` and the 22 files importing it still work — Firebase is left in
place so nothing breaks while the backend is stood up. Migrate **one service file
at a time** off Firestore onto `supabase.js` / `apiClient.js`. See
`docs/BACKEND_ARCHITECTURE.md` for the order and the per-collection mapping.
