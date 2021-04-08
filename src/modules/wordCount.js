class WordCount {
  constructor(quill, options = {}) {
    this.quill = quill;
    this.options = options;
    if (options.limit) {
      this.quill.on("text-change", this.update.bind(this));
      this.update();
    }
  }

  calculate() {
    return this.quill.getLength() - 1;
  }

  update() {
    let length = this.calculate();

    if (!this.container) {
      this.container = document.createElement("span");
      this.container.classList.add("ql-word-count");
      this.quill.container.appendChild(this.container);
    }

    this.container.innerHTML = `<span class="ql-word-entered">${length}</span>/${this.options.limit}`;
  }
}

export default WordCount;
