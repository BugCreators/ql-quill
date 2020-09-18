import Quill from "quill";

const Image = Quill.import("formats/image");
const Module = Quill.import("core/module");

class ImageBlot extends Image {
  static create(value) {
    let node = super.create(typeof value === "string" ? value : value.url);
    if (value.latex) {
      node.dataset.latex = value.latex;
    }

    return node;
  }

  static value(node) {
    return {
      url: node.getAttribute("src"),
      latex: node.dataset.latex,
    };
  }
}

class ImageModule extends Module {
  static register() {
    Quill.register(ImageBlot, true);
  }
}

export { ImageBlot, ImageModule as default };
