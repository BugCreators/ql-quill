import Quill from "quill";
import isEqual from "lodash.isequal";

import Toolbar from "./components/toolbar";
import WordLimit from "./components/wordLimit";
import QlDialog from "./components/qlDialog";

import ImageResize from "quill-image-resize-module";
import Image from "./modules/image";
import Import from "./modules/import";
import Question from "./modules/question";
import formulaReEdit from "./modules/formulaReEdit";

import "../assets/index.styl";

Quill.register({
  "modules/imageResize": ImageResize,
  "modules/image": Image,
  "modules/import": Import,
  "modules/question": Question,
  "modules/formulaReEdit": formulaReEdit,
});

class QlQuill {
  constructor(container, options = {}) {
    this.Quill = Quill;
    if (typeof container === "string") {
      container = document.querySelector(container);
    }
    this.container = container;
    // 阻止谷歌翻译输入框
    this.container.classList.add("notranslate");
    this.value = options.value;

    this.replaceIcon();
    this.instantiateEditor(options);
    this.setEditorContents(this.value);
    this.instantiateWordLimit(options, this.editor.getLength() - 1);

    this.setContent = this.setEditorContents.bind(this);
    this.insertImage = this.insertImage.bind(this);
  }

  // 替换图标
  replaceIcon() {
    let Icons = Quill.import("ui/icons");
    Icons = Object.assign(Icons, {
      clean:
        '<svg t="1586414083235" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4848" width="16" height="16"><path d="M902.7 346.2l-314.4-256c-51.7-42-127.5-34.3-170 17.9L50.2 560.2c-42 51.7-34.3 127.5 17.4 170l313.9 255.5c52.2 42 127.5 34.3 170-17.4l368.6-452.1c41.9-52.2 34.3-127.5-17.4-170zM458.2 892.5L355.8 809l-93.7-76.3L142.8 637l38.4-47.1 39.9-49.2 314.4 256.5-38.9 48.1-38.4 47.2zM788 487l-76.3 93.7-111.1 137.2-314.9-256.5 111.1-136.2 76.3-93.7 38.4-47.1 118.3 96.3 93.7 76.3 101.9 82.9L788 487zM637.4 918h338.3v85.8H637.4z" p-id="4849"></path></svg>',
    });
    Quill.register(
      {
        "ui/icons": Icons,
      },
      true
    );
  }

  instantiateWordLimit(options, wordLens) {
    if (!options.limit) return;

    const wordLimit = new WordLimit(options.limit, wordLens);

    this.container.appendChild(wordLimit.container);
    this.updateLimit = wordLimit.update;
  }

  instantiateToolbar(options) {
    const toolbar = new Toolbar(options);

    this.container.parentElement.insertBefore(
      toolbar.container,
      this.container
    );

    return toolbar;
  }

  // 实例化编辑器
  instantiateEditor(options) {
    if (this.editor) return;
    const toolbar = this.instantiateToolbar(options);

    let editorOption = {
      theme: "snow",
      modules: {
        toolbar: {
          container: `#${toolbar.id}`,
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
            question: () => {
              this.insertQuestion("question");
            },
            option: () => {
              this.insertQuestion("option");
            },
            formula: () => {
              this.openFormulaDialog(options);
            },
          },
        },
        clipboard: {
          matchers: [
            [
              "IMG",
              (node, delta) => {
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
        formulaReEdit: latex => {
          this.openFormulaDialog(options, latex || "");
        },
      },
      placeholder: options.placeholder || "",
      readOnly: false,
    };

    if (options.imageResize) {
      editorOption.modules.imageResize = {};

      if (typeof options.imageResize === "boolean") {
        editorOption.modules.imageResize.modules = ["Resize", "DisplaySize"];
      } else if (typeof options.imageResize === "object") {
        editorOption.modules.imageResize = imageResize;
      }
    }

    if (options.image) {
      if (typeof options.image === "function") {
        editorOption.modules.toolbar.handlers.image = () =>
          options.image(this.insertImage.bind(this));
      } else if (typeof options.image === "object") {
        if (options.image.action) {
          editorOption.modules.toolbar.handlers.image = () =>
            this.uploadImages(options);
        }
      }
    }

    this.editor = new Quill(this.container, editorOption);

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

  setEditorContents(value) {
    this.value = value;
    const sel = this.selection;
    if (typeof value === "string") {
      this.editor.setContents(this.editor.clipboard.convert(value));
    } else {
      this.editor.setContents(value);
    }
    postpone(() => this.setEditorSelection(this.editor, sel));
  }

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
        this.updateLimit && this.updateLimit(wordLens);
      }
    }
  }

  onEditorChangeSelection(nextSelection, source, editor) {
    if (!this.editor) return;
    const currentSelection = this.selection;
    const hasGainedFocus = !currentSelection && nextSelection;
    const hasLostFocus = currentSelection && !nextSelection;

    if (isEqual(nextSelection, currentSelection)) return;

    this.selection = nextSelection;

    const toolbar = document.querySelector(".ql-toolbar");

    if (hasGainedFocus) {
      this.container.classList.add("on-focus");
      toolbar.classList.add("on-focus");
    } else if (hasLostFocus) {
      this.container.classList.remove("on-focus");
      toolbar.classList.remove("on-focus");
    }
  }

  // 自定义上传图片
  uploadImages(options) {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("hidden", true);
    if (options.image.accept) {
      input.setAttribute("accept", options.image.accept);
    }

    input.addEventListener(
      "change",
      e => {
        const file = e.target.files[0];
        options.image.action(file, this.insertImage.bind(this));
      },
      false
    );

    this.container.appendChild(input);
    input.click();
    this.container.removeChild(input);
  }

  // 插入图片
  insertImage(src, latex = "") {
    !this.editor.hasFocus() && this.editor.focus();
    const selection = this.editor.getSelection();
    if (selection && selection.length) {
      this.editor.deleteText(selection.index, selection.length);
    }
    const index = selection.index || 0;
    this.editor.insertEmbed(index, "image", {
      url: src,
      latex,
    });
    this.editor.setSelection(index + 1);
  }

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
    if (!options[type]) return;

    const nodes = this.editor.root.querySelectorAll(`sub-${type}`);
    if (!nodes.length) return;

    nodes.forEach((node, index) => {
      node.innerHTML = `(${index + 1})`;
    });
  }

  // 插入公式弹窗
  openFormulaDialog(options, latex = "") {
    const time = new Date().getTime();

    new QlDialog({
      width: 840,
      height: 400,
      title: "插入公式",
      content: `
        <iframe
          id="kfEditorContainer-${time}"
          src="${options.formula}?=${time}"
          ${latex ? `data-latex="${latex}"` : ""}
          style="border:none;height:100%;width:100%;"
        ></iframe>
      `,
      onOk: _ => {
        // 再编辑时 将选区定位到编辑的图片
        // 用于编辑后将原图片删除
        if (latex) {
          !this.editor.hasFocus() && this.editor.focus();
          const selection = this.editor.getSelection();
          if (!selection.length) {
            this.editor.setSelection({
              index: selection.index - 1,
              length: 1,
            });
          }
        }

        kfe.execCommand("get.image.data", data => {
          const latex = kfe.execCommand("get.source");

          if (!options.image.action) {
            this.insertImage.call(this, data.img, latex);
          } else {
            const file = dataURLtoFile(data.img, `latex-formula-${time}.png`);

            options.image.action(file, src => {
              this.insertImage(src, latex);
            });
          }
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
