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

    const { clipboard, base64AutoUpload } = options;

    if (clipboard || base64AutoUpload) {
      this.quill.clipboard.addMatcher("IMG", (node, delta) => {
        delta = clipboard?.(node as HTMLElement, delta) || delta;

        if (!base64AutoUpload) return delta;

        const { src, width, height } = node as HTMLImageElement;

        if (isBase64(src) || isBlobUrl(src)) {
          const Delta = QlQuill.import("delta");
          const alt = "loading-" + Date.now();

          this.uploadImage(src)
            .then(url => {
              if (src === url) return;

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
  }

  async uploadImage(file: string | File): Promise<string> {
    if (typeof this.options === "function") return "";

    const { action } = this.options as ImageObjOptions;

    if (typeof action === "function") {
      const url = await new Promise<string>(async (resolve, reject) => {
        file = isBlobUrl(file)
          ? await blobURLtoFile(file)
          : isBase64(file)
          ? dataURLtoFile(file)
          : file;

        action(file, resolve, reject);
      });

      return url;
    }

    return new Promise((resolve, reject) => {
      if (isBase64(file)) {
        ImageUploader.insertImage.call(this.quill, file, {});
        return file;
      }

      const fr = new FileReader();
      fr.onload = e => resolve(fr.result as string);
      fr.onerror = reject;
      fr.readAsDataURL(file);
    });
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

function dataURLtoFile(dataurl: string, filename?: string) {
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
