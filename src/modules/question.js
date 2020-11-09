import Quill from "quill";

const Embed = Quill.import("blots/embed");
const Module = Quill.import("core/module");

class QuestionBlot extends Embed {
  static create(value) {
    const name = `sub-${value}`;
    const node = document.createElement(name);
    node.setAttribute("contenteditable", false);
    return node;
  }

  constructor(scroll, domNode, value) {
    super(scroll, domNode);

    domNode.innerHTML = domNode.innerText = domNode.innerText.replace(
      /\uFEFF/g,
      ""
    );
  }

  static formats(domNode) {
    if (domNode.tagName === "SUB-QUESTION") return "question";
    if (domNode.tagName === "SUB-OPTION") return "option";
    return undefined;
  }

  static value(node) {
    if (node.tagName === "SUB-QUESTION") return "question";
    if (node.tagName === "SUB-OPTION") return "option";
    return undefined;
  }
}
QuestionBlot.blotName = "question";
QuestionBlot.tagName = ["SUB-QUESTION", "SUB-OPTION"];

class QuestionModule extends Module {
  static register() {
    Quill.register(QuestionBlot, true);
  }
}

export { QuestionBlot, QuestionModule as default };
