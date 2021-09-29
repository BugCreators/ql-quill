import Quill from "quill";

class WordCount {
  constructor(quill, options = {}) {
    this.quill = quill;
    this.countTemp = 0;
    this.setOptions(options);
  }

  setOptions(options) {
    this.options = options;

    if (options.limit) {
      this.initLimiter();

      this.registerListener();
    }
  }

  registerListener() {
    this.quill.on("editor-change", (eventName, delta, oldDelta, source) => {
      if (eventName === "text-change") {
        const { limit, onLimit, onChange } = this.options;

        const distance = this.calculate() - limit;

        if (distance > 0) {
          onLimit && onLimit();

          if (!this.quill.selection.composing) {
            const Delta = Quill.import("delta");

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

            this.quill.updateContents(
              new Delta().retain(retainIndex).delete(distance)
            );

            setTimeout(() => this.quill.setSelection(retainIndex, 0));
          }
        } else {
          onChange && onChange(this.quill.root.innerHTML);
        }

        this.update();
      }
    });
  }

  initLimiter() {
    this.container = document.createElement("span");
    this.container.classList.add("ql-word-count");
    this.quill.container.appendChild(this.container);

    this.initCounter();

    this.container.appendChild(this.counter);
    this.container.appendChild(
      document.createTextNode("/" + this.options.limit)
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
    this.counter.innerText = this.calculate();
  }
}

export default WordCount;
