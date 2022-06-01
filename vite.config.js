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
    },
  },
  plugins: [getBabelOutputPlugin({ allowAllFormats: true, presets: [["@babel/preset-env"]] })],
  server: {
    port: 8080,
  },
  build: {
    assetsDir: "./",
    lib: {
      entry: pathResolve("./src/index.js"),
      name: "QlQuill",
      fileName: format => "ql-quill.js",
      formats: ["umd"],
    },
    rollupOptions: {
      output: {
        assetFileNames: "ql-quill.snow.css",
      },
    },
  },
});
