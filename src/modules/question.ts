import QlQuill from "../index";

const Embed = QlQuill.import("blots/embed");
const Module = QlQuill.import("core/module");

class SubjectBlot extends Embed {
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

class QuestionBlot extends SubjectBlot {}

QuestionBlot.blotName = "question";
QuestionBlot.tagName = "SUB-QUESTION";

class OptionBlot extends SubjectBlot {}

OptionBlot.blotName = "option";
OptionBlot.tagName = "SUB-OPTION";

class Question extends Module {
  static register() {
    QlQuill.register(QuestionBlot, true);
    QlQuill.register(OptionBlot, true);
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
    this.quill.insertEmbed(range.index, type, type);
    this.quill.setSelection(range.index + 1);
  }

  format() {
    [QuestionBlot.tagName, OptionBlot.tagName].forEach(tag => {
      const elements = this.quill.root.querySelectorAll(tag);
      elements.forEach((el, index) => ((el.children[0] as HTMLElement).innerText = "(" + (index + 1) + ")"));
    });
  }
}

export default Question;
