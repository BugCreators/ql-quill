import type Toolbar from "quill/modules/toolbar";

import type { QlExpandedOptions, QlOptions } from "../types";
import { createBlotFormatterOptions } from "../modules/blotFormatter";
import { TABLE_KEYBOARD_BINDINGS, TABLE_MODULE_OPTIONS } from "../modules/table";
import type WordCount from "../modules/wordCount";

/** expandConfig 只需要 theme / getModule 两个能力，不必依赖 QlQuill 类本身 */
interface ExpandContext {
  theme: { addModule(name: string): unknown };
  getModule(name: "toolbar"): Toolbar;
}

/**
 * 按自定义选项补齐模块配置：工具栏里出现了对应按钮才挂载模块，
 * 这样打包体积和运行时开销都只跟实际用到的功能有关。
 */
export function applyModuleConfig(
  quill: ExpandContext,
  options: QlExpandedOptions,
  qlOptions: QlOptions,
): QlExpandedOptions {
  const { imageResize, formula, limit, pasteFromWord } = qlOptions;

  if (!options.modules) options.modules = {};

  // 添加图片缩放模块以及公式再编辑模块
  if (imageResize || formula) {
    options.modules.blotFormatter2 = createBlotFormatterOptions(imageResize);

    quill.theme.addModule("blotFormatter2");
  }

  const toolbar = quill.getModule("toolbar");
  const container = toolbar.container;

  if (container?.querySelector(".ql-table")) {
    options.modules.table = false;
    options.modules["better-table"] = TABLE_MODULE_OPTIONS;

    options.modules.keyboard = {
      bindings: TABLE_KEYBOARD_BINDINGS,
    };

    quill.theme.addModule("better-table");
  }

  if (
    container?.querySelector(".ql-question") ||
    container?.querySelector(".ql-option")
  ) {
    quill.theme.addModule("question");
  }

  if (container?.querySelector(".ql-import")) {
    quill.theme.addModule("import");
  }

  if (pasteFromWord) {
    quill.theme.addModule("pasteFromWord");
  }

  if (limit) {
    const wordCount = quill.theme.addModule("wordCount") as WordCount;

    wordCount.setOptions(qlOptions);
  }

  return options;
}

export default applyModuleConfig;
