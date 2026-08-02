import swc from "unplugin-swc";
import { defineConfig } from "vitest/config";

export default defineConfig({
  oxc: false,
  plugins: [
    swc.vite({
      jsc: {
        transform: {
          react: {
            runtime: "automatic",
          },
        },
      },
      module: { type: "es6" },
    }),
  ],
  test: {
    include: ["**/*.test.ts", "**/*.test.tsx"],
  },
});
