import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  testMatch: '**/*.pl.tsx',
  use: {
    baseURL: 'http://localhost:4000'
  }
});
