import Quill from "quill";

const Parchment = Quill.import("parchment");
const Module = Quill.import("core/module");

class ImportBlot extends Parchment.Embed {
  static create(value) {
    const node = super.create(value);
    node.setAttribute("contenteditable", false);
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

    quill.getModule("toolbar").addHandler("import", this.insert);
  }

  insert() {
    const Dialog = Quill.import("dialog");

    new Dialog({
      width: 640,
      title: "插入重点",
      content: '<input class="ql-input ql-import-input" type="text" value="">',
      onOk: container => {
        const range = this.quill.getSelection(true);
        this.quill.deleteText(range);
        let index = range.index;

        container
          .querySelector(".ql-import-input")
          .value.split("")
          .forEach(word => {
            this.quill.insertEmbed(index, "import", word);
            index++;
          });
        this.quill.setSelection(index);
      },
    });
  }
}

export default Import;
