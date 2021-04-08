import closeIcon from "@icons/close.svg";

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

    this.container.innerHTML = this.constructor.TEMPLATE;

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

    const dialog = this.container.querySelector(".ql-dialog");

    dialog.style.width = width ? `${width}px` : "";
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

QlDialog.TEMPLATE = [
  '<div class="ql-dialog-root">',
  '  <div class="ql-dialog-mask"></div>',
  '  <div tabindex="-1" class="ql-dialog-wrap">',
  '    <div class="ql-dialog">',
  '      <div tabindex="0" style="width: 0px; height: 0px; overflow: hidden; outline: none;"></div>',
  '      <div class="ql-dialog-content">',
  '        <button type="button" class="ql-dialog-close">',
  '          <span class="ql-dialog-close-x">',
  '            <span role="img" class="ql-anticon">',
                 closeIcon,
  "            </span>",
  "          </span>",
  "        </button>",
  '        <div class="ql-dialog-header">',
  '          <div class="ql-dialog-title"></div>',
  "        </div>",
  '        <div class="ql-dialog-body" style="padding-top: 0px;"></div>',
  '        <div class="ql-dialog-footer">',
  '         <button type="button" class="ql-btn ql-dialog-cancel"><span>取消</span></button>',
  '         <button type="button" class="ql-btn ql-btn-primary ql-dialog-confrim"><span>确定</span></button>',
  "        </div>",
  "      </div>",
  "    </div>",
  "  </div>",
  "</div>",
].join("");

export default QlDialog;
