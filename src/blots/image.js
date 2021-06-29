import Quill from "quill";

const Image = Quill.import("formats/image");

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

export default ImageBlot;
