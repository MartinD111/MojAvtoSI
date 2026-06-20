import { defineConfig } from '@playwright/test';

export default defineConfig({
    testDir: 'tests/e2e',
    timeout: 15_000,
    retries: process.env.CI ? 1 : 0,
    use: {
        baseURL: 'http://localhost:4173',
        headless: true,
    },
    webServer: {
        command: 'cross-env VITE_PLATFORM=avto npx vite preview --outDir dist-avto --port 4173',
        url: 'http://localhost:4173',
        reuseExistingServer: !process.env.CI,
    },
});
