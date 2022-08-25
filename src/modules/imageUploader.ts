import Quill from "quill";
import type { DeltaStatic } from "quill";

import loadingIcon from "@icons/loading.svg";

const Module = Quill.import("core/module");

interface ImageOptions {
  /** 图片上传accept */
  accept?: string;
  /** 是否自动上传粘贴的base64图片 */
  base64AutoUpload?: boolean;
  /** 剪贴板中的图片回调 */
  clipboard?(node: HTMLElement, delta: DeltaStatic): DeltaStatic;
  /** 是否开启拖拽上传  */
  drop?: boolean;
  /** 文件上传时触发 */
  action?(file: FileLike, resolce: (file: string) => void, reject: () => void): void;
}

export default class ImageUploader extends Module {
  options!: () => void | ImageOptions;

  static insertImage(this: Quill, src: string, latex?: string) {
    const range = this.getSelection(true);
    this.deleteText(range);
    this.insertEmbed(range.index, "image", {
      src,
      "data-latex": latex,
    });
    this.setSelection(range.index + 1);
  }

  constructor(quill: Quill, options: () => void | ImageOptions) {
    super(quill, options);

    const toolbar = this.quill.getModule("toolbar");
    toolbar.addHandler("image", this.handlerImage);

    if (typeof options === "function") return;

    const { clipboard, base64AutoUpload, drop } = options as ImageOptions;

    if (clipboard || base64AutoUpload) {
      this.quill.clipboard.addMatcher("IMG", (node, delta) => {
        delta = clipboard?.(node, delta) || delta;

        if (!base64AutoUpload) return delta;

        const isBase64 = /^data:image/.test(node.src);
        if (isBase64) {
          const Delta = Quill.import("delta");
          const alt = "loading-" + Date.now();

          this.uploadImage(
            node.src,
            url => {
              if (node.src === url) return;

              const image = this.quill.root.querySelector(`[alt=${alt}]`);

              if (image) {
                image.setAttribute("src", url);
                image.removeAttribute("alt");
              }
            },
            () => {
              const image = this.quill.root.querySelector(`[alt=${alt}]`);

              image?.parentNode?.removeChild(image);
            }
          );

          delta = new Delta().insert(
            { image: loadingIcon },
            {
              alt,
            }
          );
        }

        return delta;
      });
    }

    drop && this.quill.root.addEventListener("drop", this.handleDrop, false);
  }

  uploadImage(file: string | FileLike, onSuccess?: (file: string) => void, onError = () => {}) {
    if (typeof this.options === "function") return;

    const { action } = this.options as ImageOptions;

    const insertImage = (src: string) => {
      ImageUploader.insertImage.call(this.quill, src);
    };
    const successCb = onSuccess || insertImage;

    const isBase64 = typeof file === "string" && /^data:image\/.+;base64/.test(file);

    if (typeof action === "function") {
      if (isBase64) file = dataURLtoFile(file as string);
      action(file as FileLike, successCb, onError);
      return;
    }

    if (isBase64) return successCb(file as string);
    const fr = new FileReader();
    fr.onload = e => successCb(fr.result as string);
    fr.readAsDataURL(file as Blob);
  }

  handlerImage = () => {
    if (typeof this.options === "function") {
      this.options();
      return;
    }

    const { accept } = this.options as ImageOptions;

    const toolbar = this.quill.getModule("toolbar");

    let input = toolbar.container.querySelector("input.ql-image[type=file]");
    if (input == null) {
      input = document.createElement("input");
      input.setAttribute("type", "file");
      input.setAttribute("accept", accept || "image/png, image/gif, image/jpeg, image/bmp, image/x-icon");
      input.classList.add("ql-image");
      input.addEventListener("change", () => {
        if (input.files != null && input.files[0] != null) {
          this.uploadImage(input.files[0]);
          input.value = "";
        }
      });
      toolbar.container.appendChild(input);
    }
    input.click();
  };

  handleDrop = (e: DragEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (e.dataTransfer?.files?.length) {
      const selection = document.getSelection();
      if (document.caretRangeFromPoint) {
        const range = document.caretRangeFromPoint(e.clientX, e.clientY);
        if (selection && range) {
          selection.setBaseAndExtent(range.startContainer, range.startOffset, range.startContainer, range.startOffset);
        }
      } else {
        const range = document.caretPositionFromPoint(e.clientX, e.clientY);
        if (selection && range) {
          selection.setBaseAndExtent(range.offsetNode, range.offset, range.offsetNode, range.offset);
        }
      }

      const file = e.dataTransfer.files[0];

      setTimeout(() => this.uploadImage(file));
    }
  };
}

interface FileLike extends Blob {
  name: string;
  lastModified: number;
}

function dataURLtoFile(dataurl: string, filename?: string): FileLike {
  const arr = dataurl.split(","),
    mime = arr[0]!.match(/:(.*?);/)![1],
    bstr = atob(arr[1]);

  let n = bstr.length,
    u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }

  const file = new Blob([u8arr], { type: mime }) as FileLike;
  file.lastModified = Date.now();
  file.name = filename || "base642image" + Date.now() + "." + mime.replace(/image\//, "");

  return file;
}
