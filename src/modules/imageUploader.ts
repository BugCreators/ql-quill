import QlQuill from "../index";
import type { ImageOptions, FileLike, ImageObjOptions } from "../types";
import type { Module as ModuleType } from "../quill";

import loadingIcon from "@icons/loading.svg";

const Module = QlQuill.import("core/module");

export default class ImageUploader
  extends Module
  implements ModuleType<QlQuill, ImageOptions>
{
  declare options: ImageOptions;

  static insertImage(this: QlQuill, src: string, latex?: string) {
    const range = this.getSelection(true);
    this.deleteText(range);
    this.insertEmbed(range.index, "image", {
      src,
      "data-latex": latex,
    });
    this.setSelection(range.index + 1);
  }

  constructor(quill: QlQuill, options: ImageOptions) {
    super(quill, options);

    const toolbar = this.quill.getModule("toolbar");
    toolbar.addHandler("image", this.handlerImage);

    if (typeof options === "function") return;

    const { clipboard, base64AutoUpload, drop } = options as ImageObjOptions;

    if (clipboard || base64AutoUpload) {
      this.quill.clipboard.addMatcher("IMG", (node, delta) => {
        delta = clipboard?.(node, delta) || delta;

        if (!base64AutoUpload) return delta;

        const isBase64 = /^data:image/.test(node.src);
        if (isBase64) {
          const Delta = QlQuill.import("delta");
          const alt = "loading-" + Date.now();

          this.uploadImage(
            node.src,
            (url) => {
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

  uploadImage(
    file: string | FileLike,
    onSuccess?: (file: string) => void,
    onError = () => {}
  ) {
    if (typeof this.options === "function") return;

    const { action } = this.options as ImageObjOptions;

    const insertImage = (src: string) => {
      ImageUploader.insertImage.call(this.quill, src);
    };
    const successCb = onSuccess || insertImage;

    if (typeof action === "function") {
      if (isBase64(file)) file = dataURLtoFile(file);
      action(file, successCb, onError);
      return;
    }

    if (isBase64(file)) return successCb(file);
    const fr = new FileReader();
    fr.onload = (e) => successCb(fr.result as string);
    fr.readAsDataURL(file);
  }

  handlerImage = () => {
    if (typeof this.options === "function") {
      this.options();
      return;
    }

    const { accept } = this.options as ImageObjOptions;

    const toolbar = this.quill.getModule("toolbar");

    let input = toolbar.container.querySelector(
      "input.ql-image[type=file]"
    ) as HTMLInputElement;
    if (input == null) {
      input = document.createElement("input");
      input.setAttribute("type", "file");
      input.setAttribute(
        "accept",
        accept || "image/png, image/gif, image/jpeg, image/bmp, image/x-icon"
      );
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
          selection.setBaseAndExtent(
            range.startContainer,
            range.startOffset,
            range.startContainer,
            range.startOffset
          );
        }
      } else {
        const range = document.caretPositionFromPoint(e.clientX, e.clientY);
        if (selection && range) {
          selection.setBaseAndExtent(
            range.offsetNode,
            range.offset,
            range.offsetNode,
            range.offset
          );
        }
      }

      const file = e.dataTransfer.files[0];

      setTimeout(() => this.uploadImage(file));
    }
  };
}

function isBase64(file: any): file is string {
  return typeof file === "string" && /^data:image\/.+;base64/.test(file);
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
  file.name =
    filename || "base642image" + Date.now() + "." + mime.replace(/image\//, "");

  return file;
}
