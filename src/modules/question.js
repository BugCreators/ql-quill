import Quill from "quill";

const Modele = Quill.import("core/module");
const Parchment = Quill.import("parchment");

class QuestionBlot extends Parchment.Embed {
  static create(value) {
    const node = super.create("sub-" + value);
    node.setAttribute("contenteditable", false);
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

class Question extends Modele {
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
    const selection = this.quill.getSelection(true);
    if (selection && selection.length) {
      this.quill.deleteText(selection.index, selection.length);
    }
    const index = selection.index || 0;
    this.quill.insertEmbed(index, "question", type);
    this.quill.setSelection(index + 1);
  }

  format() {
    QuestionBlot.tagName.forEach(tag => {
      const elements = this.quill.root.querySelectorAll(
        tag.toLocaleLowerCase()
      );
      elements.forEach((el, index) => (el.innerHTML = "(" + (index + 1) + ")"));
    });
  }
}

export default Question;
