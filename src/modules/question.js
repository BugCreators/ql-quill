import Quill from "quill";

const Embed = Quill.import("blots/embed");
const Module = Quill.import("core/module");

class QuestionBlot extends Embed {
  static create(value) {
    const node = super.create("sub-" + value);
    node.innerText = "(1)";

    return node;
  }

  static value(node) {
    if (node.tagName === "SUB-QUESTION") return "question";
    if (node.tagName === "SUB-OPTION") return "option";
    return undefined;
  }
}

QuestionBlot.blotName = "question";
QuestionBlot.tagName = ["SUB-QUESTION", "SUB-OPTION"];

class Question extends Module {
  static register() {
    Quill.register(QuestionBlot, true);
  }

  constructor(quill, options) {
    super(quill, options);

    quill.on("editor-change", eventName => {
      if (eventName === "text-change") this.format();
    });

    const toolbar = quill.getModule("toolbar");

    toolbar.addHandler("question", () => this.insert("question"));
    toolbar.addHandler("option", () => this.insert("option"));
  }

  insert(type) {
    const range = this.quill.getSelection(true);
    this.quill.deleteText(range);
    this.quill.insertEmbed(range.index, "question", type);
    this.quill.setSelection(range.index + 1);
  }

  format() {
    QuestionBlot.tagName.forEach(tag => {
      const elements = this.quill.root.querySelectorAll(tag);
      elements.forEach((el, index) => (el.children[0].innerText = "(" + (index + 1) + ")"));
    });
  }
}

export default Question;
