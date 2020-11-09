import { BlotSpec } from "quill-blot-formatter";

class FormulaReEdit extends BlotSpec {
  constructor(formatter) {
    super(formatter);
    this.overlay = formatter.overlay;
    this.options = formatter.options;
    this.img = null;

    this.createTime = new Date().getTime();

    // 两次单击的间隔时间
    this.timer = 500;
  }

  init() {
    this.formatter.quill.root.addEventListener("click", this.onClick);

    this.overlay.addEventListener("click", this.handleOverlayClick);
    this.overlay.addEventListener("dblclick", this.handleOverlaydblclick);
  }

  onHide() {
    this.img = null;
  }

  onClick = e => {
    const el = e.target;
    if (!(el instanceof HTMLElement) || el.tagName !== "IMG") {
      return;
    }

    this.img = el;
  };

  // 单击图片后再单击overlay 通过时间间隔长短模拟双击事件
  handleOverlayClick = () => {
    if (!this.img || !this.img.dataset.latex) return;
    if (!this.timer) return;
    const time = new Date().getTime();
    if (time - this.createTime < this.timer) {
      this.options.onFormulaReEdit && this.options.onFormulaReEdit(this.img);
    }
    this.timer = 0;
  };

  handleOverlaydblclick = () => {
    if (!this.img || !this.img.dataset.latex) return;
    this.options.onFormulaReEdit && this.options.onFormulaReEdit(this.img);
  };
}

export default FormulaReEdit;
