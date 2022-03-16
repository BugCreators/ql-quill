import Quill from "quill";
import RtfExtracter from "../worker/rtf-extracter.worker";

const BaseClipboard = Quill.import("modules/clipboard");

class Clipboard extends BaseClipboard {
  onPaste(e) {
    const pasteFromWord = this.quill.getModule("pasteFromWord");
    if (!pasteFromWord) return super.onPaste(e);

    setTimeout(() => {
      [...this.container.querySelectorAll("V\\:IMAGEDATA")].forEach(el => {
        const img = document.createElement("img");

        img.setAttribute("src", el.getAttribute("src"));
        img.setAttribute("width", pt2Px(el.parentNode.style.width));
        img.setAttribute("height", pt2Px(el.parentNode.style.height));

        el.parentNode.parentNode.replaceChild(img, el.parentNode);
      });
    });
    super.onPaste(e);

    try {
      const worker = new RtfExtracter();
      worker.postMessage(e.clipboardData.getData("text/rtf"));
      worker.onmessage = e => {
        if (!e.data.length) return;

        const uploader = this.quill.getModule("imageUploader");

        let index = 0;
        [...this.quill.container.querySelectorAll("img")].forEach(el => {
          const src = el.getAttribute("src");

          if (/^file:\/\/[\s\S]+/.test(src)) {
            const image = e.data[index];
            if (uploader) {
              uploader.uploadImage(image.base64, url =>
                el.setAttribute("src", url)
              );
            } else {
              el.setAttribute("src", image.base64);
            }

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

const Module = Quill.import("core/module");
const Delta = Quill.import("delta");

class PasteFromWord extends Module {
  static register() {
    Quill.register({ "modules/clipboard": Clipboard }, true);
  }

  constructor(quill, options) {
    super(quill, options);

    const clipboard = quill.getModule("clipboard");

    clipboard.addMatcher("V\\:SHAPETYPE", (node, delta) => new Delta());
  }
}

function pt2Px(string) {
  let number = string.match(/[0-9]+(\.?[0-9]+)?/)[0];
  if (string.indexOf("pt") !== -1) number = (number / 72) * 96;
  return number;
}

export default PasteFromWord;
