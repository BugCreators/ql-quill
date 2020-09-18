class FormulaReEdit {
  constructor(resizer) {
    this.overlay = resizer.overlay;
    this.img = resizer.img;
    this.options = resizer.options;
    this.requestUpdate = resizer.onUpdate;

    this.latex = this.img.dataset.latex;
    this.createTime = new Date().getTime();

    // 两次单击的间隔时间
    this.timer = 500;
  }

  // 单击图片后再单击overlay 通过时间间隔长短模拟双击事件
  handleOverlayClick = () => {
    if (!this.timer) return;
    const time = new Date().getTime();
    if (time - this.createTime < this.timer) {
      this.options.onFormulaReEdit && this.options.onFormulaReEdit(this.latex);
    }
    this.timer = 0;
  };

  handleOverlaydblclick = () => {
    this.options.onFormulaReEdit && this.options.onFormulaReEdit(this.latex);
  };

  onCreate = () => {
    if (this.latex) {
      this.overlay.addEventListener("click", this.handleOverlayClick);
      this.overlay.addEventListener("dblclick", this.handleOverlaydblclick);
    }
  };

  onDestroy = () => {
    if (this.latex) {
      this.overlay.removeEventListener("click", this.handleOverlayClick);
      this.overlay.removeEventListener("dblclick", this.handleOverlaydblclick);
    }
  };

  onUpdate = () => {};
}

export default FormulaReEdit;
