import QlQuill from "../index";

const Embed = QlQuill.import("blots/embed");
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
  input: HTMLInputElement;

  static register() {
    QlQuill.register(ImportBlot, true);
  }

  constructor(quill: QlQuill, options: any) {
    super(quill, options);
    this.input = this.createInput();

    quill.getModule("toolbar").addHandler("import", this.insert.bind(this));
  }

  createInput() {
    const input = document.createElement("input");
    input.classList.add("ql-input", "ql-import-input");

    return input;
  }

  insert() {
    const dialog = this.quill.getModule("dialog");
    const locale = this.quill.getModule("locale");

    dialog.open({
      width: 640,
      title: locale.$locale("插入重点"),
      contentElement: this.input,
      onOk: close => {
        const range = this.quill.getSelection(true);
        this.quill.deleteText(range);
        let index = range.index;

        this.input.value.split("").forEach(word => {
          this.quill.insertEmbed(index, "import", word);
          index++;
        });
        this.quill.setSelection(index);
        close();
      },
      beforeClose: () => {
        this.input.value = "";
      },
    });
  }
}

export default Import;
