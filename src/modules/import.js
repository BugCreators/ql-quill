import Quill from "quill";
import i18n from "../i18n";

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

    quill.getModule("toolbar").addHandler("import", this.insert);
  }

  insert() {
    const dialog = this.quill.getModule("dialog");

    dialog.open({
      width: 640,
      title: i18n.t("insertImport"),
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
