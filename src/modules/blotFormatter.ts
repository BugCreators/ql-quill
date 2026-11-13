import BaseBlotFormatter from "@enzedonline/quill-blot-formatter2";
import {
  Action,
  BlotSpec,
  DeleteAction,
  ImageSpec as BaseImageSpec,
  ResizeAction as BaseResizeAction,
} from "@enzedonline/quill-blot-formatter2";

/** 基类里未公开的成员，集中在这里声明，避免到处 as any */
interface BlotFormatterInternals extends BaseBlotFormatter {
  _updateSizeInfo(width: number, height: number): void;
  _showSizeInfo(): void;
  _target?: HTMLImageElement;
}

/** 公式图片：双击 overlay 重新打开公式编辑器 */
class FormulaEditAction extends Action {
  onFormulaEdit?: (target: HTMLElement) => void;

  onCreate = () => {
    const formula = this.formatter.quill.getModule("formula");

    if (typeof formula?.openFormulaDialog !== "function") {
      console.warn(
        "[Missing config] modules/formula onFormulaEdit function is required",
      );
      return;
    }

    this.onFormulaEdit = formula.openFormulaDialog;

    this.getTargetImage()?.addEventListener("dblclick", this.onOverlayDblclick);
  };

  onOverlayDblclick = () => {
    const target = this.formatter.currentSpec?.getTargetElement();
    if (!target?.dataset.latex) return;

    this.onFormulaEdit?.(target);
    this.getTargetImage()?.removeEventListener(
      "dblclick",
      this.onOverlayDblclick,
    );
  };

  getTargetImage() {
    const spec = this.formatter.currentSpec as
      | (BlotSpec & { img?: HTMLImageElement })
      | null
      | undefined;

    return spec?.img;
  }
}

class ResizeAction extends BaseResizeAction {
  constructor(formatter: BaseBlotFormatter) {
    super(formatter);

    const internals = this as unknown as BlotFormatterInternals;

    const originalUpdateSizeInfo = internals._updateSizeInfo;
    const updateSizeInfo = (width: number, height: number) => {
      originalUpdateSizeInfo(width, height);

      this.position();
    };
    internals._updateSizeInfo = updateSizeInfo;

    const originalCreate = this.onCreate;
    this.onCreate = () => {
      originalCreate();

      const img = internals._target;
      const width = img?.getAttribute("width");
      const height = img?.getAttribute("height");

      if (img && width && height && width !== "auto" && height !== "auto") {
        updateSizeInfo(+width, +height);
      } else {
        internals._showSizeInfo();
      }
    };
  }

  position() {
    if (!this.formatter) return;

    const size = this.getCurrentSize();
    if (size[0] > 120 && size[1] > 30) {
      // 空间够就贴在图片内部右下角
      Object.assign(this.formatter.sizeInfo.style, {
        right: "4px",
        bottom: "4px",
        left: "auto",
      } as CSSStyleDeclaration);
    } else {
      // 图片太小时移到右下角外侧，避免遮挡
      const dispRect = this.formatter.sizeInfo.getBoundingClientRect();
      Object.assign(this.formatter.sizeInfo.style, {
        right: `-${dispRect.width + 4}px`,
        bottom: `-${dispRect.height + 4}px`,
        left: "auto",
      } as CSSStyleDeclaration);
    }
  }

  getCurrentSize(): [number, number] {
    const target = this.formatter.currentSpec?.getTargetElement() as
      | (HTMLElement & {
          width: number;
          naturalWidth: number;
          naturalHeight: number;
        })
      | null;

    if (!target) return [0, 0];

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

/** blotFormatter2 的模块配置，缩放能力由 options.imageResize 决定 */
export function createBlotFormatterOptions(imageResize?: boolean) {
  return {
    overlay: {
      sizeInfoStyle: {
        top: undefined,
        transform: undefined,
        font: "12px/1.0 Arial, Helvetica, sans-serif",
        padding: "4px 8px",
        textAlign: "center",
        backgroundColor: "white",
        color: "#333",
        border: "1px solid #777",
        boxSizing: "border-box",
        opacity: "0.80",
        cursor: "default",
      },
    },
    align: {
      allowAligning: false, // default true
    },
    specs: [ImageSpec],
    image: {
      allowAltTitleEdit: false, // default true
      allowCompressor: false, // default false, enable with true
      linkOptions: {
        allowLinkEdit: false, // default true
      },
      resize: {
        allowResizing: imageResize,
      },
    },
  };
}

class BlotFormatter extends BaseBlotFormatter {
  scrollTop: number;
  wrapper: HTMLElement;

  constructor(quill: any, options: any) {
    super(quill, options);

    this.wrapper = document.createElement("div");
    this.wrapper.classList.add("blot-formatter__wrapper");
    this.quill.root.parentNode?.appendChild(this.wrapper);

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

  /** 滚动容器滚动时，overlay 是绝对定位，需要跟着补偿偏移 */
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
