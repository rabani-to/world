import { defineConfig } from "tsup"
import packageJson from "./package.json"

export default defineConfig({
  entry: {
    index: "./src/index.ts",
    server: "./src/server/index.ts",
  },
  format: ["esm", "cjs"],
  dts: true,
  minify: true,
  clean: true,
  external: Object.keys(packageJson.peerDependencies),
})
