import closeIcon from "@icons/close.svg?raw";

class Dialog {
  constructor(quill) {
    this.quill = quill;
    this.options = {};

    const root = this.quill.container.querySelector("." + Dialog.CONTAINER_CLASS_NAME);

    this.container = root || this.createContainer();

    this.registerListener();
  }

  queryComponent(className) {
    return this.container.querySelector("." + className);
  }

  open(options) {
    this.setOptions(options);

    this.show();
  }

  createContainer() {
    const container = this.quill.addContainer(Dialog.CONTAINER_CLASS_NAME);
    container.style.display = "none";

    container.innerHTML = Dialog.TEMPLATE;

    return container;
  }

  setOptions(options) {
    this.options = options;

    this.setTitle(options);

    this.renderBody(options);

    this.setBounds(options);

    const locale = this.quill.getModule("locale");

    this.renderButton(Dialog.CONFIRM_BTN_CLASS_NAME, locale.$locale("ok"));
    this.renderButton(Dialog.CANCEL_BTN_CLASS_NAME, locale.$locale("cancel"));
  }

  renderBody(options) {
    const body = this.queryComponent(Dialog.BODY_CLASS_NAME);

    if (options.content) {
      body.innerHTML = options.content;
      return;
    }

    if (options.contentElement && !body.contains(options.contentElement)) {
      body.innerHTML = "";
      body.appendChild(options.contentElement);
      return;
    }
  }

  setTitle(options) {
    this.queryComponent(Dialog.TITLE_CLASS_NAME).innerText = options.title || "";
  }

  setBounds(options) {
    const width = Number(options.width) || "";

    const dialog = this.queryComponent(Dialog.CONTENT_CLASS_NAME);

    dialog.style.width = width ? `${width}px` : "";
  }

  renderButton(className, text) {
    const button = this.queryComponent(className);
    button.innerHTML = `<span>${text}</span>`;
  }

  handleConfirm = () => {
    this.options.onOk ? this.options.onOk(this.close.bind(this)) : this.close();
  };

  handleCancel = () => {
    this.options.onCancel?.();
    this.close();
  };

  registerListener() {
    const confrimBtn = this.queryComponent(Dialog.CONFIRM_BTN_CLASS_NAME);
    confrimBtn.addEventListener("click", this.handleConfirm);

    const closeBtn = this.queryComponent(Dialog.CLOSE_BTN_CLASS_NAME);
    closeBtn.addEventListener("click", this.handleCancel);

    const cancelBtn = this.queryComponent(Dialog.CANCEL_BTN_CLASS_NAME);
    cancelBtn.addEventListener("click", this.handleCancel);
  }

  show() {
    this.container.style.display = "";
  }

  close() {
    this.options.beforeClose?.();
    this.container.style.display = "none";
  }
}

Dialog.CONTAINER_CLASS_NAME = "ql-dialog-root";
Dialog.MASK_CLASS_NAME = "ql-dialog-mask";
Dialog.CONTENT_CLASS_NAME = "ql-dialog";
Dialog.CLOSE_BTN_CLASS_NAME = "ql-dialog-close";
Dialog.TITLE_CLASS_NAME = "ql-dialog-title";
Dialog.BODY_CLASS_NAME = "ql-dialog-body";
Dialog.CANCEL_BTN_CLASS_NAME = "ql-dialog-cancel";
Dialog.CONFIRM_BTN_CLASS_NAME = "ql-dialog-confrim";

Dialog.TEMPLATE = [
  '<div class="' + Dialog.MASK_CLASS_NAME + '"></div>',
  '<div tabindex="-1" class="ql-dialog-wrap">',
  '  <div class="' + Dialog.CONTENT_CLASS_NAME + '">',
  '    <div tabindex="0" style="width: 0px; height: 0px; overflow: hidden; outline: none;"></div>',
  '    <div class="ql-dialog-content">',
  '      <button type="button" class="' + Dialog.CLOSE_BTN_CLASS_NAME + '">',
  '        <span class="ql-dialog-close-x">',
  '          <span role="img" class="ql-anticon">' + closeIcon + "</span>",
  "        </span>",
  "      </button>",
  '      <div class="ql-dialog-header">',
  '        <div class="' + Dialog.TITLE_CLASS_NAME + '"></div>',
  "      </div>",
  '      <div class="' + Dialog.BODY_CLASS_NAME + '" style="padding-top: 0px;"></div>',
  '      <div class="ql-dialog-footer">',
  '       <button type="button" class="ql-btn ' + Dialog.CANCEL_BTN_CLASS_NAME + '"></button>',
  '       <button type="button" class="ql-btn ql-btn-primary ' + Dialog.CONFIRM_BTN_CLASS_NAME + '"></button>',
  "      </div>",
  "    </div>",
  "  </div>",
  "</div>",
]
  .map(i => i.trim())
  .join("");

export default Dialog;
