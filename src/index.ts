import Quill from "quill";
import type {
  QuillOptionsStatic,
  RangeStatic,
  Sources,
  Delta,
  DeltaStatic,
} from "quill";
import isEqual from "lodash.isequal";
import extend from "extend";
import type {
  CustomToolOptions,
  QlQuillOptionsStatic,
  QlOptions,
  QlQuillOptions,
} from "./types";
import type {
  Toolbar,
  Clipboard,
  SnowTheme,
  Module,
  Emitter,
  Tooltip,
  Embed,
  Selection,
} from "./quill";

import Dialog from "./modules/dialog";

import { ImageSpec } from "./modules/blotFormatter";

import ImageBlot from "./blots/image";

import type ImageUploader from "./modules/imageUploader";
import Locale from "./modules/locale";

import cleanIcon from "@icons/clean.svg?raw";

import "../assets/index.styl";

const Icons = Quill.import("ui/icons");
Object.assign(Icons, { clean: cleanIcon });

Quill.register(ImageBlot, true);

type QuillType = typeof Quill;

interface QlQuill {
  getModule(name: "toolbar"): Toolbar<QlQuill>;
  getModule(name: "clipboard"): Clipboard<QlQuill>;
  getModule(name: "imageUploader"): ImageUploader;
  getModule(name: "dialog"): Dialog;
  getModule(name: "locale"): Locale;
  getModule(name: string): any;

  container: HTMLElement;
  selection: Selection;
  scrollingContainer: HTMLElement;
  emitter: Emitter;

  deleteText(index: RangeStatic): DeltaStatic;
  deleteText(index: number, length: number, source?: Sources): DeltaStatic;

  setSelection(index: number): void;
  setSelection(index: number, length: number, source?: Sources): void;
  setSelection(range: RangeStatic, source?: Sources): void;

  getModule<T = any>(name: string): T;
  getModule(name: string): any;
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
  static sources: typeof Emitter.sources;

  static import(path: "blots/embed"): typeof Embed;
  static import(path: "modules/dialog"): typeof Dialog;
  static import(path: "delta"): typeof Delta;
  static import<T extends QuillType>(
    this: T,
    path: "ui/tooltip"
  ): typeof Tooltip<InstanceType<T>>;
  static import<T extends QuillType>(
    this: T,
    path: "themes/snow"
  ): typeof SnowTheme<InstanceType<T>>;
  static import<T extends QuillType>(
    this: T,
    path: "modules/clipboard"
  ): typeof Clipboard<InstanceType<T>>;
  static import<T extends QuillType>(
    this: T,
    path: "core/module"
  ): typeof Module<InstanceType<T>, any>;
  static import<T = any>(path: string): T;
  static import(path: string) {
    return super.import(path);
  }

  qlOptions: QlOptions;
  options!: QlQuillOptionsStatic;
  editor!: this;
  theme: any;
  prevSelection?: RangeStatic;

  constructor(container: string | Element, options: QlQuillOptions = {}) {
    const qlOptions = extractConfig(options);

    super(container, defaultConfig(options, qlOptions));
    // 阻止谷歌翻译输入框
    this.container.classList.add("notranslate");

    this.qlOptions = qlOptions;
    this.expandConfig(this.options, qlOptions);

    this.onEditorChange();

    qlOptions.value && this.setContents(qlOptions.value);

    // 兼容旧版本
    this.editor.root = this.root;

    // 旧数据处理 类名转成内联
    this.clipboard.addMatcher("SPAN", (node: HTMLSpanElement, delta) => {
      Array.from(node.classList).forEach((className) => {
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
    options: QlQuillOptionsStatic,
    qlOptions: QlOptions
  ): QlQuillOptionsStatic {
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

    if (
      toolbar.container.querySelector(".ql-question") ||
      toolbar.container.querySelector(".ql-option")
    ) {
      this.theme.addModule("question");
    }

    if (toolbar.container.querySelector(".ql-import")) {
      this.theme.addModule("import");
    }

    if (pasteFromWord) {
      this.theme.addModule("pasteFromWord");
    }

    if (limit) {
      const wordCount = this.theme.addModule("wordCount");
      wordCount.setOptions(qlOptions);
    }

    return options;
  }

  onEditorChange() {
    this.on(
      "editor-change",
      (
        eventName: "text-change" | "selection-change",
        rangeOrDelta: Delta | RangeStatic,
        oldRangeOrDelta: Delta | RangeStatic,
        source: Sources
      ) => {
        if (eventName === "text-change") {
          this.onEditorChangeText(
            this.root.innerHTML,
            rangeOrDelta as Delta,
            source
          );
        } else if (eventName === "selection-change") {
          this.onEditorChangeSelection(rangeOrDelta as RangeStatic, source);
        }
      }
    );
  }

  onEditorChangeText(value: string, delta: Delta, source: Sources) {
    if (this.getModule("wordCount")) return;

    this.qlOptions.onChange?.(value, delta);
  }

  onEditorChangeSelection(nextSelection: RangeStatic, source: Sources) {
    const currentSelection = this.prevSelection;
    const hasGainedFocus = !currentSelection && nextSelection;
    const hasLostFocus = currentSelection && !nextSelection;

    if (isEqual(nextSelection, currentSelection)) return;

    this.prevSelection = nextSelection;

    const toolbar = this.getModule("toolbar");

    if (hasGainedFocus) {
      this.container.classList.add("on-focus");
      toolbar.container.classList.add("on-focus");

      this.qlOptions.onFocus?.();
    } else if (hasLostFocus) {
      this.container.classList.remove("on-focus");
      toolbar.container.classList.remove("on-focus");

      this.qlOptions.onBlur?.();
    }
  }

  locale(preset: string, object?: Record<string, string>) {
    const locale = this.getModule("locale");

    return locale.locale(preset, object);
  }

  setContents(value: string | Delta): Delta {
    let delta: Delta;
    const sel = this.prevSelection;
    if (typeof value === "string") {
      delta = super.setContents(this.clipboard.convert(value));
    } else {
      delta = super.setContents(value);
    }
    postpone(() => this.setEditorSelection(this, sel!));

    return delta;
  }

  getHTML(): string {
    return this.root.innerHTML;
  }

  setEditorSelection(editor: this, range: RangeStatic) {
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
    const ImageUploader = this.getModule("imageUploader");

    //@ts-ignore
    return ImageUploader.constructor.insertImage.call(this, src, {
      "data-latex": latex,
      ...attributes,
    });
  }
}

function defaultConfig(
  options: QlQuillOptions,
  qlOptions: QlOptions
): QuillOptionsStatic {
  return extend(
    true,
    {
      theme: "snow",
      modules: {
        toolbar: { container: qlOptions.toolbar },
        imageUploader: qlOptions.image || {},
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
