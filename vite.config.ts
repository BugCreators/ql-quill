import { resolve } from "path";
import { defineConfig } from "vite";
import { getBabelOutputPlugin } from "@rollup/plugin-babel";
import dts from "vite-plugin-dts";

const pathResolve = (dir: string) => {
  return resolve(__dirname, ".", dir);
};

export default defineConfig({
  resolve: {
    alias: {
      "ql-quill": pathResolve("src/index"),
      "@icons": pathResolve("assets/icons"),
    },
  },
  plugins: [
    getBabelOutputPlugin({ allowAllFormats: true, presets: [["@babel/preset-env"]] }),
    dts({
      rollupTypes: true,
    }),
  ],
  server: {
    port: 8080,
  },
  build: {
    lib: {
      entry: pathResolve("./index.ts"),
      name: "QlQuill",
      fileName: format => "ql-quill." + format + ".js",
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
