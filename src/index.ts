import Quill from "quill";
import type { Delta, Op } from "quill/core";
import type { EmitterSource } from "quill/core/emitter";
import type { Range } from "quill/core/selection";
import type IconType from "quill/ui/icons";
import type Toolbar from "quill/modules/toolbar";
import isEqual from "lodash.isequal";
import extend from "extend";
import type {
  Options,
  CustomToolOptions,
  QlExpandedOptions,
  QlOptions,
  QlQuillOptions,
} from "./types";

import Dialog from "./modules/dialog";

import { ImageSpec } from "./modules/blotFormatter";

import ImageBlot from "./blots/image";

// @ts-ignore
import QuillBetterTable from "quill-better-table";
import type ImageUploader from "./modules/imageUploader";
import type Locale from "./modules/locale";
import type WordCount from "./modules/wordCount";

import cleanIcon from "@icons/clean.svg?raw";

import "../assets/index.styl";

const Icons = Quill.import("ui/icons") as typeof IconType;
Object.assign(Icons, { clean: cleanIcon });

Quill.register(ImageBlot, true);

interface QlQuill {
  getModule(name: "dialog"): Dialog;
  getModule(name: "toolbar"): Toolbar;
  getModule(name: "wordCount"): WordCount;
  getModule(name: "locale"): Locale;
  getModule(name: "uploader"): ImageUploader;
  getModule(name: string): unknown;
}

class QlQuill extends Quill {
  static readonly CUSTOM_TOOLS: Array<keyof CustomToolOptions> = [
    "import",
    "option",
    "formula",
    "question",
  ];
  static readonly CUSTOM_OPTIONS: Array<keyof QlOptions> = [
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

  qlOptions: QlOptions;
  declare options: QlExpandedOptions;
  prevSelection?: Range;

  constructor(container: string | HTMLElement, options: QlQuillOptions = {}) {
    const qlOptions = extractConfig(options);

    super(container, defaultConfig(options, qlOptions));
    // 阻止谷歌翻译输入框
    this.container.classList.add("notranslate");

    this.qlOptions = qlOptions;
    this.expandConfig(this.options, qlOptions);

    this.onEditorChange();

    qlOptions.value && this.setContents(qlOptions.value);

    // 旧数据处理 类名转成内联
    this.clipboard.addMatcher("SPAN", (node, delta) => {
      Array.from((node as HTMLSpanElement).classList).forEach((className) => {
        const [, format, value] = className.match(/^ql-(size|font)-(.*)/) || [];

        if (!format || !value) return;

        delta.forEach((op) => {
          if (!op.attributes) op.attributes = {};

          op.attributes[format] = value + (format === "size" ? "px" : "");
        });
      });

      return delta;
    });
  }

  expandConfig(
    options: QlExpandedOptions,
    qlOptions: QlOptions
  ): QlExpandedOptions {
    const { imageResize, formula, limit, pasteFromWord } = qlOptions;

    if (!options.modules) options.modules = {};

    // 添加图片缩放模块以及公式再编辑模块
    if (imageResize || formula) {
      options.modules.blotFormatter = {
        specs: [ImageSpec],
        resizable: imageResize,
      };

      this.theme.addModule("blotFormatter");
    }

    const toolbar = this.getModule("toolbar");

    if (toolbar.container!.querySelector(".ql-table")) {
      options.modules.table = false;

      options.modules["better-table"] = {
        operationMenu: {
          items: {
            insertColumnRight: { text: "右插入列" },
            insertColumnLeft: { text: "左插入列" },
            insertRowUp: { text: "上插入行" },
            insertRowDown: { text: "下插入行" },
            mergeCells: { text: "合并单元格" },
            unmergeCells: { text: "取消合并" },
            deleteColumn: { text: "删除列" },
            deleteRow: { text: "删除行" },
            deleteTable: { text: "删除表格" },
          },
        },
      };

      options.modules.keyboard = {
        bindings: QuillBetterTable.keyboardBindings,
      };

      this.theme.addModule("better-table");
    }

    if (
      toolbar.container!.querySelector(".ql-question") ||
      toolbar.container!.querySelector(".ql-option")
    ) {
      this.theme.addModule("question");
    }

    if (toolbar.container!.querySelector(".ql-import")) {
      this.theme.addModule("import");
    }

    if (pasteFromWord) {
      this.theme.addModule("pasteFromWord");
    }

    if (limit) {
      const wordCount = this.theme.addModule("wordCount") as WordCount;
      wordCount.setOptions(qlOptions);
    }

    return options;
  }

  onEditorChange() {
    this.on(
      "editor-change",
      (eventName, rangeOrDelta, oldRangeOrDelta, source) => {
        if (eventName === "text-change") {
          this.onEditorChangeText(this.root.innerHTML, rangeOrDelta, source);
        } else if (eventName === "selection-change") {
          this.onEditorChangeSelection(rangeOrDelta, source);
        }
      }
    );
  }

  onEditorChangeText(value: string, delta: Delta, source: EmitterSource) {
    if (this.getModule("wordCount")) return;

    this.qlOptions.onChange?.(value, delta);
  }

  onEditorChangeSelection(nextSelection: Range, source: EmitterSource) {
    const currentSelection = this.prevSelection;
    const hasGainedFocus = !currentSelection && nextSelection;
    const hasLostFocus = currentSelection && !nextSelection;

    if (isEqual(nextSelection, currentSelection)) return;

    this.prevSelection = nextSelection;

    const toolbar = this.getModule("toolbar");

    if (hasGainedFocus) {
      this.container.classList.add("on-focus");
      toolbar.container!.classList.add("on-focus");

      this.qlOptions.onFocus?.();
    } else if (hasLostFocus) {
      this.container.classList.remove("on-focus");
      toolbar.container!.classList.remove("on-focus");

      this.qlOptions.onBlur?.();
    }
  }

  locale(preset: string, object?: Record<string, string>) {
    const locale = this.getModule("locale");

    return locale.locale(preset, object);
  }

  setContents(value: string | Delta | Op[]) {
    const sel = this.prevSelection;
    if (typeof value === "string") {
      this.clipboard.dangerouslyPasteHTML(value);
    } else {
      super.setContents(value);
    }
    postpone(() => this.setEditorSelection(this, sel!));
  }

  getHTML(): string {
    return this.root.innerHTML;
  }

  setEditorSelection(editor: this, range: Range) {
    this.prevSelection = range;
    if (range) {
      const length = editor.getLength();
      range.index = Math.max(0, Math.min(range.index, length - 1));
      range.length = Math.max(
        0,
        Math.min(range.length, length - 1 - range.index)
      );
      editor.setSelection(range);
    }
  }

  insertImage(
    src: string,
    latex = "",
    attributes: Record<string, string | number> = {}
  ) {
    const ImageUploader = this.getModule("uploader");

    //@ts-ignore
    return ImageUploader.constructor.insertImage.call(this, src, {
      "data-latex": latex,
      ...attributes,
    });
  }
}

function defaultConfig(options: QlQuillOptions, qlOptions: QlOptions): Options {
  return extend(
    true,
    {
      theme: "snow",
      modules: {
        toolbar: { container: qlOptions.toolbar },
        uploader: qlOptions.image || {},
        formula: qlOptions.formula || "",
        locale: qlOptions.locale || {},
        dialog: {},
      },
      custom: QlQuill.CUSTOM_TOOLS.filter((tool) => !!qlOptions[tool]),
    },
    options
  );
}

function extractConfig(options: QlQuillOptions): QlOptions {
  return QlQuill.CUSTOM_OPTIONS.concat(QlQuill.CUSTOM_TOOLS).reduce(
    (memo, option) => {
      memo[option] = options[option] as any;
      delete options[option];

      return memo;
    },
    {} as any as QlOptions
  );
}

function postpone(fn: () => void) {
  Promise.resolve().then(fn);
}

export default QlQuill;
