import BaseBlotFormatter from "quill-blot-formatter/dist/BlotFormatter";
import {
  Options,
  ImageSpec as BaseImageSpec,
  Action,
  ResizeAction as BaseResizeAction,
  DeleteAction,
} from "quill-blot-formatter";

class FormulaEditAction extends Action {
  overlay?: HTMLElement;
  onFormulaEdit?(target: HTMLElement): void;
  createTime?: number;
  timer?: number;

  onCreate() {
    this.overlay = this.formatter.overlay;

    const formula = this.formatter.quill.getModule("formula");

    if (typeof formula?.openFormulaDialog !== "function") {
      console.warn(
        "[Missing config] modules/formula onFormulaEdit function is required"
      );
      return;
    }

    this.onFormulaEdit = formula.openFormulaDialog;

    this.createTime = new Date().getTime();
    // 两次单击的间隔时间
    this.timer = 500;

    this.overlay.addEventListener("click", this.onOverlayClick);
    this.overlay.addEventListener("dblclick", this.onOverlayDblclick);
  }

  // 单击图片后再单击overlay 通过时间间隔长短模拟双击事件
  onOverlayClick = () => {
    const target = this.formatter.currentSpec?.getTargetElement();
    if (!target?.dataset.latex || !this.timer) return;

    const time = new Date().getTime();
    if (time - this.createTime! < this.timer) this.onFormulaEdit?.(target);
    this.timer = 0;
  };

  onOverlayDblclick = () => {
    const target = this.formatter.currentSpec?.getTargetElement();
    if (!target?.dataset.latex) return;
    this.onFormulaEdit?.(target);
  };
}

class ResizeAction extends BaseResizeAction {
  constructor(formatter: BaseBlotFormatter) {
    super(formatter);
  }

  createHandle(position: string, cursor: string) {
    const box = super.createHandle(position, cursor);

    box.addEventListener("touchstart", (e) => this.onTouchStart(e));

    return box;
  }

  onTouchStart = (e: TouchEvent) => {
    this.dragHandle = e.target as HTMLElement;
    this.setCursor(this.dragHandle.style.cursor);

    const target = this.formatter.currentSpec?.getTargetElement();
    if (!target) return;

    const rect = target.getBoundingClientRect();

    this.dragStartX = e.touches[0].clientX;
    this.preDragWidth = rect.width;
    this.targetRatio = rect.height / rect.width;

    document.addEventListener("touchmove", this.onTouchMove);
    document.addEventListener("touchend", this.onTouchEnd);
  };

  onTouchMove = (e: TouchEvent) => {
    // @ts-ignore
    this.onDrag(e.touches[0]);
  };

  onTouchEnd = () => {
    this.setCursor("");
    document.removeEventListener("touchmove", this.onTouchMove);
    document.removeEventListener("touchend", this.onTouchEnd);
  };
}

class DisplaySizeAction extends Action {
  display?: HTMLElement;

  onCreate() {
    this.display = document.createElement("div");

    Object.assign(this.display.style, {
      position: "absolute",
      font: "12px/1.0 Arial, Helvetica, sans-serif",
      padding: "4px 8px",
      textAlign: "center",
      backgroundColor: "white",
      color: "#333",
      border: "1px solid #777",
      boxSizing: "border-box",
      opacity: "0.80",
      cursor: "default",
    } as CSSStyleDeclaration);

    this.formatter.overlay.appendChild(this.display);
    this.position();
  }

  onUpdate() {
    const target = this.formatter.currentSpec?.getTargetElement();
    if (!this.display || !target) return;

    this.position();
  }

  onDestroy() {
    this.formatter.overlay.removeChild(this.display!);
  }

  position() {
    if (!this.display) return;

    const size = this.getCurrentSize();
    this.display.innerHTML = size.join(" &times; ");
    if (size[0] > 120 && size[1] > 30) {
      // position on top of image
      Object.assign(this.display.style, {
        right: "4px",
        bottom: "4px",
        left: "auto",
      } as CSSStyleDeclaration);
    } else {
      // position off bottom right
      const dispRect = this.display.getBoundingClientRect();
      Object.assign(this.display.style, {
        right: `-${dispRect.width + 4}px`,
        bottom: `-${dispRect.height + 4}px`,
        left: "auto",
      } as CSSStyleDeclaration);
    }
  }

  getCurrentSize(): [number, number] {
    const target =
      this.formatter.currentSpec!.getTargetElement()! as HTMLElement & {
        width: number;
        naturalWidth: number;
        naturalHeight: number;
      };

    return [
      target.width,
      Math.round((target.width / target.naturalWidth) * target.naturalHeight),
    ];
  }
}

export class ImageSpec extends BaseImageSpec {
  init() {
    super.init();

    window.addEventListener("click", (e) => {
      if (!this.formatter.quill.container.contains(e.target)) {
        this.formatter.hide();
      }
    });
  }

  getActions() {
    return [
      this.formatter.options.resizable && ResizeAction,
      this.formatter.options.resizable && DisplaySizeAction,
      DeleteAction,
      FormulaEditAction,
    ].filter(Boolean) as Array<typeof Action>;
  }
}

class BlotFormatter extends BaseBlotFormatter {
  scrollTop: number;

  constructor(quill: any, options: Options) {
    super(quill, options);

    this.scrollTop = quill.scrollingContainer.scrollTop;

    if (quill.root === quill.scrollingContainer) {
      quill.root.addEventListener("scroll", () => {
        this.overlay.style.top =
          Number(this.overlay.style.top.replace("px", "")) +
          (this.scrollTop - quill.scrollingContainer.scrollTop) +
          "px";

        this.scrollTop = quill.scrollingContainer.scrollTop;
      });
    }
  }
}

export default BlotFormatter;
