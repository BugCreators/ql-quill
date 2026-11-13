import type { Delta } from "quill/core";
import Quill from "../core/quill";
import type QlQuill from "../quill";
import type { QlOptions } from "../types";

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
  private listening = false;

  constructor(quill: QlQuill, options = {}) {
    this.quill = quill;
    this.setOptions(options);
  }

  setOptions(options: WordCountOptions) {
    this.options = options;

    if (!options.limit) return;

    this.initLimiter();
    this.registerListener();
  }

  registerListener() {
    // setOptions 可能被调用多次，监听只挂一次
    if (this.listening) return;
    this.listening = true;

    this.quill.on("text-change", delta => {
      const { limit, onLimit, onChange } = this.options;

      const distance = this.calculate() - (limit as number);

      if (distance > 0) {
        onLimit?.();

        if (!this.quill.selection.composing) {
          this.trimOverflow(delta, distance);
        }
      } else {
        onChange?.(this.quill.root.innerHTML, delta);
      }

      this.update();
    });
  }

  /** 超出上限的部分从末尾截掉，光标停在截断点 */
  trimOverflow(delta: Delta, distance: number) {
    const Delta = Quill.import("delta");

    const retainIndex = delta.reduce((length: number, op: any) => {
      if (typeof op.retain === "number") {
        length += op.retain;
      } else if (typeof op.insert === "string") {
        length += op.insert.length;
      } else if (typeof op.insert === "object") {
        length += 1;
      }

      return length;
    }, -distance);

    this.quill.updateContents(
      new Delta().retain(retainIndex).delete(distance),
    );

    setTimeout(() => this.quill.setSelection(retainIndex));
  }

  initLimiter() {
    if (this.container) return;

    this.container = this.quill.addContainer("ql-word-count") as HTMLElement;

    this.initCounter();

    this.container.appendChild(this.counter!);
    this.container.appendChild(
      document.createTextNode("/" + this.options.limit),
    );
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

    if (this.counter) this.counter.innerText = String(count);
  }
}

export default WordCount;
