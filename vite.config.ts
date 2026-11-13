import { resolve } from "path";
import { defineConfig } from "vite";
import { getBabelOutputPlugin } from "@rollup/plugin-babel";
import dts from "vite-plugin-dts";

const pathResolve = (dir: string) => resolve(__dirname, ".", dir);

/**
 * rolldown 保持 CJS 语义，不会把依赖里对 external 的 require 转成 import，ES 产物在
 * 浏览器里会抛 “Calling require for quill…”。CJS 依赖（better-table 等）需要的是
 * Quill 类本身（要调 Quill.import），所以这里给 ES chunk 顶部注入一个只认 quill 的 require。
 */
const esmRequireShim = () => ({
  name: "ql-quill:esm-require-shim",
  renderChunk(code: string, _chunk: unknown, outputOptions: { format?: string }) {
    if (outputOptions.format !== "es") return null;

    const shim = [
      `import __ql_quill__ from "quill";`,
      `var require = id => {`,
      `  if (id === "quill") return __ql_quill__;`,
      `  throw new Error('[ql-quill] 构建产物里不支持 require("' + id + '")');`,
      `};`,
      "",
    ].join("\n");

    return { code: shim + code, map: null };
  },
});

export default defineConfig({
  resolve: {
    alias: {
      "@icons": pathResolve("src/assets/icons"),
    },
  },
  plugins: [
    esmRequireShim(),
    getBabelOutputPlugin({
      allowAllFormats: true,
      // modules 必须关掉：输出插件对三种格式都跑，默认值会把 ES 产物里的 import
      // 转成 CJS 互操作形态，浏览器里就变成 "default.import is not a function"
      presets: [["@babel/preset-env", { modules: false }]],
    }),
    // 只为 src 产出类型声明，避免把 node_modules 里的 d.ts 也抄进 dist；
    // vendor 下是手写的 .d.ts（没有对应 TS 源码），必须一并拷过去
    dts({
      include: ["src"],
      entryRoot: "src",
      copyDtsFiles: true,
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
