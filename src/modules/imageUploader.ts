import Uploader from "quill/modules/uploader";
import QlQuill from "../index";
import type { ImageObjOptions } from "../types";

import loadingIcon from "@icons/loading.svg";
import { Delta } from "quill/core";
import Emitter from "quill/core/emitter";

export default class ImageUploader extends Uploader {
  declare options: ImageObjOptions & typeof Uploader.DEFAULTS;
  declare quill: QlQuill;

  static insertImage(
    this: QlQuill,
    src: string,
    attr?: Record<string, string | number>
  ) {
    const range = this.getSelection(true);
    this.deleteText(range);
    this.insertEmbed(range.index, "image", {
      src,
      ...attr,
    });
    this.setSelection(range.index + 1);
  }

  constructor(
    quill: QlQuill,
    options: (() => void) | (ImageObjOptions & typeof Uploader.DEFAULTS)
  ) {
    if (typeof options === "function") {
      super(quill, {});

      setTimeout(() => {
        const toolbar = this.quill.getModule("toolbar");
        toolbar.addHandler("image", options);
      });
      return;
    }

    super(quill, options);

    const { clipboard, base64AutoUpload } = options as ImageObjOptions;

    if (clipboard || base64AutoUpload) {
      this.quill.clipboard.addMatcher("IMG", (node, delta) => {
        delta = clipboard?.(node as HTMLElement, delta) || delta;

        if (!base64AutoUpload) return delta;

        if (isBase64(node.src) || isBlobUrl(node.src)) {
          const Delta = QlQuill.import("delta");
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
            })
            .catch(() => {
              const image = this.quill.root.querySelector(`[alt=${alt}]`);

              image?.parentNode?.removeChild(image);
            });

          delta = new Delta().insert(
            { image: loadingIcon },
            {
              alt,
              width,
              height,
            }
          );
        }

        return delta;
      });
    }

    this.quill.root.addEventListener("drop", this.handleDrop, false);
    this.quill.root.addEventListener("paste", this.onPaste.bind(this));
  }

  async uploadImage(file: string | File): Promise<string> {
    if (typeof this.options === "function") return "";

    const { action } = this.options as ImageObjOptions;

    if (typeof action === "function") {
      if (isBlobUrl(file)) {
        blobURLtoFile(file).then(file => {
          action(file, successCb, onError);
        });
        return;
      }

      if (isBase64(file)) file = dataURLtoFile(file);
      action(file, successCb, onError);
      return;
    }

    if (isBase64(file)) return successCb(file);
    const fr = new FileReader();
    fr.onload = e => successCb(fr.result as string);
    fr.readAsDataURL(file);
  }

      return url;
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

    const files = Array.from(e.dataTransfer?.files || []).filter(file =>
      file.type.includes("image/")
    );

    if (files?.length) {
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

      setTimeout(() => {
        files.forEach(file => {
          this.uploadImage(file);
        });
      });
    }
  };

  onPaste(e: ClipboardEvent) {
    const files = Array.from(e.clipboardData?.files || []).filter(file =>
      file.type.includes("image/")
    );

    if (files?.length) {
      files.forEach(file => {
        this.uploadImage(file);
      });

      e.preventDefault();
    }
  }
}

ImageUploader.DEFAULTS.handler = function (range, files) {
  // @ts-ignore
  Promise.all(files.map(file => this.uploadImage(file))).then(images => {
    const update = images.reduce((delta: Delta, image: string) => {
      return delta.insert({ image });
    }, new Delta().retain(range.index).delete(range.length)) as Delta;
    this.quill.updateContents(update, Emitter.sources.USER);
    this.quill.setSelection(
      range.index + images.length,
      Emitter.sources.SILENT
    );
  });
};

function isBase64(file: any): file is string {
  return typeof file === "string" && /^data:image\/.+;base64/.test(file);
}

function isBlobUrl(file: any): file is string {
  return typeof file === "string" && /^blob:/.test(file);
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

  return new File(
    [u8arr],
    filename || `base64ToFile-${Date.now()}.${mime.replace(/image\//, "")}`,
    { type: mime }
  );
}

async function blobURLtoFile(url: string, filename?: string) {
  return fetch(url)
    .then(res => res.blob())
    .then(blob => {
      return new File(
        [blob],
        filename ||
          "base642image" + Date.now() + "." + blob.type.replace(/image\//, "")
      );
    });
}

function blobURLtoFile(url: string, filename?: string): Promise<FileLike> {
  return fetch(url)
    .then(res => res.blob())
    .then(blob => {
      return Object.assign(blob, {
        lastModified: Date.now(),
        name:
          filename ||
          "base642image" + Date.now() + "." + blob.type.replace(/image\//, ""),
      });
    });
}
