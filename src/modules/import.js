import Quill from "quill";

const Embed = Quill.import("blots/embed");
const Module = Quill.import("core/module");

class ImportBlot extends Embed {
  static create(value) {
    let node = super.create(value);
    node.setAttribute("contenteditable", false);

    return node;
  }

  constructor(scroll, domNode, value) {
    super(scroll, domNode);

    domNode.innerHTML = domNode.innerText = value;
  }

  static value(domNode) {
    return domNode.innerText;
  }
}
ImportBlot.blotName = "import";
ImportBlot.tagName = "POINT";

class ImportModule extends Module {
  static register() {
    Quill.register(ImportBlot, true);
  }
}

export { ImportBlot, ImportModule as default };
