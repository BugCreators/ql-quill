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

import cleanIcon from "@icons/clean.svg";

import "../assets/index.styl";

const Icons = Quill.import("ui/icons");
Object.assign(Icons, { clean: cleanIcon });

Quill.register(
  {
    dialog: Dialog,
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

class QlQuill {
  static Quill = Quill;

  constructor(container, options = {}) {
    if (typeof container === "string") {
      container = document.querySelector(container);
    }
    this.container = container;
    // 阻止谷歌翻译输入框
    this.container.classList.add("notranslate");

    this.options = extractConfig(options);

    this.instantiateEditor(options);
    this.setContents(this.options.value);
  }

  expandConfig(options) {
    options = extend(
      true,
      {
        theme: "snow",
        modules: { toolbar: { container: this.options.toolbar } },
        custom: this.constructor.CUSTOM_TOOLS.filter(
          tool => !!this.options[tool]
        ),
      },
      options
    );

    const { imageResize, formula, image } = this.options;

    let modules = {};

    if (imageResize || formula) {
      modules.blotFormatter = {
        specs: [ImageSpec],
        resizable: imageResize,
        formula: formula && {
          onFormulaEdit: this.openFormulaDialog.bind(this),
        },
      };
    }

    if (image) modules.imageUploader = image;

    options = extend(true, { modules }, options);

    return options;
  }

  // 实例化编辑器
  instantiateEditor(options) {
    if (this.editor) return;

    this.editor = new Quill(this.container, this.expandConfig(options));

    this.transformConfig();

    this.editor.on(
      "editor-change",
      (eventName, rangeOrDelta, oldRangeOrDelta, source) => {
        if (eventName === "text-change") {
          this.onEditorChangeText(
            this.editor.root.innerHTML,
            rangeOrDelta,
            source
          );
        } else if (eventName === "selection-change") {
          this.onEditorChangeSelection(rangeOrDelta, source);
        }
      }
    );
  }

  transformConfig() {
    const toolbar = this.editor.getModule("toolbar");

    if (
      toolbar.container.querySelector(".ql-question") ||
      toolbar.container.querySelector(".ql-option")
    ) {
      this.editor.theme.addModule("question");
    }

    if (toolbar.container.querySelector(".ql-import")) {
      this.editor.theme.addModule("import");
    }

    const { limit, image, formula, pasteFromWord } = this.options;

    if (pasteFromWord) {
      this.editor.theme.addModule("pasteFromWord");
    }

    if (limit) {
      const wordCount = this.editor.theme.addModule("wordCount");
      wordCount.setOptions(this.options);
    }

    image?.clipboard &&
      this.editor.clipboard.addMatcher("IMG", image.clipboard);

    formula && toolbar.addHandler("formula", () => this.openFormulaDialog());
  }

  setContents = value => {
    const sel = this.selection;
    if (typeof value === "string") {
      this.editor.setContents(this.editor.clipboard.convert(value));
    } else {
      this.editor.setContents(value);
    }
    postpone(() => this.setEditorSelection(this.editor, sel));
  };

  getHTML = () => {
    return this.editor.root.innerHTML;
  };

  setEditorSelection(editor, range) {
    this.selection = range;
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

  onEditorChangeText(value, delta, source) {
    if (!this.editor || this.editor.getModule("wordCount")) return;

    this.options.onChange?.(value);
  }

  onEditorChangeSelection(nextSelection, source) {
    if (!this.editor) return;

    const currentSelection = this.selection;
    const hasGainedFocus = !currentSelection && nextSelection;
    const hasLostFocus = currentSelection && !nextSelection;

    if (isEqual(nextSelection, currentSelection)) return;

    this.selection = nextSelection;

    const toolbar = this.editor.getModule("toolbar");

    if (hasGainedFocus) {
      this.container.classList.add("on-focus");
      toolbar.container.classList.add("on-focus");
    } else if (hasLostFocus) {
      this.container.classList.remove("on-focus");
      toolbar.container.classList.remove("on-focus");
    }
  }

  insertImage = (src, latex = "") => {
    const imageUploader = this.editor.getModule("imageUploader");

    return imageUploader.constructor.insertImage.call(this.editor, src, latex);
  };

  // 插入公式弹窗
  openFormulaDialog(img = null) {
    const time = new Date().getTime();
    const latex = img?.dataset.latex || "";

    const Dialog = Quill.import("dialog");

    new Dialog({
      width: 888,
      title: "插入公式",
      content: `
        <iframe
          id="kfEditorContainer-${time}"
          src="${this.options.formula}?=${time}"
          ${latex ? `data-latex="${latex}"` : ""}
          style="border:none;height:400px;width:100%;"
        ></iframe>
      `,
      onOk: _ => {
        if (!window.kfe) return;

        window.kfe.execCommand("get.image.data", data => {
          const sLatex = window.kfe.execCommand("get.source");

          const imageUploader = this.editor.getModule("imageUploader");

          imageUploader.uploadImage(data.img, src => {
            if (img) {
              img.setAttribute("src", src);
              if (sLatex) img.dataset.latex = sLatex;
              return;
            }

            this.insertImage(src, sLatex);
          });
        });
      },
    });
  }
}

QlQuill.CUSTOM_TOOLS = ["import", "option", "formula", "question"];

QlQuill.CUSTOM_OPTIONS = [
  "toolbar",
  "limit",
  "value",
  "onLimit",
  "image",
  "imageResize",
  "onChange",
  "pasteFromWord",
];

function extractConfig(options) {
  return QlQuill.CUSTOM_OPTIONS.concat(QlQuill.CUSTOM_TOOLS).reduce(
    (memo, option) => {
      memo[option] = options[option] || false;
      delete options[option];

      return memo;
    },
    {}
  );
}

function postpone(fn) {
  Promise.resolve().then(fn);
}

export default QlQuill;
