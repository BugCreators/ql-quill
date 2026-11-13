import type ClipboardType from "quill/modules/clipboard";
import Quill from "../core/quill";
import type QlQuill from "../quill";
import RtfExtracter from "../worker/rtf-extracter.worker?worker&inline";

const BaseClipboard = Quill.import("modules/clipboard") as typeof ClipboardType;

export class Clipboard extends BaseClipboard {
  declare quill: QlQuill;

  onCapturePaste(e: ClipboardEvent) {
    const pasteFromWord = this.quill.getModule("pasteFromWord");
    if (!pasteFromWord) return super.onCapturePaste(e);

    super.onCapturePaste(e);

    let worker: Worker;

    try {
      worker = new RtfExtracter();
    } catch (error) {
      console.warn("[ql-quill] 无法启动 Word 粘贴解析 worker", error);
      return;
    }

    // 无论成功失败都要释放 worker
    const finish = () => worker.terminate();

    worker.onmessage = ({ data }: MessageEvent<Array<{ base64: string }>>) => {
      finish();

      if (!data?.length) return;

      this.replaceWordImages(data);
    };

    worker.onerror = error => {
      console.warn("[ql-quill] Word 粘贴解析失败", error);
      finish();
    };

    worker.postMessage(e.clipboardData?.getData("text/rtf") || "");
  }

  /** Word 粘贴进来的是本地路径图片，按出现顺序换成上传后的地址 */
  replaceWordImages(images: Array<{ base64: string }>) {
    const uploader = this.quill.getModule("uploader");

    let index = 0;

    this.quill.container.querySelectorAll("img").forEach(el => {
      const src = el.getAttribute("src") || "";
      if (!/^file:\/\/|^\/\/:0/.test(src)) return;

      const image = images[index++];
      if (!image) return;

      uploader
        .uploadImage(image.base64)
        .then(url => el.setAttribute("src", url))
        .catch(() => el.remove());
    });
  }
}

const Module = Quill.import("core/module");

class PasteFromWord extends Module {
  static register() {
    Quill.register({ "modules/clipboard": Clipboard }, true);
  }
}

export default PasteFromWord;
