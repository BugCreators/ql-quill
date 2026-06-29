import BaseBlotFormatter from "@enzedonline/quill-blot-formatter2";
import {
  Options,
  ImageSpec as BaseImageSpec,
  Action,
  ResizeAction as BaseResizeAction,
  DeleteAction,
  BlotSpec,
} from "@enzedonline/quill-blot-formatter2";

class FormulaEditAction extends Action {
  onFormulaEdit?(target: HTMLElement): void;

  onCreate = () => {
    const formula = this.formatter.quill.getModule("formula");

    if (typeof formula?.openFormulaDialog !== "function") {
      console.warn(
        "[Missing config] modules/formula onFormulaEdit function is required",
      );
      return;
    }

    this.onFormulaEdit = formula.openFormulaDialog;

    // @ts-ignore
    this.formatter.currentSpec.img.addEventListener(
      "dblclick",
      this.onOverlayDblclick,
    );
  };

  onOverlayDblclick = () => {
    const target = this.formatter.currentSpec?.getTargetElement();
    if (!target?.dataset.latex) return;
    this.onFormulaEdit?.(target);

    // @ts-ignore
    this.formatter.currentSpec.img.removeEventListener(
      "dblclick",
      this.onOverlayDblclick,
    );
  };
}

class ResizeAction extends BaseResizeAction {
  constructor(formatter: BaseBlotFormatter) {
    super(formatter);

    const originalUpdateSizeInfo = (this as any)._updateSizeInfo;
    // 使用类型断言绕过TypeScript的私有成员访问检查
    (this as any)._updateSizeInfo = (width: number, height: number) => {
      originalUpdateSizeInfo(width, height);

      this.position();
    };
  }

  position() {
    if (!this.formatter) return;

    const size = this.getCurrentSize();
    if (size[0] > 120 && size[1] > 30) {
      // position on top of image
      Object.assign(this.formatter.sizeInfo.style, {
        right: "4px",
        bottom: "4px",
        left: "auto",
      } as CSSStyleDeclaration);
    } else {
      // position off bottom right
      const dispRect = this.formatter.sizeInfo.getBoundingClientRect();
      Object.assign(this.formatter.sizeInfo.style, {
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
  getActions = () => {
    const actions: Array<Action> = [];

    if (this.formatter.options.resize.allowResizing) {
      actions.push(new ResizeAction(this.formatter));
    }
    if (this.formatter.options.delete.allowKeyboardDelete) {
      actions.push(new DeleteAction(this.formatter));
    }

    actions.push(new FormulaEditAction(this.formatter));

    return actions;
  };
}

class BlotFormatter extends BaseBlotFormatter {
  scrollTop: number;
  wrapper: HTMLElement;

  constructor(quill: any, options: Options) {
    super(quill, options);

    this.wrapper = document.createElement("div");
    this.wrapper.classList.add("blot-formatter__wrapper");
    this.quill.root.parentNode.appendChild(this.wrapper);

    this.scrollTop = quill.scroll.domNode.scrollTop;

    if (quill.root === quill.scroll.domNode) {
      quill.root.addEventListener("scroll", this.handleScroll);
    }

    const originalShow = this.show;
    this.show = (spec: BlotSpec) => {
      originalShow(spec);

      if (this.quill.container.contains(this.overlay)) {
        this.quill.container.removeChild(this.overlay);
      }
      this.wrapper.appendChild(this.overlay);
      this.handleScroll();
    };

    const originalHide = this.hide;
    this.hide = (event?: PointerEvent | null) => {
      if (this.wrapper.contains(this.overlay)) {
        this.wrapper.removeChild(this.overlay);
        this.quill.container.appendChild(this.overlay);
      }
      originalHide(event);
    };

    const originalDestroy = this.destroy;
    this.destroy = () => {
      quill.root.removeEventListener("scroll", this.handleScroll);
      originalDestroy();
    };
  }

  handleScroll = () => {
    if (!this.overlay) return;

    this.overlay.style.top =
      Number(this.overlay.style.top.replace("px", "")) +
      (this.scrollTop - this.quill.scroll.domNode.scrollTop) +
      "px";

    this.scrollTop = this.quill.scroll.domNode.scrollTop;
  };
}

export default BlotFormatter;
