export default class ImageUploader {
  static insertImage(src, latex) {
    const range = this.getSelection(true);
    this.deleteText(range);
    this.insertEmbed(range.index, "image", {
      src,
      "data-latex": latex,
    });
    this.setSelection(range.index + 1);
  }

  constructor(quill, options) {
    this.quill = quill;
    this.options = options;

    const toolbar = this.quill.getModule("toolbar");
    toolbar.addHandler("image", this.uploadImage);

    options.drop &&
      this.quill.root.addEventListener("drop", this.handleDrop, false);
  }

  insertImage(file) {
    if (typeof this.options.action === "function") {
      this.options.action(file, this.constructor.insertImage.bind(this.quill));
      return;
    }

    const fr = new FileReader();
    fr.onload = _ => this.constructor.insertImage.call(this.quill, fr.result);
    fr.readAsDataURL(file);
  }

  uploadImage = () => {
    if (typeof this.options === "function") {
      this.options();
      return;
    }

    const toolbar = this.quill.getModule("toolbar");

    let input = toolbar.container.querySelector("input.ql-image[type=file]");
    if (input == null) {
      input = document.createElement("input");
      input.setAttribute("type", "file");
      input.setAttribute("accept", this.options.accept || "image/*");
      input.classList.add("ql-image");
      input.addEventListener("change", () => {
        if (input.files != null && input.files[0] != null) {
          this.insertImage(input.files[0]);
          input.value = "";
        }
      });
      toolbar.container.appendChild(input);
    }
    input.click();
  };

  handleDrop = e => {
    e.stopPropagation();
    e.preventDefault();
    if (e.dataTransfer?.files?.length) {
      const selection = document.getSelection();
      if (document.caretRangeFromPoint) {
        const range = document.caretRangeFromPoint(e.clientX, e.clientY);
        if (selection && range) {
          selection.setBaseAndExtent(
            range.startContainer,
            range.startOffset,
            range.startContainer,
            range.startOffset
          );
        }
      } else {
        const range = document.caretPositionFromPoint(e.clientX, e.clientY);
        if (selection && range) {
          selection.setBaseAndExtent(
            range.offsetNode,
            range.offset,
            range.offsetNode,
            range.offset
          );
        }
      }

      const file = e.dataTransfer.files[0];

      setTimeout(() => this.insertImage(file));
    }
  };
}
