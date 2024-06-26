import QlQuill from "../index";

const Module = QlQuill.import("core/module");

class Formula extends Module {
  iframe: HTMLIFrameElement;
  declare options: string;

  constructor(quill: QlQuill, options: string) {
    super(quill, options);
    this.iframe = this.createIframe();

    quill.getModule("toolbar").addHandler("formula", this.openFormulaDialog);
  }

  createIframe() {
    const iframe = document.createElement("iframe");
    iframe.style.border = "none";
    iframe.style.height = "400px";
    iframe.style.width = "100%";
    iframe.setAttribute("src", this.options);
    iframe.dataset.latex = "";

    return iframe;
  }

  setSrc(src: string) {
    this.iframe.setAttribute("src", src);
  }

  setLatex(latex: string) {
    this.iframe.dataset.latex = latex;
  }

  // 插入公式弹窗
  openFormulaDialog = (img?: HTMLImageElement) => {
    const isImage = img instanceof HTMLImageElement;
    const latex = isImage ? img.dataset.latex || "" : "";

    this.setLatex(latex);

    const dialog = this.quill.getModule("dialog");
    const locale = this.quill.getModule("locale");
    this.setSrc(this.options + "?locale=" + locale.$L);

    dialog.open({
      width: 980,
      title: locale.$locale("插入公式"),
      content: this.iframe.outerHTML,
      onOk: (close) => {
        if (!window.kfe) {
          close();
          return;
        }

        window.kfe.execCommand("get.image.data", (data) => {
          const sLatex = window.kfe!.execCommand<string>("get.source");

          const imageUploader = this.quill.getModule("imageUploader");

          imageUploader.uploadImage(data.img, (src: string) => {
            close();
            if (isImage) {
              img.setAttribute("src", src);
              if (sLatex) img.dataset.latex = sLatex;
              return;
            }

            this.quill.insertImage(src, sLatex);
          });
        });
      },
    });
  };
}

export default Formula;
