import Quill from "quill";
import MoColorPicker from "@plugin/color-picker/mo.color-picker.js";

const Snow = Quill.import("themes/snow");

class SnowTheme extends Snow {
  extendToolbar(toolbar) {
    super.extendToolbar(toolbar);

    const colorButton = toolbar.container.querySelector(".ql-color");
    if (colorButton) {
      this.colorPicker = new ColorPicker(this.quill, null, colorButton);
    }
  }
}

const Tooltip = Quill.import("ui/tooltip");

class ColorPicker extends Tooltip {
  constructor(quill, boundsContainer, buttonContainer) {
    super(quill, boundsContainer, buttonContainer);

    this.buttonContainer = buttonContainer;

    this.root.classList.add("ql-color-tooltip");
    this.confrim = this.root.querySelector(".ql-btn");
    this.block = this.root.querySelector(".ql-color-block");

    this.initPicker();

    this.setValue();
    this.listen();
  }

  initPicker() {
    const picker = this.root.querySelector(".ql-color-picker");

    this.instance = new MoColorPicker(picker, {
      change: (color, colors) => {
        this.updateColor(color);
      },
    });
  }

  show() {
    super.show();

    this.quill.blur();
  }

  listen() {
    this.confrim.addEventListener("click", () => {
      this.save();
    });
    this.quill.on("selection-change", range => {
      if (range == null) return;
      this.hide();
    });
  }

  edit(color) {
    this.setValue(color);

    this.show();
    this.position();
  }

  position() {
    this.root.style.left = this.buttonContainer.offsetLeft + "px";
  }

  setValue(color = this.constructor.DEFAULT_COLOR) {
    this.updateColor(color);

    this.instance.setValue(color);
  }

  updateColor(color) {
    this.color = color;

    this.block.style.background = color;
  }

  save() {
    this.quill.format("color", this.color, Quill.sources.USER);
    this.hide();
  }
}

ColorPicker.DEFAULT_COLOR = "#333";

ColorPicker.TEMPLATE = [
  '<div class="ql-color-picker"></div>',
  '<div class="ql-color-confrim">',
  '<div class="ql-color-block"></div>',
  '<button type="button" class="ql-btn ql-btn-primary">确定</button>',
  "</div>",
].join("");

export default SnowTheme;
