import { DEFAULT_EXTENSIONS } from "@babel/core";
import type { RollupOptions, OutputOptions } from "rollup";
import { resolve } from "path";
import { babel } from "@rollup/plugin-babel";
// import { terser } from "rollup-plugin-terser";
import typescript from "rollup-plugin-typescript2";

export interface Config {
  input: string;
  fileName: string;
  name: string;
}

export interface FactoryConfig {
  input: RollupOptions;
  output: OutputOptions;
}

export default ({ input, fileName, name }: Config): FactoryConfig => {
  return {
    input: {
      input,
      external: ["ql-quill"],
      plugins: [
        typescript({
          tsconfig: resolve(__dirname, "../tsconfig.node.json"),
          check: false,
          exclude: ["ql-quill"],
        }),
        babel({
          extensions: [...DEFAULT_EXTENSIONS, ".ts"],
          exclude: "node_modules/**",
          babelHelpers: "bundled",
        }),
        // terser(),
      ],
    },
    output: {
      file: fileName,
      format: "umd",
      name: name || "ql-quill",
      globals: {
        "ql-quill": "ql-quill",
      },
      compact: true,
    },
  };
};
