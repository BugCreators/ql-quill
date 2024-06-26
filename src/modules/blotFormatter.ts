import BaseBlotFormatter from "quill-blot-formatter/dist/BlotFormatter";
import {
  Options,
  ImageSpec as BaseImageSpec,
  Action,
  ResizeAction as BaseResizeAction,
  DeleteAction,
  BlotSpec,
} from "quill-blot-formatter";

class FormulaEditAction extends Action {
  onFormulaEdit?(target: HTMLElement): void;

  onCreate() {
    const formula = this.formatter.quill.getModule("formula");

    if (typeof formula?.openFormulaDialog !== "function") {
      console.warn(
        "[Missing config] modules/formula onFormulaEdit function is required"
      );
      return;
    }

    this.onFormulaEdit = formula.openFormulaDialog;

    // @ts-ignore
    this.formatter.currentSpec.img.addEventListener(
      "dblclick",
      this.onOverlayDblclick
    );
  }

  onOverlayDblclick = () => {
    const target = this.formatter.currentSpec?.getTargetElement();
    if (!target?.dataset.latex) return;
    this.onFormulaEdit?.(target);

    // @ts-ignore
    this.formatter.currentSpec.img.removeEventListener(
      "dblclick",
      this.onOverlayDblclick
    );
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
  wrapper: Element;

  constructor(quill: any, options: Options) {
    super(quill, options);

    this.wrapper = document.createElement("div");
    this.wrapper.classList.add("blot-formatter__wrapper");
    this.quill.root.parentNode.appendChild(this.wrapper);

    this.scrollTop = quill.scroll.domNode.scrollTop;

    if (quill.root === quill.scroll.domNode) {
      quill.root.addEventListener("scroll", () => {
        this.overlay.style.top =
          Number(this.overlay.style.top.replace("px", "")) +
          (this.scrollTop - quill.scroll.domNode.scrollTop) +
          "px";

        this.scrollTop = quill.scroll.domNode.scrollTop;
      });
    }
  }

  onClickOutSide = (e: MouseEvent) => {
    if (!this.quill.container.contains(e.target)) {
      this.hide();
    }
  }

  show(spec: BlotSpec) {
    super.show(spec);

    this.quill.root.parentNode.removeChild(this.overlay);
    this.wrapper.appendChild(this.overlay);

    window.addEventListener("click", this.onClickOutSide);
  }

  hide() {
    if (!this.currentSpec) {
      return;
    }

    this.currentSpec.onHide();
    this.currentSpec = undefined;
    this.wrapper.removeChild(this.overlay);
    this.overlay.style.setProperty("display", "none");
    this.setUserSelect("");
    this.destroyActions();

    window.removeEventListener("click", this.onClickOutSide);
  }
}

export default BlotFormatter;
