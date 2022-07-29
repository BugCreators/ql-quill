import Quill from "quill";
import isEqual from "lodash.isequal";
import extend from "extend";

import Dialog from "./modules/dialog";

import BlotFormatter, { ImageSpec } from "./modules/blotFormatter";

import SnowTheme from "./themes/snow";

import ImageBlot from "./blots/image";

import ImageUploader from "./modules/imageUploader";
import PasteFromWord from "./modules/pasteFromWord";
import WordCount from "./modules/wordCount";
import Import from "./modules/import";
import Question from "./modules/question";
import Formula from "./modules/formula";
import Locale from "./modules/locale";

import cleanIcon from "@icons/clean.svg?raw";

import "../assets/index.styl";

const Icons = Quill.import("ui/icons");
Object.assign(Icons, { clean: cleanIcon });

Quill.register(
  {
    "modules/dialog": Dialog,
    "modules/imageUploader": ImageUploader,
    "modules/pasteFromWord": PasteFromWord,
    "modules/wordCount": WordCount,
    "modules/question": Question,
    "modules/import": Import,
    "modules/formula": Formula,
    "modules/blotFormatter": BlotFormatter,
    "modules/locale": Locale,

    "themes/snow": SnowTheme,
  },
  true
);
Quill.register(ImageBlot, true);

class QlQuill extends Quill {
  constructor(container, options = {}) {
    const qlOptions = extractConfig(options);

    super(container, defaultConfig(options, qlOptions));
    // 阻止谷歌翻译输入框
    this.container.classList.add("notranslate");

    this.qlOptions = qlOptions;
    this.expandConfig(this.options, qlOptions);

    this.onEditorChange();

    this.setContents(qlOptions.value);

    // 兼容旧版本
    this.editor.root = this.root;

    // 旧数据处理 类名转成内联
    this.clipboard.addMatcher("SPAN", (node, delta) => {
      Array.from(node.classList).forEach(className => {
        const [, format, value] = className.match(/^ql-(size|font)-(.*)/) || [];

        if (!format || !value) return;

        delta.map((op, index) => {
          if (!op.attributes) op.attributes = {};

          op.attributes[format] = value + (format === "size" ? "px" : "");
        });
      });

      return delta;
    });
  }

  expandConfig(options, qlOptions) {
    const { imageResize, formula, limit, pasteFromWord } = qlOptions;

    // 添加图片缩放模块以及公式再编辑模块
    if (imageResize || formula) {
      options.modules.blotFormatter = {
        specs: [ImageSpec],
        resizable: imageResize,
      };

      this.theme.addModule("blotFormatter");
    }

    const toolbar = this.getModule("toolbar");

    if (toolbar.container.querySelector(".ql-question") || toolbar.container.querySelector(".ql-option")) {
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
    this.on("editor-change", (eventName, rangeOrDelta, oldRangeOrDelta, source) => {
      if (eventName === "text-change") {
        this.onEditorChangeText(this.root.innerHTML, rangeOrDelta, source);
      } else if (eventName === "selection-change") {
        this.onEditorChangeSelection(rangeOrDelta, source);
      }
    });
  }

  onEditorChangeText(value, delta, source) {
    if (this.getModule("wordCount")) return;

    this.qlOptions.onChange?.(value);
  }

  onEditorChangeSelection(nextSelection, source) {
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

  locale(preset, object) {
    const locale = this.getModule("locale");

    return locale.locale(preset, object);
  }

  setContents(value) {
    const sel = this.prevSelection;
    if (typeof value === "string") {
      super.setContents(this.clipboard.convert(value));
    } else {
      super.setContents(value);
    }
    postpone(() => this.setEditorSelection(this, sel));
  }

  getHTML() {
    return this.root.innerHTML;
  }

  setEditorSelection(editor, range) {
    this.prevSelection = range;
    if (range) {
      const length = editor.getLength();
      range.index = Math.max(0, Math.min(range.index, length - 1));
      range.length = Math.max(0, Math.min(range.length, length - 1 - range.index));
      editor.setSelection(range);
    }
  }

  insertImage(src, latex = "") {
    const imageUploader = this.getModule("imageUploader");

    return imageUploader.constructor.insertImage.call(this, src, latex);
  }
}

QlQuill.CUSTOM_TOOLS = ["import", "option", "formula", "question"];

QlQuill.CUSTOM_OPTIONS = [
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

function defaultConfig(options, qlOptions) {
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
      custom: QlQuill.CUSTOM_TOOLS.filter(tool => !!qlOptions[tool]),
    },
    options
  );
}

function extractConfig(options) {
  return QlQuill.CUSTOM_OPTIONS.concat(QlQuill.CUSTOM_TOOLS).reduce((memo, option) => {
    memo[option] = options[option];
    delete options[option];

    return memo;
  }, {});
}

function postpone(fn) {
  Promise.resolve().then(fn);
}

export default QlQuill;
