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

import loadingIcon from "@icons/loading.svg";
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
    "modules/blotFormatter": BlotFormatter,

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
  }

  expandConfig(options, qlOptions) {
    const { imageResize, formula, image, limit, pasteFromWord } = qlOptions;

    // 添加图片缩放模块以及公式再编辑模块
    if (imageResize || formula) {
      options.modules.blotFormatter = {
        specs: [ImageSpec],
        resizable: imageResize,
        formula: formula && {
          onFormulaEdit: this.openFormulaDialog,
        },
      };

      this.theme.addModule("blotFormatter");
    }

    // 添加图片上传模块
    if (image) {
      options.modules.imageUploader = image;

      this.theme.addModule("imageUploader");
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

    this.clipboard.addMatcher("IMG", (node, delta) => {
      if (image.clipboard) {
        image.clipboard(node, delta);
        return;
      }

      const isBase64 = /^data:image/.test(node.src);
      if (isBase64 && typeof image?.action === "function") {
        const Delta = Quill.import("delta");
        const alt = "loading-" + Date.now();

        const uploader = this.getModule("imageUploader");
        uploader.uploadImage(node.src, url => {
          const image = this.root.querySelector(`[alt=${alt}]`);

          if (image) {
            image.setAttribute("src", url);
            image.removeAttribute("alt");
          }
        });

        return new Delta().insert(
          { image: loadingIcon },
          {
            alt,
          }
        );
      }
      return delta;
    });

    formula && toolbar.addHandler("formula", this.openFormulaDialog);

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

  // 插入公式弹窗
  openFormulaDialog = (img = null) => {
    const isImage = img instanceof HTMLImageElement;
    const latex = isImage ? img.dataset.latex : "";

    const dialog = this.getModule("dialog");

    dialog.open({
      width: 888,
      title: "插入公式",
      content: `
        <iframe
          src="${this.qlOptions.formula}"
          data-latex="${latex}"
          style="border:none;height:400px;width:100%;"
        ></iframe>
      `,
      onOk: _ => {
        if (!window.kfe) return;

        window.kfe.execCommand("get.image.data", data => {
          const sLatex = window.kfe.execCommand("get.source");

          const imageUploader = this.getModule("imageUploader");

          imageUploader.uploadImage(data.img, src => {
            if (isImage) {
              img.setAttribute("src", src);
              if (sLatex) img.dataset.latex = sLatex;
              return;
            }

            this.insertImage(src, sLatex);
          });
        });
      },
    });
  };
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
