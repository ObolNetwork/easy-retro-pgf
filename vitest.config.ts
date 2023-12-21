/// <reference types="vitest" />
/// <reference types="vite/client" />

import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  test: {
    globals: true,
    setupFiles: ["./src/setup.ts"],
    pool: "forks",
  },
});