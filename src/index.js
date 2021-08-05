import Quill from "quill";
import isEqual from "lodash.isequal";

import QlDialog from "./components/qlDialog";

import "@plugin/image-resize/image-resize.min.js";
import FormulaReEdit from "./extends/formulaReEdit";

import SnowTheme from "./themes/snow";

import ImageBlot from "./blots/image";
import ImportBlot from "./blots/import";
import QuestionBlot from "./blots/question";

import WordCount from "./modules/wordCount";

import cleanIcon from "@icons/clean.svg";

import "../assets/index.styl";

const CUSTOM_TOOL = ["import", "option", "formula", "question"];

const Icons = Quill.import("ui/icons");
Object.assign(Icons, { clean: cleanIcon });

Quill.register(
  {
    "modules/wordCount": WordCount,

    "themes/snow": SnowTheme,
  },
  true
);

Quill.register(ImageBlot, true);
Quill.register(ImportBlot, true);
Quill.register(QuestionBlot, true);

class QlQuill {
  static Quill = Quill;

  constructor(container, options = {}) {
    if (typeof container === "string") {
      container = document.querySelector(container);
    }
    this.container = container;
    // 阻止谷歌翻译输入框
    this.container.classList.add("notranslate");

    this.instantiateEditor(options);
    this.setContents(options.value);
  }

  // 实例化编辑器
  instantiateEditor(options) {
    if (this.editor) return;

    const { limit, image, imageResize } = options;

    let option = {
      theme: "snow",
      modules: {
        toolbar: {
          container: options.toolbar,
          handlers: {
            import: () => {
              new QlDialog({
                width: 640,
                title: "插入重点",
                content:
                  '<input class="ql-input ql-import-input" type="text" value="">',
                onOk: container => {
                  !this.editor.hasFocus() && this.editor.focus();
                  let currentRange = this.editor.getSelection().index;

                  container
                    .querySelector(".ql-import-input")
                    .value.split("")
                    .forEach(item => {
                      this.editor.insertEmbed(currentRange, "import", item);
                      currentRange++;
                    });
                  this.editor.setSelection(currentRange);
                },
              });
            },
            color: () => {
              const formats = this.editor.getFormat(
                this.editor.selection.savedRange.index
              );

              this.editor.theme.colorPicker.edit(formats.color);
            },
            question: () => {
              this.insertQuestion("question");
            },
            option: () => {
              this.insertQuestion("option");
            },
            formula: () => {
              this.openFormulaDialog(options);
            },
            image:
              typeof image === "function"
                ? () => image(this.insertImage)
                : typeof image === "object" && image.action
                ? () => this.uploadImages(options)
                : undefined,
          },
        },
        imageResize: {
          modules: [
            FormulaReEdit,
            ...(typeof imageResize === "boolean" && imageResize
              ? ["Resize", "DisplaySize"]
              : []),
          ],
          onFormulaReEdit: img => {
            this.openFormulaDialog(options, img);
          },
        },
        wordCount: {
          limit: limit ? Number(limit) || 1000 : undefined,
        },
        clipboard: {
          matchers: [
            [
              "IMG",
              (node, delta) => {
                if (image && image.clipboard) {
                  return image.clipboard(node, delta);
                }

                const isBase64OrLocal = /^(data:image|file:\/\/)/.test(
                  node.src
                );
                if (isBase64OrLocal) {
                  const Delta = Quill.import("delta");
                  return new Delta();
                }

                return delta;
              },
            ],
          ],
        },
      },
      custom: CUSTOM_TOOL.filter(tool => !!options[tool]),
      placeholder: options.placeholder || "",
      readOnly: false,
    };

    this.editor = new Quill(this.container, option);

    this.editor.on(
      "editor-change",
      (eventName, rangeOrDelta, oldRangeOrDelta, source) => {
        if (eventName === "text-change") {
          this.formatQuestion(options, "question");
          this.formatQuestion(options, "option");

          this.onEditorChangeText(
            this.editor.root.innerHTML,
            rangeOrDelta,
            source,
            options
          );
        } else if (eventName === "selection-change") {
          this.onEditorChangeSelection(rangeOrDelta, source);
        }
      }
    );
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

  onEditorChangeText(value, delta, source, options) {
    if (!this.editor) return;

    if (options.limit) {
      const wordLens = this.editor.getLength() - 1;
      if (wordLens > options.limit) {
        this.editor.history.undo();
      } else {
        this.editor.history.cutoff();
        options.onChange && options.onChange(value);
      }
    } else {
      options.onChange && options.onChange(value);
    }
  }

  onEditorChangeSelection(nextSelection, source) {
    if (!this.editor) return;
    const currentSelection = this.selection;
    const hasGainedFocus = !currentSelection && nextSelection;
    const hasLostFocus = currentSelection && !nextSelection;

    if (isEqual(nextSelection, currentSelection)) return;

    this.selection = nextSelection;

    if (hasGainedFocus) {
      this.container.classList.add("on-focus");
      this.editor.theme.modules.toolbar.container.classList.add("on-focus");
    } else if (hasLostFocus) {
      this.container.classList.remove("on-focus");
      this.editor.theme.modules.toolbar.container.classList.remove("on-focus");
    }
  }

  // 自定义上传图片
  uploadImages(options) {
    const { image } = options;

    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("hidden", true);
    if (image.accept) {
      input.setAttribute("accept", image.accept);
    }

    input.addEventListener(
      "change",
      e => {
        const file = e.target.files[0];
        image.action(file, this.insertImage);
      },
      false
    );

    this.container.appendChild(input);
    input.click();
    this.container.removeChild(input);
  }

  // 插入图片
  insertImage = (src, latex = "") => {
    !this.editor.hasFocus() && this.editor.focus();
    const selection = this.editor.getSelection();
    if (selection && selection.length) {
      this.editor.deleteText(selection.index, selection.length);
    }
    const index = selection.index || 0;
    this.editor.insertEmbed(index, "image", {
      src,
      "data-latex": latex,
    });
    this.editor.setSelection(index + 1);
  };

  // 插入小题
  insertQuestion(type) {
    !this.editor.hasFocus() && this.editor.focus();
    const selection = this.editor.getSelection();
    if (selection && selection.length) {
      this.editor.deleteText(selection.index, selection.length);
    }
    const index = selection.index || 0;
    this.editor.insertEmbed(index, "question", type);
    this.editor.setSelection(index + 1);
  }

  // 小题序号
  formatQuestion(options, type) {
    if (!options[type] && options.toolbar && !options.toolbar.includes(type))
      return;

    const nodes = this.editor.root.querySelectorAll(`sub-${type}`);
    if (!nodes.length) return;

    nodes.forEach((node, index) => {
      node.innerHTML = `(${index + 1})`;
    });
  }

  // 插入公式弹窗
  openFormulaDialog(options, img = null) {
    const time = new Date().getTime();
    const latex = img ? img.dataset.latex || "" : "";

    new QlDialog({
      width: 888,
      title: "插入公式",
      content: `
        <iframe
          id="kfEditorContainer-${time}"
          src="${options.formula}?=${time}"
          ${latex ? `data-latex="${latex}"` : ""}
          style="border:none;height:400px;width:100%;"
        ></iframe>
      `,
      onOk: _ => {
        if (!window.kfe) return;

        window.kfe.execCommand("get.image.data", data => {
          const sLatex = window.kfe.execCommand("get.source");

          if (!options.image.action) {
            if (img) {
              img.setAttribute("src", data.img);
              if (sLatex) img.dataset.latex = sLatex;
              return;
            }

            this.insertImage(data.img, sLatex);
            return;
          }

          const file = dataURLtoFile(data.img, `latex-formula-${time}.png`);

          options.image.action(file, src => {
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
