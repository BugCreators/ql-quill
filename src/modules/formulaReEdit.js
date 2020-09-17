class FormulaReEdit {
  constructor(quill, options = () => {}) {
    this.quill = quill;

    this.options = options;

    this.quill.root.addEventListener(
      "click",
      this.handleClick.bind(this),
      false
    );
  }

  handleClick(evt) {
    if (
      evt.target &&
      evt.target.tagName &&
      evt.target.tagName.toUpperCase() === "IMG"
    ) {
      const latex = evt.target.dataset.latex || "";

      if (latex) this.options(latex);
    }
  }
}

export default FormulaReEdit;
