import path from "path";
import { defineConfig } from "vite";
import commonjs from "@rollup/plugin-commonjs";
import { babel } from "@rollup/plugin-babel";

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
  plugins: [
    commonjs({
      exclude: /static/,
    }),
    babel({
      exclude: /static/,
      presets: [["@babel/preset-env"]],
    }),
  ],
  server: {
    port: 8080,
  },
  build: {
    assetsDir: "./",
    lib: {
      entry: pathResolve("./src/index.js"),
      name: "QlQuill",
      fileName: format => `ql-quill.${format}.js`,
    },
    rollupOptions: {
      output: {
        assetFileNames: "ql-quill.snow.css",
      },
    },
  },
});
