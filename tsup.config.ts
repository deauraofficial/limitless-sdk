import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: true,
  clean: true,
  external: ["@orca-so/whirlpools-core"], // ✅ load from node_modules at runtime
});
