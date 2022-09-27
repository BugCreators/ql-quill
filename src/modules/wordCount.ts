import QlQuill from "../index";
import type { QlOptions } from "../types";
import type { Delta, Sources } from "quill";

interface WordCountOptions extends Pick<QlOptions, "onChange"> {
  /** 文本字数限制 */
  limit?: number;
  /** 字数超出限制时触发 */
  onLimit?(): void;
}

class WordCount {
  quill: QlQuill;
  options!: WordCountOptions;
  countTemp?: number;
  container?: HTMLElement;
  counter?: HTMLElement;

  constructor(quill: QlQuill, options = {}) {
    this.quill = quill;
    this.setOptions(options);
  }

  setOptions(options: WordCountOptions) {
    this.options = options;

    if (options.limit) {
      this.initLimiter();

      this.registerListener();
    }
  }

  registerListener() {
    this.quill.on(
      "editor-change",
      (eventName: "text-change" | "selection-change", delta: Delta, oldDelta: Delta, source: Sources) => {
        if (eventName === "text-change") {
          const { limit, onLimit, onChange } = this.options;

          const distance = this.calculate() - limit!;

          if (distance > 0) {
            onLimit?.();

            if (!this.quill.selection.composing) {
              const Delta = QlQuill.import("delta");

              const retainIndex = delta.reduce((length, op) => {
                if (typeof op.retain === "number") {
                  length += op.retain;
                } else if (typeof op.insert === "string") {
                  length += op.insert.length;
                } else if (typeof op.insert === "object") {
                  length += 1;
                }

                return length;
              }, -distance);

              this.quill.updateContents(new Delta().retain(retainIndex).delete(distance));

              setTimeout(() => this.quill.setSelection(retainIndex));
            }
          } else {
            onChange?.(this.quill.root.innerHTML, delta);
          }

          this.update();
        }
      }
    );
  }

  initLimiter() {
    this.container = this.quill.addContainer("ql-word-count") as HTMLElement;

    this.initCounter();

    this.container.appendChild(this.counter!);
    this.container.appendChild(document.createTextNode("/" + this.options.limit));
  }

  initCounter() {
    this.counter = document.createElement("span");
    this.counter.classList.add("ql-word-entered");

    this.update();
  }

  calculate() {
    return this.quill.getLength() - 1;
  }

  update() {
    const count = this.calculate();

    if (count === this.countTemp) return;
    this.countTemp = count;
    this.counter!.innerText = String(this.calculate());
  }
}

export default WordCount;
