import Quill from "quill";
import isEqual from "lodash.isequal";
import extend from "extend";

import QlDialog from "./components/qlDialog";

import "@plugin/image-resize/image-resize.min.js";
import FormulaReEdit from "./extends/formulaReEdit";

import SnowTheme from "./themes/snow";

import ImageBlot from "./blots/image";

import WordCount from "./modules/wordCount";
import Import from "./modules/import";
import Question from "./modules/question";

import cleanIcon from "@icons/clean.svg";

import "../assets/index.styl";

const CUSTOM_TOOL = ["import", "option", "formula", "question"];

const Icons = Quill.import("ui/icons");
Object.assign(Icons, { clean: cleanIcon });

Quill.register(
  {
    "modules/wordCount": WordCount,
    "modules/question": Question,
    "modules/import": Import,

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
        custom: CUSTOM_TOOL.filter(tool => !!this.options[tool]),
      },
      options
    );

    if (!options.modules) options.modules = {};

    const { imageResize, formula } = this.options;

    if (imageResize || formula) {
      const defaultOption = { modules: ["Resize", "DisplaySize"] };

      options.modules.imageResize =
        typeof imageResize === "object"
          ? extend(defaultOption, imageResize)
          : imageResize
          ? defaultOption
          : { modules: [] };

      if (formula) {
        options.modules.imageResize.modules.push(FormulaReEdit);
        options.modules.imageResize.onFormulaReEdit = img => {
          this.openFormulaDialog(img);
        };
      }
    }

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
    toolbar.addHandler("image", () => this.uploadImages());

    if (
      toolbar.container.querySelector(".ql-question") ||
      toolbar.container.querySelector(".ql-option")
    ) {
      this.editor.theme.addModule("question");
    }

    if (toolbar.container.querySelector(".ql-import")) {
      this.editor.theme.addModule("import");
    }

    const { limit, image, formula } = this.options;

    if (limit) {
      const wordCount = this.editor.theme.addModule("wordCount");
      wordCount.setOptions(this.options);
    }

    image &&
      image.clipboard &&
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
    const { onChange } = this.options;

    if (!this.editor || this.editor.getModule("wordCount")) return;

    onChange && onChange(value);
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

  // 上传图片
  uploadImages() {
    const { image } = this.options;

    if (typeof image === "function") {
      image(this.insertImage);
      return;
    }

    const toolbar = this.editor.getModule("toolbar");

    if (image.action) {
      let input = toolbar.container.querySelector("input.ql-image[type=file]");
      if (input == null) {
        input = document.createElement("input");
        input.setAttribute("type", "file");
        image.accept && input.setAttribute("accept", image.accept);
        input.classList.add("ql-image");
        input.addEventListener("change", () => {
          if (fileInput.files != null && fileInput.files[0] != null) {
            image.action(input.files[0], this.insertImage);
            fileInput.value = "";
          }
        });
        toolbar.container.appendChild(input);
      }
      input.click();

      return;
    }

    SnowTheme.DEFAULTS.modules.toolbar.handlers.image.call(toolbar);
  }

  // 插入图片
  insertImage = (src, latex = "") => {
    const range = this.editor.getSelection(true);
    this.editor.deleteText(range.index, range.length);
    const index = range.index;
    this.editor.insertEmbed(index, "image", {
      src,
      "data-latex": latex,
    });
    this.editor.setSelection(index + 1);
  };

  // 插入公式弹窗
  openFormulaDialog(img = null, callback) {
    const time = new Date().getTime();
    const latex = img ? img.dataset.latex || "" : "";

    new QlDialog({
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

          if (!callback) {
            if (img) {
              img.setAttribute("src", data.img);
              if (sLatex) img.dataset.latex = sLatex;
              return;
            }

            this.insertImage(data.img, sLatex);
            return;
          }

          const file = dataURLtoFile(data.img, `latex-formula-${time}.png`);

          callback(file, src => {
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

QlQuill.CUSTOM_OPTIONS = [
  "toolbar",
  "limit",
  "value",
  "onLimit",
  "image",
  "imageResize",
  "onChange",
  "import",
  "question",
  "option",
  "formula",
];

function extractConfig(options) {
  return QlQuill.CUSTOM_OPTIONS.reduce((memo, option) => {
    memo[option] = options[option] || false;
    delete options[option];

    return memo;
  }, {});
}

function dataURLtoFile(dataurl, filename) {
  const arr = dataurl.split(","),
    mime = arr[0].match(/:(.*?);/)[1],
    bstr = atob(arr[1]);

  let n = bstr.length,
    u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }

  const file = new Blob([u8arr], { type: mime });
  file.lastModifiedDate = new Date();
  file.name = filename;
  return file;
}

function postpone(fn) {
  Promise.resolve().then(fn);
}

export default QlQuill;
