import Quill from "quill";

const Image = Quill.import("formats/image");
const Module = Quill.import("core/module");

class ImageBlot extends Image {
  static create(value) {
    let node = super.create(value.url);

    return node;
  }

  static value(node) {
    return {
      url: node.getAttribute("src"),
    };
  }
}

class InsertImage extends Module {
  static register() {
    Quill.register(ImageBlot, true);
  }
}

export { ImageBlot, InsertImage as default };
