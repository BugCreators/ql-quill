import type BaseInline from "quill/blots/inline";
import QlQuill from "../index";

const Inline = QlQuill.import("blots/inline") as typeof BaseInline;
const Module = QlQuill.import("core/module");

class ImportBlot extends Inline {}

ImportBlot.blotName = "import";
ImportBlot.tagName = "POINT";

class Import extends Module {
  static register() {
    QlQuill.register(ImportBlot, true);
  }

  constructor(quill: QlQuill, options: any) {
    super(quill, options);

    const clipboard = quill.clipboard as unknown as {
      normalizeHTML(doc: Document): void;
    };
    const normalizeHTML = clipboard.normalizeHTML.bind(clipboard);
    clipboard.normalizeHTML = (doc: Document) => {
      doc.querySelectorAll("POINT").forEach(point => {
        const walker = doc.createTreeWalker(point, 4);
        let node = walker.nextNode();

        while (node) {
          node.nodeValue = node.nodeValue?.replace(/\uFEFF/g, "") || "";
          node = walker.nextNode();
        }
      });

      normalizeHTML(doc);
    };

    quill.clipboard.addMatcher("POINT", (_node, delta) => {
      delta.ops = delta.ops.flatMap(op => {
        if (typeof op.insert !== "string") return [op];

        const text = op.insert.replace(/\uFEFF/g, "");
        return text ? [{ ...op, insert: text }] : [];
      });

      return delta;
    });
  }
}

export default Import;
