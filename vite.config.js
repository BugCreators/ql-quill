import path from "path";
import { defineConfig } from "vite";
import { getBabelOutputPlugin } from "@rollup/plugin-babel";

const pathResolve = dir => {
  return path.resolve(__dirname, ".", dir);
};

export default defineConfig({
  resolve: {
    alias: {
      "@icons": pathResolve("assets/icons"),
      "@plugin": pathResolve("plugin"),
      "@locales": pathResolve("src/locales"),
    },
  },
  plugins: [getBabelOutputPlugin({ allowAllFormats: true, presets: [["@babel/preset-env"]] })],
  server: {
    port: 8080,
  },
  build: {
    lib: {
      entry: pathResolve("./index.js"),
      name: "QlQuill",
      fileName: format => "ql-quill.js",
      formats: ["umd"],
    },
    minify: "terser",
    rollupOptions: {
      output: {
        assetFileNames: "ql-quill.snow.css",
        exports: "named",
      },
    },
  },
});
