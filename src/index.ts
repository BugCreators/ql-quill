import Quill from "quill";
import type { Delta, Op } from "quill/core";
import type { Range } from "quill/core/selection";
import type IconType from "quill/ui/icons";
import type Toolbar from "quill/modules/toolbar";
import extend from "extend";
import type {
  CustomToolOptions,
  QlExpandedOptions,
  QlOptions,
  QlQuillOptions,
} from "./types";

import Dialog from "./modules/dialog";

import BlotFormatter, { ImageSpec } from "./modules/blotFormatter";

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
Quill.register("modules/blotFormatter2", BlotFormatter);

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
  prevSelection?: Range | null;
  isFocused = false;
  focusSyncTimer?: number;

  constructor(container: string | HTMLElement, options: QlQuillOptions = {}) {
    const qlOptions = extractConfig(options);

    super(container, defaultConfig(options, qlOptions));
    // 阻止谷歌翻译输入框
    this.container.classList.add("notranslate");

    this.qlOptions = qlOptions;
    this.expandConfig(this.options, qlOptions);

    this.onEditorChange();
    this.registerFocusListener();
    this.registerCompositionListener();

    qlOptions.value && this.setContents(qlOptions.value);
  }

  expandConfig(
    options: QlExpandedOptions,
    qlOptions: QlOptions,
  ): QlExpandedOptions {
    const { imageResize, formula, limit, pasteFromWord } = qlOptions;

    if (!options.modules) options.modules = {};

    // 添加图片缩放模块以及公式再编辑模块
    if (imageResize || formula) {
      options.modules.blotFormatter2 = {
        overlay: {
          sizeInfoStyle: {
            top: undefined,
            transform: undefined,
            font: "12px/1.0 Arial, Helvetica, sans-serif",
            padding: "4px 8px",
            textAlign: "center",
            backgroundColor: "white",
            color: "#333",
            border: "1px solid #777",
            boxSizing: "border-box",
            opacity: "0.80",
            cursor: "default",
          },
        },
        align: {
          allowAligning: false, // default true
        },
        specs: [ImageSpec],
        image: {
          allowAltTitleEdit: false, // default true
          allowCompressor: false, // default false, enable with true
          linkOptions: {
            allowLinkEdit: false, //default true
          },
          resize: {
            allowResizing: imageResize,
          },
        },
      };

      this.theme.addModule("blotFormatter2");
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
    this.on("editor-change", (...args) => {
      if (args[0] === "text-change") {
        this.onEditorChangeText(args[1]);
      } else if (args[0] === "selection-change") {
        this.onEditorChangeSelection(args[1]);
      }
    });
  }

  onEditorChangeText(delta: Delta) {
    if (this.getModule("wordCount")) return;

    this.qlOptions.onChange?.(this.root.innerHTML, delta);
  }

  onEditorChangeSelection(nextSelection: Range | null) {
    this.prevSelection = nextSelection;
    this.requestFocusSync();
  }

  registerFocusListener() {
    const toolbar = this.getModule("toolbar");
    const syncFocusState = () => this.requestFocusSync();

    this.container.addEventListener("focusin", syncFocusState);
    this.container.addEventListener("focusout", syncFocusState);
    toolbar.container?.addEventListener("focusin", syncFocusState);
    toolbar.container?.addEventListener("focusout", syncFocusState);
  }

  registerCompositionListener() {
    this.root.addEventListener("compositionstart", this.handleCompositionStart);
    this.root.addEventListener("compositionend", this.handleCompositionEnd);
  }

  handleCompositionStart = () => {
    this.root.classList.remove("ql-blank");
  };

  handleCompositionEnd = () => {
    const delta = this.getContents();
    const isBlank = delta.ops.length === 1 && delta.ops[0].insert === "\n";

    if (isBlank) {
      this.root.classList.add("ql-blank");
    }
  };

  requestFocusSync() {
    if (typeof this.focusSyncTimer === "number") {
      window.clearTimeout(this.focusSyncTimer);
    }

    // 等待浏览器完成焦点切换，再读取 activeElement，避免 toolbar/tooltip 点击误判失焦。
    this.focusSyncTimer = window.setTimeout(() => {
      this.focusSyncTimer = undefined;
      this.syncFocusState();
    }, 0);
  }

  syncFocusState() {
    const nextFocused = this.isFocusWithinEditor();

    if (nextFocused === this.isFocused) return;

    this.isFocused = nextFocused;

    const toolbar = this.getModule("toolbar");

    this.container.classList.toggle("on-focus", nextFocused);
    toolbar.container?.classList.toggle("on-focus", nextFocused);

    if (nextFocused) {
      this.qlOptions.onFocus?.();
    } else {
      this.qlOptions.onBlur?.();
    }
  }

  isFocusWithinEditor() {
    const toolbar = this.getModule("toolbar");
    const activeElement = document.activeElement;

    if (!(activeElement instanceof Node)) return false;

    return (
      this.container.contains(activeElement) ||
      !!toolbar.container?.contains(activeElement)
    );
  }

  locale(preset: string, object?: Record<string, string>) {
    const locale = this.getModule("locale");

    return locale.locale(preset, object);
  }

  setContents(value: string | Delta | Op[]) {
    const sel = this.prevSelection;
    let delta;
    if (typeof value === "string") {
      this.clipboard.dangerouslyPasteHTML(value);

      delta = this.getContents();
    } else {
      delta = super.setContents(value);
    }
    postpone(() => this.setEditorSelection(sel));

    return delta;
  }

  getHTML(): string {
    return this.root.innerHTML;
  }

  setEditorSelection(range?: Range | null) {
    this.prevSelection = range;
    if (range) {
      const length = this.getLength();
      range.index = Math.max(0, Math.min(range.index, length - 1));
      range.length = Math.max(
        0,
        Math.min(range.length, length - 1 - range.index),
      );
      this.setSelection(range);
    }
  }

  insertImage(
    src: string,
    latex = "",
    attributes: Record<string, string | number> = {},
  ) {
    const ImageUploader = this.getModule("uploader");

    //@ts-ignore
    return ImageUploader.constructor.insertImage.call(this, src, {
      "data-latex": latex,
      ...attributes,
    });
  }
}

function defaultConfig(options: QlQuillOptions, qlOptions: QlOptions) {
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
      custom: QlQuill.CUSTOM_TOOLS.filter(tool => !!qlOptions[tool]),
    },
    options,
  );
}

function extractConfig(options: QlQuillOptions): QlOptions {
  return QlQuill.CUSTOM_OPTIONS.concat(QlQuill.CUSTOM_TOOLS).reduce(
    (memo, option) => {
      memo[option] = options[option] as any;
      delete options[option];

      return memo;
    },
    {} as any as QlOptions,
  );
}

function postpone(fn: () => void) {
  Promise.resolve().then(fn);
}

export default QlQuill;
