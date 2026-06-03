import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    // Force test mode so config/logger behave predictably; .env still supplies
    // DATABASE_URL + a placeholder OPENAI_API_KEY (no real network calls are made).
    env: { NODE_ENV: 'test' },
  },
});
