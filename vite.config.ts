import { resolve } from "path";
import { defineConfig } from "vite";
import { getBabelOutputPlugin } from "@rollup/plugin-babel";
import dts from "vite-plugin-dts";

const pathResolve = (dir: string) => resolve(__dirname, ".", dir);

export default defineConfig({
  resolve: {
    alias: {
      "@icons": pathResolve("src/assets/icons"),
    },
  },
  plugins: [
    getBabelOutputPlugin({
      allowAllFormats: true,
      presets: [["@babel/preset-env"]],
    }),
    // 只为 src 产出类型声明，避免把 node_modules 里的 d.ts 也抄进 dist
    dts({
      include: ["src"],
      entryRoot: "src",
    }),
  ],
  server: {
    port: 8080,
    open: "/demo/index.html",
  },
  build: {
    lib: {
      entry: pathResolve("src/index.ts"),
      name: "QlQuill",
      // ES 产物用 .mjs：包本身没有 type: module，.js 会被 Node 当作 CJS 解析
      fileName: format => (format === "es" ? "ql-quill.es.mjs" : `ql-quill.${format}.js`),
      formats: ["umd", "cjs", "es"],
    },
    cssTarget: "chrome61", // 防止vite将rgba颜色转为十六进制
    minify: "terser",
    rollupOptions: {
      external: ["quill"],
      output: {
        assetFileNames: "ql-quill.snow.css",
        exports: "named",
        // 在 UMD 构建模式下为这些外部化的依赖提供一个全局变量
        globals: {
          quill: "Quill",
        },
      },
    },
  },
});
