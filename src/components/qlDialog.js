class QlDialog {
  constructor(options) {
    const root = document.querySelector(".ql-dialog-root");

    if (!root || !root.parentElement) {
      this.createContainer(options);
    } else {
      this.container = root.parentElement;
    }

    this.setOptions(options);
    this.registerListener(options);

    this.mask = this.container.querySelector(".ql-dialog-mask");
    this.wrap = this.container.querySelector(".ql-dialog-wrap");

    this.show();
  }

  createContainer() {
    this.container = document.createElement("div");

    const dialogTemp = `
      <div class="ql-dialog-root">
        <div class="ql-dialog-mask"></div>
        <div tabindex="-1" class="ql-dialog-wrap">
          <div class="ql-dialog">
            <div tabindex="0" style="width: 0px; height: 0px; overflow: hidden; outline: none;"></div>
            <div class="ql-dialog-content">
              <button type="button" class="ql-dialog-close">
                <span class="ql-dialog-close-x">
                  <span role="img" class="ql-anticon">
                    <svg viewBox="64 64 896 896" focusable="false" width="1em" height="1em" fill="currentColor">
                      <path d="M563.8 512l262.5-312.9c4.4-5.2.7-13.1-6.1-13.1h-79.8c-4.7 0-9.2 2.1-12.3 5.7L511.6 449.8 295.1 191.7c-3-3.6-7.5-5.7-12.3-5.7H203c-6.8 0-10.5 7.9-6.1 13.1L459.4 512 196.9 824.9A7.95 7.95 0 00203 838h79.8c4.7 0 9.2-2.1 12.3-5.7l216.5-258.1 216.5 258.1c3 3.6 7.5 5.7 12.3 5.7h79.8c6.8 0 10.5-7.9 6.1-13.1L563.8 512z"></path>
                    </svg>
                  </span>
                </span>
              </button>
              <div class="ql-dialog-header">
                <div class="ql-dialog-title"></div>
              </div>
              <div class="ql-dialog-body" style="padding-top: 0px;"></div>
              <div class="ql-dialog-footer">
                <button type="button" class="ql-btn ql-dialog-cancel"><span>取消</span></button>
                <button type="button" class="ql-btn ql-btn-primary ql-dialog-confrim"><span>确定</span></button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    this.container.innerHTML = dialogTemp;

    document.body.appendChild(this.container);
  }

  setOptions(options) {
    this.setTitle(options);

    this.renderBody(options);

    this.setBounds(options);
  }

  renderBody(options) {
    this.body = this.container.querySelector(".ql-dialog-body");

    this.body.innerHTML = options.content || "";
  }

  setTitle(options) {
    this.container.querySelector(".ql-dialog-title").innerText =
      options.title || "";
  }

  setBounds(options) {
    const width = Number(options.width) || "";
    const height = Number(options.height) || "";

    this.body.style.width = width ? `${width}px` : "";
    this.body.style.height = height ? `${height}px` : "";
  }

  registerListener(options) {
    const confrimBtn = this.container.querySelector(".ql-dialog-confrim");
    confrimBtn.onclick = _ => {
      options.onOk && options.onOk(this.body);
      this.close();
    };

    const closeBtn = this.container.querySelector(".ql-dialog-close");
    const cancelBtn = this.container.querySelector(".ql-dialog-cancel");
    closeBtn.onclick = cancelBtn.onclick = _ => {
      options.onCancel && options.onCancel();
      this.close();
    };
  }

  show() {
    this.mask.classList.remove("ql-dialog-mask-hidden");
    this.wrap.style.display = "";
  }

  close() {
    this.mask.classList.add("ql-dialog-mask-hidden");
    this.wrap.style.display = "none";
  }
}

export default QlDialog;
