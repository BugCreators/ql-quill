/**
 * 构建语言包：src/locale/*.ts -> locale/*.js（UMD）+ locale/locale/*.d.ts
 *
 * 之前用 tsx 驱动 TS 版构建脚本，在 Node 20+ 会因 CJS/ESM 循环加载直接报错，
 * 这里改为纯 ESM 脚本，只依赖 rollup 本身。
 */
import { readdirSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { DEFAULT_EXTENSIONS } from "@babel/core";
import { babel } from "@rollup/plugin-babel";
import { rollup } from "rollup";
import typescript from "rollup-plugin-typescript2";

const rootDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const localeSrcDir = join(rootDir, "src/locale");
const localeOutDir = join(rootDir, "locale");

const IGNORED = new Set(["index.ts"]); // 只有类型声明，没有运行时代码

function createConfig({ input, fileName, name }) {
  return {
    input: {
      input,
      external: ["ql-quill"],
      plugins: [
        typescript({
          tsconfig: join(rootDir, "tsconfig.locale.json"),
          check: false,
          exclude: ["ql-quill"],
        }),
        babel({
          extensions: [...DEFAULT_EXTENSIONS, ".ts"],
          exclude: "node_modules/**",
          babelHelpers: "bundled",
        }),
      ],
    },
    output: {
      file: fileName,
      format: "umd",
      name,
      globals: {
        "ql-quill": "ql-quill",
      },
      compact: true,
    },
  };
}

async function buildLocale(entry) {
  const localeName = entry.replace(/\.ts$/, "");

  const config = createConfig({
    input: join(localeSrcDir, entry),
    fileName: join(localeOutDir, `${localeName}.js`),
    name: `ql_quill_locale_${localeName}`,
  });

  const bundle = await rollup(config.input);
  await bundle.write(config.output);
  await bundle.close();
}

async function main() {
  mkdirSync(localeOutDir, { recursive: true });

  const entries = readdirSync(localeSrcDir).filter(
    file => file.endsWith(".ts") && !IGNORED.has(file),
  );

  // 顺序构建，避免同时占满内存
  for (const entry of entries) {
    await buildLocale(entry);
  }

  console.log(`[locale] 已构建 ${entries.length} 个语言包：${entries.join(", ")}`);
}

main().catch(error => {
  console.error("[locale] 构建失败", error);
  process.exit(1);
});
