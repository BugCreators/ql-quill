import QlQuill from "../index";

const Embed = QlQuill.import("blots/embed");
const Module = QlQuill.import("core/module");

class QuestionBlot extends Embed {
  static create(value: string) {
    const node = super.create("sub-" + value) as HTMLElement;
    node.innerText = "(1)";

    return node;
  }

  static value(node: Element) {
    if (node.tagName === "SUB-QUESTION") return "question";
    if (node.tagName === "SUB-OPTION") return "option";
    return undefined;
  }
}

QuestionBlot.blotName = "question";
QuestionBlot.tagName = ["SUB-QUESTION", "SUB-OPTION"];

class Question extends Module {
  static register() {
    QlQuill.register(QuestionBlot, true);
  }

  constructor(quill: QlQuill, options: any) {
    super(quill, options);

    quill.on("editor-change", (eventName: "text-change" | "selection-change"): void => {
      if (eventName === "text-change") this.format();
    });

    const toolbar = quill.getModule("toolbar");

    toolbar.addHandler("question", () => this.insert("question"));
    toolbar.addHandler("option", () => this.insert("option"));
  }

  insert(type: string) {
    const range = this.quill.getSelection(true);
    this.quill.deleteText(range);
    this.quill.insertEmbed(range.index, "question", type);
    this.quill.setSelection(range.index + 1);
  }

  format() {
    (QuestionBlot.tagName as string[]).forEach(tag => {
      const elements = this.quill.root.querySelectorAll(tag);
      elements.forEach((el, index) => ((el.children[0] as HTMLElement).innerText = "(" + (index + 1) + ")"));
    });
  }
}

export default Question;
