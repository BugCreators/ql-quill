import QlQuill from "../index";
import RtfExtracter from "../worker/rtf-extracter.worker?worker&inline";

const BaseClipboard = QlQuill.import("modules/clipboard");

export class Clipboard extends BaseClipboard {
  onPaste(e: ClipboardEvent) {
    const pasteFromWord = this.quill.getModule("pasteFromWord");
    if (!pasteFromWord) return super.onPaste(e);

    setTimeout(() => {
      [...this.container.querySelectorAll("V\\:IMAGEDATA")].forEach(el => {
        const img = document.createElement("img");

        img.setAttribute("src", el.getAttribute("src")!);
        img.setAttribute("width", pt2Px(el.parentElement!.style.width));
        img.setAttribute("height", pt2Px(el.parentElement!.style.height));

        el.parentElement!.parentElement!.replaceChild(img, el.parentElement!);
      });
    });
    super.onPaste(e);

    try {
      const worker = new RtfExtracter();
      worker.postMessage(e.clipboardData?.getData("text/rtf"));
      worker.onmessage = e => {
        if (!e.data.length) return;

        const uploader = this.quill.getModule("imageUploader");

        let index = 0;
        [...this.quill.container.querySelectorAll("img")].forEach(el => {
          const src = el.getAttribute("src");

          if (/^file:\/\/[\s\S]+/.test(src!)) {
            const image = e.data[index];
            uploader.uploadImage(
              image.base64,
              url => el.setAttribute("src", url),
              () => {
                el.parentNode!.removeChild(el);
              }
            );

            index++;
          }
        });
        worker.terminate();
      };
      worker.onerror = e => {
        console.log(e);
        worker.terminate();
      };
    } catch (e) {
      console.log(e);
    }
  }
}

const Module = QlQuill.import("core/module");
const Delta = QlQuill.import("delta");

class PasteFromWord extends Module {
  static register() {
    QlQuill.register({ "modules/clipboard": Clipboard }, true);
  }

  constructor(quill: QlQuill, options: any) {
    super(quill, options);

    const clipboard = quill.getModule("clipboard");

    clipboard.addMatcher("V\\:SHAPETYPE", (node, delta) => new Delta());
  }
}

function pt2Px(string: string) {
  let number: number = Number(string.match(/[0-9]+(\.?[0-9]+)?/)?.[0]);
  if (string.indexOf("pt") !== -1) number = (number / 72) * 96;
  return String(number);
}

export default PasteFromWord;
