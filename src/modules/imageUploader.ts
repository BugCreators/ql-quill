import Uploader from "quill/modules/uploader";
import type Quill from "quill";
import type QlQuill from "../quill";
import type { ImageObjOptions } from "../types";

import loadingIcon from "@icons/loading.svg";
import { Delta } from "quill/core";
import type { Range } from "quill/core/selection";
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
      // base64 / blob: 先转成 File，交给业务方的上传逻辑
      const target = isBlobUrl(file)
        ? await blobURLtoFile(file)
        : isBase64(file)
        ? dataURLtoFile(file)
        : file;

      return new Promise<string>((resolve, reject) => {
        action(target, resolve, reject);
      });
    }

    // 没有配置上传逻辑：base64 直接插入，其余读成 dataURL
    if (isBase64(file)) {
      ImageUploader.insertImage.call(this.quill, file, {});

      return file;
    }

    return new Promise<string>((resolve, reject) => {
      const fr = new FileReader();
      fr.onload = () => resolve(fr.result as string);
      fr.onerror = () => reject(fr.error);
      fr.readAsDataURL(file as File);
    });
  }
}

ImageUploader.DEFAULTS.handler = function (
  this: { quill: Quill },
  range: Range,
  files: File[],
) {
  const uploader = this as unknown as ImageUploader;

  Promise.all(files.map(file => uploader.uploadImage(file))).then(images => {
    const update = images.reduce(
      (delta: Delta, image: string) => delta.insert({ image }),
      new Delta().retain(range.index).delete(range.length),
    );

    uploader.quill.updateContents(update, Emitter.sources.USER);
    uploader.quill.setSelection(
      range.index + images.length,
      Emitter.sources.SILENT,
    );
  });
};

function isBase64(file: unknown): file is string {
  return typeof file === "string" && /^data:image\/.+;base64/.test(file);
}

function isBlobUrl(file: unknown): file is string {
  return typeof file === "string" && /^blob:/.test(file);
}

function dataURLtoFile(dataurl: string, filename?: string) {
  const [header, body] = dataurl.split(",");
  const mime = /:(.*?);/.exec(header)?.[1] || "image/png";
  const binary = atob(body);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  return new File(
    [bytes],
    filename || `base64ToFile-${Date.now()}.${mime.replace("image/", "")}`,
    { type: mime },
  );
}

async function blobURLtoFile(url: string, filename?: string) {
  const blob = await fetch(url).then(res => res.blob());

  return new File(
    [blob],
    filename || `base64ToImage-${Date.now()}.${blob.type.replace("image/", "")}`,
  );
}
