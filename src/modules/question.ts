import type BaseEmbed from "quill/blots/embed";
import Quill from "../core/quill";
import type QlQuill from "../quill";

const Embed = Quill.import("blots/embed") as typeof BaseEmbed;
const Module = Quill.import("core/module");

type SubjectType = "question" | "option";

/** 小题 / 选项占位：<sub-question>、<sub-option> */
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

class QuestionBlot extends SubjectBlot {
  static tagName: string;
}

QuestionBlot.blotName = "question";
QuestionBlot.tagName = "SUB-QUESTION";

class OptionBlot extends SubjectBlot {
  static tagName: string;
}

OptionBlot.blotName = "option";
OptionBlot.tagName = "SUB-OPTION";

class Question extends Module {
  static register() {
    Quill.register(QuestionBlot, true);
    Quill.register(OptionBlot, true);
  }

  constructor(quill: QlQuill, options: any) {
    super(quill, options);

    quill.on("text-change", () => this.format());

    const toolbar = quill.getModule("toolbar");

    toolbar.addHandler("question", () => this.insert("question"));
    toolbar.addHandler("option", () => this.insert("option"));
  }

  insert(type: SubjectType) {
    const range = this.quill.getSelection(true);
    this.quill.deleteText(range);
    this.quill.insertEmbed(range.index, type, type);
    this.quill.setSelection(range.index + 1);
  }

  /** 占位符按出现顺序重新编号 */
  format() {
    [QuestionBlot.tagName, OptionBlot.tagName].forEach(tagName => {
      const elements = this.quill.root.querySelectorAll<HTMLElement>(tagName);
      if (!elements.length) return;

      elements.forEach((el, index) => {
        const serial = `(${index + 1})`;

        if (el.innerText !== serial) el.innerText = serial;
      });
    });
  }
}

export default Question;
