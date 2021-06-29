import Quill from "quill";

const Embed = Quill.import("blots/embed");

class QuestionBlot extends Embed {
  static create(value) {
    const name = `sub-${value}`;
    const node = document.createElement(name);
    node.setAttribute("contenteditable", false);
    return node;
  }

  constructor(node) {
    super(node);

    node.innerHTML = node.innerText = node.innerText.replace(/\uFEFF/g, "");
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

  index() {
    return 1;
  }
}
QuestionBlot.blotName = "question";
QuestionBlot.tagName = ["SUB-QUESTION", "SUB-OPTION"];

export default QuestionBlot;
