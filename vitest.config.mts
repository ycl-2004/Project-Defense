import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const alias = { "@": fileURLToPath(new URL("./src", import.meta.url)) };

export default defineConfig({
  resolve: { alias },
  test: {
    projects: [
      {
        resolve: { alias },
        test: { name: "unit", environment: "node", include: ["tests/**/*.test.ts"] },
      },
      {
        // Real GitHub and DeepSeek calls (a few cents). Run with `npm run eval:live`.
        resolve: { alias },
        test: {
          name: "live",
          environment: "node",
          include: ["evals/**/*.eval.ts"],
          testTimeout: 300_000,
          setupFiles: ["evals/setup.ts"],
        },
      },
    ],
  },
});
