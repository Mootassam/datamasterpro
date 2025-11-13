import { build } from "esbuild";

await build({
  entryPoints: ["dist/src/server.js"],
  bundle: true,
  platform: "node",
  target: ["node18"],
  outfile: "bundle.js",
  external: [], // include everything
  format: "cjs",
  banner: {
    js: "#!/usr/bin/env node",
  },
});
