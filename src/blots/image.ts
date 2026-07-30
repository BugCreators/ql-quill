import Quill from "quill";
import BaseImage from "quill/formats/image";

const Image = Quill.import("formats/image") as typeof BaseImage;

// const ATTRIBUTES = ["src", "data-latex", "style", "width", "height"];

class ImageBlot extends Image {
  static create(value: Record<string, string> | string) {
    const node = super.create(value as any);

    if (typeof value === "object") {
      for (let attribute in value) {
        value[attribute] && node.setAttribute(attribute, value[attribute]);
      }
    }

    return node;
  }

  static value(node: Element): any {
    const src = super.value(node);

    if (!node.hasAttribute("data-latex")) return src;

    return {
      src,
      "data-latex": node.getAttribute("data-latex"),
    };
  }
}

export default ImageBlot;
