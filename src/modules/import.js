import Quill from "quill";

const Embed = Quill.import("blots/embed");
const Module = Quill.import("core/module");

class ImportBlot extends Embed {
  static create(value) {
    const node = super.create(value);
    node.innerText = value;

    return node;
  }

  static value(domNode) {
    return domNode.innerText;
  }
}

ImportBlot.blotName = "import";
ImportBlot.tagName = "POINT";

class Import extends Module {
  static register() {
    Quill.register(ImportBlot, true);
  }

  constructor(quill, options) {
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
      beforeClose: _ => {
        this.input.value = "";
      },
    });
  }
}

export default Import;
