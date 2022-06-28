import Quill from "quill";

import loadingIcon from "@icons/loading.svg";

export default class ImageUploader {
  static insertImage(src, latex) {
    const range = this.getSelection(true);
    this.deleteText(range);
    this.insertEmbed(range.index, "image", {
      src,
      "data-latex": latex,
    });
    this.setSelection(range.index + 1);
  }

  constructor(quill, options) {
    this.quill = quill;
    this.options = options;

    const toolbar = this.quill.getModule("toolbar");
    toolbar.addHandler("image", this.handlerImage);

    if (options.clipboard || options.base64AutoUpload) {
      this.quill.clipboard.addMatcher("IMG", (node, delta) => {
        delta = options.clipboard?.(node, delta) || delta;

        if (!options.base64AutoUpload) return delta;

        const isBase64 = /^data:image/.test(node.src);
        if (isBase64) {
          const Delta = Quill.import("delta");
          const alt = "loading-" + Date.now();

          const uploader = this.quill.getModule("imageUploader");
          uploader.uploadImage(
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

              image && image.parentNode.removeChild(image);
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

    options.drop && this.quill.root.addEventListener("drop", this.handleDrop, false);
  }

  uploadImage(file, onSuccess, onError = () => {}) {
    const insertImage = src => {
      this.constructor.insertImage.call(this.quill, src);
    };
    const successCb = onSuccess || insertImage;

    const isBase64 = typeof file === "string" && /^data:image\/.+;base64/.test(file);

    if (typeof this.options.action === "function") {
      if (isBase64) file = dataURLtoFile(file);
      this.options.action(file, successCb, onError);
      return;
    }

    if (isBase64) return successCb(file);
    const fr = new FileReader();
    fr.onload = _ => successCb(fr.result);
    fr.readAsDataURL(file);
  }

  handlerImage = () => {
    if (typeof this.options === "function") {
      this.options();
      return;
    }

    const toolbar = this.quill.getModule("toolbar");

    let input = toolbar.container.querySelector("input.ql-image[type=file]");
    if (input == null) {
      input = document.createElement("input");
      input.setAttribute("type", "file");
      input.setAttribute("accept", this.options.accept || "image/*");
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

  handleDrop = e => {
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

      setTimeout(() => this.insertImage(file));
    }
  };
}

function dataURLtoFile(dataurl, filename) {
  const arr = dataurl.split(","),
    mime = arr[0].match(/:(.*?);/)[1],
    bstr = atob(arr[1]);

  let n = bstr.length,
    u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }

  const file = new Blob([u8arr], { type: mime });
  file.lastModifiedDate = new Date();
  file.name = filename || "base642image" + Date.now() + "." + mime.replace(/image\//, "");

  return file;
}
