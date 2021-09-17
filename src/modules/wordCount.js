class WordCount {
  constructor(quill, options = {}) {
    this.quill = quill;
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
        const wordLens = this.calculate();

        const { limit, onLimit, onChange } = this.options;
        if (wordLens > limit) {
          onLimit && onLimit();
          this.quill.history.undo();
        } else {
          this.quill.history.cutoff();
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
    this.counter.innerText = this.calculate();
  }
}

export default WordCount;
