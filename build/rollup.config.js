const { babel } = require("@rollup/plugin-babel");
const { terser } = require("rollup-plugin-terser");

module.exports = config => {
  const { input, fileName, name } = config;
  return {
    input: {
      input,
      external: ["ql-quill"],
      plugins: [
        babel({
          exclude: "node_modules/**",
          babelHelpers: "bundled",
        }),
        terser(),
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