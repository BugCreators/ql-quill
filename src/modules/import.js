import Quill from "quill";
import QlDialog from "../components/qlDialog";

const Parchment = Quill.import("parchment");
const Modele = Quill.import("core/module");

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

class Import extends Modele {
  static register() {
    Quill.register(ImportBlot, true);
  }

  constructor(quill, options) {
    super(quill, options);

    quill.getModule("toolbar").addHandler("import", this.insert);
  }

  insert() {
    new QlDialog({
      width: 640,
      title: "插入重点",
      content: '<input class="ql-input ql-import-input" type="text" value="">',
      onOk: container => {
        let currentRange = this.quill.getSelection(true).index;

        container
          .querySelector(".ql-import-input")
          .value.split("")
          .forEach(item => {
            this.quill.insertEmbed(currentRange, "import", item);
            currentRange++;
          });
        this.quill.setSelection(currentRange);
      },
    });
  }
}

export default Import;
