import type ClipboardType from "quill/modules/clipboard";
import QlQuill from "../index";
import RtfExtracter from "../worker/rtf-extracter.worker?worker&inline";

const BaseClipboard = QlQuill.import(
  "modules/clipboard"
) as typeof ClipboardType;

export class Clipboard extends BaseClipboard {
  declare quill: QlQuill;

  onCapturePaste(e: ClipboardEvent) {
    const pasteFromWord = this.quill.getModule("pasteFromWord");
    if (!pasteFromWord) return super.onCapturePaste(e);

    super.onCapturePaste(e);

    try {
      const worker = new RtfExtracter();
      worker.postMessage(e.clipboardData?.getData("text/rtf"));
      worker.onmessage = (e) => {
        if (!e.data.length) return;

        const uploader = this.quill.getModule("uploader");

        let index = 0;
        [...this.quill.container.querySelectorAll("img")].forEach((el) => {
          const src = el.getAttribute("src");

          if (/^file:\/\/[\s\S]+|^\/\/:0/.test(src!)) {
            const image = e.data[index];

            uploader
              .uploadImage(image.base64)
              .then((url) => {
                el.setAttribute("src", url);
              })
              .catch(() => {
                el.parentNode!.removeChild(el);
              });

            index++;
          }
        });
        worker.terminate();
      };
      worker.onerror = (e) => {
        console.log(e);
        worker.terminate();
      };
    } catch (e) {
      console.log(e);
    }
  }
}

const Module = QlQuill.import("core/module");

class PasteFromWord extends Module {
  static register() {
    QlQuill.register({ "modules/clipboard": Clipboard }, true);
  }
}

export default PasteFromWord;
