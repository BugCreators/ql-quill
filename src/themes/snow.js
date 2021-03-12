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

    this.root.classList.add("ql-color-tooltip");

    this.block = this.root.querySelector(".ql-color-block");
    this.inputContainer = this.root.querySelector(".ql-color-inputs");
    this.standardContainer = this.root.querySelector(".ql-color-standard");

    this.initPicker();
    this.buildSelect(this.constructor.STANDARD_COLORS);

    this.position(buttonContainer);

    this.inputs = [
      new RGBInput(this.inputContainer, "r"),
      new RGBInput(this.inputContainer, "g"),
      new RGBInput(this.inputContainer, "b"),
    ];

    this.updateColor();
    this.listen();
  }

  initPicker() {
    const picker = this.root.querySelector(".ql-color-picker");

    this.instance = new MoColorPicker(picker, {
      format: "hex",
      change: color => this.updateColor(color, this.constructor.COLOR_PICK),
    });
  }

  buildSelect(colors) {
    let html = "";

    colors.forEach(color => {
      html += `<span class="ql-color-item" style="background: ${color}" data-color="${color}"></span>`;
    });

    this.standardContainer.innerHTML = html;
  }

  show() {
    super.show();

    this.quill.blur();
  }

  listen() {
    const { COLOR_SELECT_HOVER, COLOR_SELECT, COLOR_INPUT } = this.constructor;

    this.standardContainer.addEventListener(
      "mouseover",
      e => {
        const { color } = e.target.dataset;

        color && this.updateColor(color, COLOR_SELECT_HOVER);
      },
      true
    );

    this.standardContainer.addEventListener(
      "click",
      e => {
        const { color } = e.target.dataset;

        color && this.updateColor(color, COLOR_SELECT);
      },
      true
    );

    this.standardContainer.addEventListener(
      "mouseout",
      () => {
        const previewColor = this.instance.getValue();

        previewColor !== this.color &&
          this.updateColor(this.color, COLOR_SELECT_HOVER);
      },
      true
    );

    this.inputContainer.addEventListener("change", () => {
      const colors = this.inputs.map(input => input.value);

      this.updateColor(MoColorPicker.rgb2hex(...colors), COLOR_INPUT);
    });

    this.root
      .querySelector(".ql-color-confrim")
      .addEventListener("click", () => this.save());

    this.root
      .querySelector(".ql-color-default")
      .addEventListener("click", () => this.updateColor());

    this.quill.on("selection-change", range => {
      if (range == null) return;
      this.hide();
    });
  }

  edit(color) {
    this.show();
    this.updateColor(color, this.constructor.COLOR_SET);
  }

  position(container) {
    this.root.style.left =
      container.offsetLeft - container.parentElement.offsetLeft + "px";
  }

  updateColor(color, from = "") {
    const {
      DEFAULT_COLOR,
      COLOR_INPUT,
      COLOR_PICK,
      COLOR_SELECT_HOVER,
    } = this.constructor;

    color = color || DEFAULT_COLOR;

    this.block.style.background = color;

    if (from !== COLOR_INPUT) {
      const colors = MoColorPicker.hex2rgb(color);

      this.inputs.forEach(input => {
        input.setValue(colors[input.key.toLocaleLowerCase()]);
      });
    }

    if (from !== COLOR_PICK) {
      this.instance.setValue(color);
    }

    if (from !== COLOR_SELECT_HOVER) {
      this.color = color;
    }
  }

  save() {
    this.quill.format(
      "color",
      this.color === this.constructor.DEFAULT_COLOR ? false : this.color,
      Quill.sources.USER
    );
    this.hide();
  }
}

ColorPicker.COLOR_SET = "SET";
ColorPicker.COLOR_PICK = "PICK";
ColorPicker.COLOR_INPUT = "INPUT";
ColorPicker.COLOR_SELECT = "SELECT";
ColorPicker.COLOR_SELECT_HOVER = "SELECT_HOVER";

ColorPicker.STANDARD_COLORS = [
  "#c00000",
  "#ff0000",
  "#ffc000",
  "#ffff00",
  "#92d050",
  "#00b050",
  "#00b0f0",
  "#0070c0",
  "#002060",
  "#7030a0",
];

ColorPicker.DEFAULT_COLOR = "#333333";

ColorPicker.TEMPLATE = [
  "<div>",
  "  <span>标准颜色</span>",
  '  <div class="ql-color-standard"></div>',
  '  <div class="ql-color-picker"></div>',
  "</div>",
  '<div class="ql-color-operate">',
  '  <button type="button" class="ql-btn ql-btn-primary ql-color-confrim">确定</button>',
  '  <button type="button" class="ql-btn ql-color-default">恢复默认</button>',
  '  <div class="ql-color-inputs"></div>',
  '  <div class="ql-color-block"></div>',
  "</div>",
].join("");

class RGBInput {
  constructor(container, key, value) {
    this.MAX = 255;
    this.MIN = 0;

    this.container = container;
    this.key = key;
    this.value = value;

    this.input = this.initInput();

    this.listen();
  }

  initInput() {
    const span = document.createElement("span");
    const input = document.createElement("input");
    input.setAttribute("type", "number");
    input.setAttribute("max", this.MAX);
    input.setAttribute("min", this.MIN);
    input.dataset.key = this.key;
    input.value = this.value;

    span.appendChild(new Text(this.key.toLocaleUpperCase()));
    span.appendChild(input);

    this.container.appendChild(span);

    return input;
  }

  setValue(value) {
    this.input.value = value;
    this.value = value;
  }

  listen() {
    this.input.addEventListener("change", e => {
      const { valueAsNumber } = e.target;

      if (valueAsNumber > this.MAX) {
        this.setValue(this.MAX);
        return;
      } else if (valueAsNumber < this.MIN) {
        this.setValue(this.MIN);
        return;
      }

      this.value = valueAsNumber;
    });
  }
}

export default SnowTheme;
