import type BaseEmbed from "quill/blots/embed";
import QlQuill from "../index";

const Embed = QlQuill.import("blots/embed") as typeof BaseEmbed;
const Module = QlQuill.import("core/module");

class ImportBlot extends Embed {
  static create(value: string) {
    const node = super.create(value) as HTMLElement;
    node.innerText = value;

    return node;
  }

  static value(domNode: HTMLElement) {
    return domNode.innerText;
  }
}

ImportBlot.blotName = "import";
ImportBlot.tagName = "POINT";

class Import extends Module {
  declare quill: QlQuill;

  static register() {
    QlQuill.register(ImportBlot, true);
  }

  constructor(quill: QlQuill, options: any) {
    super(quill, options);

    quill.getModule("toolbar").addHandler("import", this.insert.bind(this));
  }

  insert() {
    const range = this.quill.getSelection(true);
    if (!range || range.length === 0) return;

    const text = this.quill.getText(range.index, range.length);
    if (!text.trim()) return;

    this.quill.deleteText(range.index, range.length);

    let index = range.index;
    const Delta = QlQuill.import("delta");
    const delta = new Delta().retain(index);

    text.split("").forEach((word) => {
      if (word.match(/^\s$/)) return;

      delta.insert({ import: word });
      index++;
    });

    this.quill.updateContents(delta);
    this.quill.setSelection(index);
  }
}

export default Import;
