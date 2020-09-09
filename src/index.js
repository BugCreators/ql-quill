import Quill from "quill";
import ImageResize from "quill-image-resize-module";
import isEqual from "lodash/isEqual";

import "../assets/index.styl";

Quill.register({
  "modules/imageResize": ImageResize,
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
    this.options = options;
    this.value = this.options.value;
    this.limit = 1000;

    this.replaceIcon();
    this.instantiateEditor(options);
    this.setEditorContents(this.value);
    this.insertCount();

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

  // 字数显示
  insertCount() {
    if (!this.options.limit) return;
    this.limit = Number(this.options.limit) || this.limit;
    this.limitEl = document.createElement("span");
    this.limitEl.classList.add("ql-word-count");
    this.uploadCount(0);
    this.container.appendChild(this.limitEl);
  }

  // 更新字数
  uploadCount(count) {
    if (!this.limitEl) return;
    count = count >= 0 ? count : 0;

    if (!this.limitEl.innerHTML) {
      this.limitEl.innerHTML = `<span class="ql-word-entered">${count}</span>/${this.limit}`;
    } else {
      const enteredEl = this.limitEl.querySelector(".ql-word-entered");
      enteredEl.innerText = count;
    }
  }

  // 实例化编辑器
  instantiateEditor(options) {
    if (this.editor) return;
    const editorOption = {
      theme: "snow",
      modules: {
        toolbar: {
          container: [
            "bold", // 加粗
            "italic", // 斜体
            "underline", // 下划线
            { script: "sub" }, // 上标
            { script: "super" }, // 下标
            "clean", // 清除格式
            "image", // 插入图片
            // 'import'               // 插入重点
          ],
          handlers: {},
        },
        imageResize: {
          modules: ["Resize", "DisplaySize"],
        },
        clipboard: {
          matchers: [
            [
              "IMG",
              (node, delta) => {
                const imageTypeList = this.options.image.accept;
                if (imageTypeList && imageTypeList.length) {
                  const base64Reg = new RegExp(
                    `^data:image/(${imageTypeList.join("|")});base64`,
                    "ig"
                  );
                  const isBase64 = base64Reg.test(node.src);
                  if (isBase64) {
                    const Delta = Quill.import("delta");
                    return new Delta();
                  }
                }

                return delta;
              },
            ],
          ],
        },
      },
      placeholder: options.placeholder || "",
      readOnly: false,
    };

    if ("image" in options && options.image.action) {
      const { customHandlers, action } = options.image;

      if (customHandlers) {
        editorOption.modules.toolbar.handlers.image = () =>
          customHandlers(this.insertImage.bind(this));
      } else if (action) {
        editorOption.modules.toolbar.handlers.image = () =>
          this.uploadImages(action);
      }
    }

    this.editor = new Quill(this.container, editorOption);

    this.toolbar = document.querySelector(".ql-toolbar");

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

  onEditorChangeText(value, delta, source) {
    if (!this.editor) return;

    if (this.options.limit) {
      const wordLens = this.editor.getLength() - 1;
      if (wordLens > this.limit) {
        this.editor.history.undo();
      } else {
        this.editor.history.cutoff();
        this.options.onChange && this.options.onChange(value);
        this.uploadCount(wordLens);
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

    if (hasGainedFocus) {
      this.container.classList.add("on-focus");
      this.toolbar.classList.add("on-focus");
    } else if (hasLostFocus) {
      this.container.classList.remove("on-focus");
      this.toolbar.classList.remove("on-focus");
    }
  }

  // 自定义上传图片
  uploadImages(action) {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("hidden", true);
    if (this.options.image.accept) {
      input.setAttribute("accept", this.options.image.accept);
    }

    input.addEventListener(
      "change",
      e => {
        const file = e.target.files[0];
        action(file, this.insertImage.bind(this));
      },
      false
    );

    this.container.appendChild(input);
    input.click();
    this.container.removeChild(input);
  }

  insertImage(src) {
    this.editor.focus();
    const currentRange = this.editor.getSelection().index;
    this.editor.insertEmbed(currentRange, "image", src);
    this.editor.setSelection(currentRange + 1);
  }
}

function postpone(fn) {
  Promise.resolve().then(fn);
}

export default QlQuill;
