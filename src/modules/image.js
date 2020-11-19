import Quill from "quill";

const Image = Quill.import("formats/image");
const Module = Quill.import("core/module");

const ATTRIBUTES = ["src", "data-latex", "style", "width", "height"];

class ImageBlot extends Image {
  static create(value) {
    let node = super.create(value);

    if (typeof value === "object") {
      for (let attribute in value) {
        value[attribute] && node.setAttribute(attribute, value[attribute]);
      }
    }

    return node;
  }

  static value(node) {
    return ATTRIBUTES.reduce((formats, attribute) => {
      if (node.hasAttribute(attribute)) {
        formats[attribute] = node.getAttribute(attribute);
      }
      return formats;
    }, {});
  }
}

class ImageModule extends Module {
  static register() {
    Quill.register(ImageBlot, true);
  }
}

export { ImageBlot, ImageModule as default };
