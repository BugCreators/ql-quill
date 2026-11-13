import type QlQuill from "../quill";
import closeIcon from "@icons/close.svg?raw";
import type { LocaleInstance } from "./locale";

interface DialogOptions {
  content?: string;
  contentElement?: Element;
  title?: string;
  width?: number;
  onOk?(close: () => void): void;
  beforeClose?(): void;
  onCancel?(): void;
}

/** 类名集中在这里，模板与查询复用同一份，避免字符串写错 */
const CLASS_NAMES = {
  container: "ql-dialog-root",
  mask: "ql-dialog-mask",
  content: "ql-dialog",
  closeBtn: "ql-dialog-close",
  title: "ql-dialog-title",
  body: "ql-dialog-body",
  cancelBtn: "ql-dialog-cancel",
  confirmBtn: "ql-dialog-confrim",
} as const;

class Dialog {
  static readonly CONTAINER_CLASS_NAME = CLASS_NAMES.container;
  static readonly MASK_CLASS_NAME = CLASS_NAMES.mask;
  static readonly CONTENT_CLASS_NAME = CLASS_NAMES.content;
  static readonly CLOSE_BTN_CLASS_NAME = CLASS_NAMES.closeBtn;
  static readonly TITLE_CLASS_NAME = CLASS_NAMES.title;
  static readonly BODY_CLASS_NAME = CLASS_NAMES.body;
  static readonly CANCEL_BTN_CLASS_NAME = CLASS_NAMES.cancelBtn;
  static readonly CONFIRM_BTN_CLASS_NAME = CLASS_NAMES.confirmBtn;

  /**
   * 模板逐行定义后 trim 再拼接，标签之间不能留任何空白：
   * footer 的按钮是行内块，标签间的换行/缩进会被渲染成一个空格，使原本 8px 的间距变成 8px + 一个空格；
   * 结构里其它位置的内联空白文本节点同样会参与行盒计算，把对话框撑高、挤小。
   */
  static readonly TEMPLATE = [
    `<div class="${CLASS_NAMES.mask}"></div>`,
    `<div tabindex="-1" class="ql-dialog-wrap">`,
    `<div class="${CLASS_NAMES.content}">`,
    `<div tabindex="0" style="width: 0px; height: 0px; overflow: hidden; outline: none;"></div>`,
    `<div class="ql-dialog-content">`,
    `<button type="button" class="${CLASS_NAMES.closeBtn}">`,
    `<span class="ql-dialog-close-x">`,
    `<span role="img" class="ql-anticon">${closeIcon}</span>`,
    `</span>`,
    `</button>`,
    `<div class="ql-dialog-header">`,
    `<div class="${CLASS_NAMES.title}"></div>`,
    `</div>`,
    `<div class="${CLASS_NAMES.body}" style="padding-top: 0px;"></div>`,
    `<div class="ql-dialog-footer">`,
    `<button type="button" class="ql-btn ${CLASS_NAMES.cancelBtn}"></button>`,
    `<button type="button" class="ql-btn ql-btn-primary ${CLASS_NAMES.confirmBtn}"></button>`,
    `</div>`,
    `</div>`,
    `</div>`,
    `</div>`,
  ]
    .map(line => line.trim())
    .join("");

  quill: QlQuill;
  options: DialogOptions;
  container: HTMLElement;
  confirmBtn?: HTMLElement;

  constructor(quill: QlQuill) {
    this.quill = quill;
    this.options = {};

    const root = this.quill.container.querySelector<HTMLElement>(
      "." + Dialog.CONTAINER_CLASS_NAME,
    );

    this.container = root || this.createContainer();

    this.registerListener();
  }

  queryComponent(className: string): HTMLElement {
    return this.container.querySelector("." + className)!;
  }

  open(options: DialogOptions) {
    this.setOptions(options);

    this.show();
  }

  createContainer(): HTMLElement {
    const container = this.quill.addContainer(Dialog.CONTAINER_CLASS_NAME);
    container.style.display = "none";

    container.innerHTML = Dialog.TEMPLATE;

    return container;
  }

  setOptions(options: DialogOptions) {
    this.options = options;

    this.setTitle(options);
    this.renderBody(options);
    this.setBounds(options);

    const locale = this.quill.getModule("locale") as LocaleInstance;

    this.renderButton(Dialog.CONFIRM_BTN_CLASS_NAME, locale.$locale("确定"));
    this.renderButton(Dialog.CANCEL_BTN_CLASS_NAME, locale.$locale("取消"));
  }

  renderBody(options: DialogOptions) {
    const body = this.queryComponent(Dialog.BODY_CLASS_NAME);

    if (options.content) {
      body.innerHTML = options.content;
      return;
    }

    if (options.contentElement && !body.contains(options.contentElement)) {
      body.innerHTML = "";
      body.appendChild(options.contentElement);
    }
  }

  setTitle(options: DialogOptions) {
    this.queryComponent(Dialog.TITLE_CLASS_NAME).innerText = options.title || "";
  }

  setBounds(options: DialogOptions) {
    const width = Number(options.width) || "";

    const dialog = this.queryComponent(Dialog.CONTENT_CLASS_NAME);

    dialog.style.width = width ? `${width}px` : "";
  }

  renderButton(className: string, text: string) {
    const button = this.queryComponent(className);

    if (button.textContent === text) return;

    // 样式里有 .ql-btn > span，保留 span 包裹
    const span =
      button.querySelector("span") || button.appendChild(document.createElement("span"));

    span.textContent = text;
  }

  handleConfirm = () => {
    if (this.options.onOk) {
      this.options.onOk(this.close.bind(this));
    } else {
      this.close();
    }
  };

  handleCancel = () => {
    this.options.onCancel?.();
    this.close();
  };

  registerListener() {
    this.confirmBtn = this.queryComponent(Dialog.CONFIRM_BTN_CLASS_NAME);
    this.confirmBtn.addEventListener("click", this.handleConfirm);

    this.queryComponent(Dialog.CLOSE_BTN_CLASS_NAME).addEventListener(
      "click",
      this.handleCancel,
    );

    this.queryComponent(Dialog.CANCEL_BTN_CLASS_NAME).addEventListener(
      "click",
      this.handleCancel,
    );
  }

  disabledConfirmBtn() {
    this.confirmBtn?.setAttribute("disabled", "disabled");
  }

  enableConfirmBtn() {
    this.confirmBtn?.removeAttribute("disabled");
  }

  show() {
    this.container.style.display = "";
  }

  close() {
    this.options.beforeClose?.();
    this.container.style.display = "none";
    this.enableConfirmBtn();
  }
}

export default Dialog;
