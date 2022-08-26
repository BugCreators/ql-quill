import Quill from "quill";

const Image = Quill.import("formats/image");

const ATTRIBUTES = ["src", "data-latex", "style", "width", "height"];

class ImageBlot extends Image {
  static create(value: Record<string, string> | string) {
    const node = super.create(value);

    if (typeof value === "object") {
      for (let attribute in value) {
        value[attribute] && node.setAttribute(attribute, value[attribute]);
      }
    }

    return node;
  }

  static value(node: Element) {
    return ATTRIBUTES.reduce((formats, attribute) => {
      if (node.hasAttribute(attribute)) {
        formats[attribute] = node.getAttribute(attribute);
      }
      return formats;
    }, {} as Record<string, string | null>);
  }
}

export default ImageBlot;
