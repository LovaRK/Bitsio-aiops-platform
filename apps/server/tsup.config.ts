import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  outDir: "dist",
  platform: "node",
  target: "es2022",
  sourcemap: true,
  clean: true,
  noExternal: [/^@bitsio\//]
});
