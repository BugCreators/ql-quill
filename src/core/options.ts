import extend from "extend";
import type {
  CustomToolOptions,
  QlExpandedOptions,
  QlOptions,
  QlQuillOptions,
} from "../types";

/** 由 toolbar 决定是否启用的自定义按钮 */
export const CUSTOM_TOOLS: Array<keyof CustomToolOptions> = [
  "import",
  "option",
  "formula",
  "question",
];

/** 需要从 Quill 原生 options 中剥离出来的自定义选项 */
export const CUSTOM_OPTIONS: Array<keyof QlOptions> = [
  "toolbar",
  "limit",
  "onLimit",
  "value",
  "onChange",
  "image",
  "imageResize",
  "locale",
  "pasteFromWord",
  "onFocus",
  "onBlur",
];

/** 把自定义选项从入参中摘出来，剩下的才是 Quill 认得的 options */
export function extractConfig(options: QlQuillOptions): QlOptions {
  const keys: Array<keyof QlOptions> = [
    ...CUSTOM_OPTIONS,
    ...CUSTOM_TOOLS,
  ];

  return keys.reduce(
    (memo, option) => {
      memo[option] = options[option] as any;
      delete options[option];

      return memo;
    },
    {} as any as QlOptions,
  );
}

/** 合并出传给 Quill 的完整 options */
export function createDefaultConfig(
  options: QlQuillOptions,
  qlOptions: QlOptions,
): QlExpandedOptions {
  return extend(
    true,
    {
      theme: "snow",
      modules: {
        toolbar: { container: qlOptions.toolbar },
        uploader: qlOptions.image || {},
        formula: {
          url: qlOptions.formula || "",
        },
        locale: qlOptions.locale || {},
        dialog: {},
      },
      custom: CUSTOM_TOOLS.filter(tool => !!qlOptions[tool]),
    },
    options,
  ) as QlExpandedOptions;
}
