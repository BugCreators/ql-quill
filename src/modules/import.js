import Quill from "quill";

const Embed = Quill.import("blots/embed");
const Module = Quill.import("core/module");

class ImportBlot extends Embed {
  static create(value) {
    let node = super.create(value);
    node.setAttribute("contenteditable", false);
    node.innerHTML = value;

    return node;
  }

  constructor(node) {
    super(node);

    node.innerHTML = node.innerText = node.innerText.replace(/\uFEFF/g, "");
  }

  static value(domNode) {
    return domNode.innerText;
  }

  index() {
    return 1;
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
