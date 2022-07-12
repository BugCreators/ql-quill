import Quill from "quill";
import MoColorPicker from "@plugin/color-picker/mo.color-picker.es.js";

const Tooltip = Quill.import("ui/tooltip");

class ColorPicker extends Tooltip {
  constructor(quill, boundsContainer) {
    super(quill, boundsContainer);

    const toolbar = quill.getModule("toolbar");
    toolbar.addHandler("color", () => {
      const formats = quill.getFormat(quill.selection.savedRange.index);

      this.edit(formats.color);
    });

    this.root.classList.add("ql-color-tooltip");

    this.block = this.queryComponent(ColorPicker.BLOCK_CLASS_NAME);
    this.inputContainer = this.queryComponent(ColorPicker.INPUTS_CLASS_NAME);
    this.standardContainer = this.queryComponent(ColorPicker.STANDARD_CLASS_NAME);

    this.initPicker();
    this.buildSelect(this.constructor.STANDARD_COLORS);

    if (this.quill.root === this.quill.scrollingContainer) {
      this.quill.root.addEventListener("scroll", () => {
        this.root.style.top = this.quill.root.scrollTop + "px";
      });
    }

    this.position();

    this.inputs = [
      new RGBInput(this.inputContainer, "r"),
      new RGBInput(this.inputContainer, "g"),
      new RGBInput(this.inputContainer, "b"),
    ];

    this.updateColor();
    this.listen();
  }

  queryComponent(className) {
    return this.root.querySelector("." + className);
  }

  initPicker() {
    const picker = this.queryComponent(ColorPicker.PICKER_CLASS_NAME);

    this.instance = new MoColorPicker(picker, {
      format: "hex",
      change: color => this.updateColor(color, this.constructor.COLOR_PICK),
    });
  }

  buildSelect(colors) {
    this.standardContainer.innerHTML = colors.reduce((html, color) => {
      html += `<span class="ql-color-item" style="background: ${color}" data-color="${color}"></span>`;

      return html;
    }, "");
  }

  show() {
    super.show();

    const locale = this.quill.getModule("locale");

    this.renderButton(ColorPicker.CONFIRM_BTN_CLASS_NAME, locale.$locale("确定"));
    this.renderButton(ColorPicker.DEFAULT_BTN_CLASS_NAME, locale.$locale("重置"));

    this.quill.blur();
  }

  renderButton(className, text) {
    const button = this.queryComponent(className);
    if (text !== button.innerText) {
      button.innerHTML = `<span>${text}</span>`;
    }
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

        previewColor !== this.color && this.updateColor(this.color, COLOR_SELECT_HOVER);
      },
      true
    );

    this.inputContainer.addEventListener("change", () => {
      const colors = this.inputs.map(input => input.value);

      this.updateColor(MoColorPicker.rgb2hex(...colors), COLOR_INPUT);
    });

    this.queryComponent(ColorPicker.CONFIRM_BTN_CLASS_NAME).addEventListener("click", () => this.save());

    this.queryComponent(ColorPicker.DEFAULT_BTN_CLASS_NAME).addEventListener("click", () => this.updateColor());

    this.quill.on("selection-change", range => {
      if (range == null) return;
      this.hide();
    });

    const toolbar = this.quill.getModule("toolbar");

    let listener = e => {
      if (!document.body.contains(this.quill.root)) {
        return document.body.removeEventListener("click", listener);
      }

      if (
        this.root != null &&
        !this.root.contains(e.target) &&
        !toolbar.container.contains(e.target) &&
        !this.quill.hasFocus()
      ) {
        this.hide();
      }
    };
    this.quill.emitter.listenDOM("click", document.body, listener);
  }

  edit(color) {
    this.show();
    this.updateColor(color, this.constructor.COLOR_SET);
  }

  position() {
    const control = this.quill.getModule("toolbar").container.querySelector(".ql-color");

    this.root.style.left = control.offsetLeft - control.parentElement.offsetLeft + "px";
  }

  updateColor(color, from = "") {
    const { DEFAULT_COLOR, COLOR_INPUT, COLOR_PICK, COLOR_SELECT_HOVER } = this.constructor;

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
    this.quill.format("color", this.color === this.constructor.DEFAULT_COLOR ? false : this.color, Quill.sources.USER);
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

ColorPicker.STANDARD_CLASS_NAME = "ql-color-standard";
ColorPicker.PICKER_CLASS_NAME = "ql-color-picker";
ColorPicker.CONFIRM_BTN_CLASS_NAME = "ql-color-confirm";
ColorPicker.DEFAULT_BTN_CLASS_NAME = "ql-color-default";
ColorPicker.INPUTS_CLASS_NAME = "ql-color-inputs";
ColorPicker.BLOCK_CLASS_NAME = "ql-color-block";

ColorPicker.TEMPLATE = [
  "<div>",
  '  <div class="' + ColorPicker.STANDARD_CLASS_NAME + '"></div>',
  '  <div class="' + ColorPicker.PICKER_CLASS_NAME + '"></div>',
  "</div>",
  '<div class="ql-color-operate">',
  '  <button type="button" class="ql-btn ql-btn-primary ' + ColorPicker.CONFIRM_BTN_CLASS_NAME + '"></button>',
  '  <button type="button" class="ql-btn ' + ColorPicker.DEFAULT_BTN_CLASS_NAME + '"></button>',
  '  <div class="' + ColorPicker.INPUTS_CLASS_NAME + '"></div>',
  '  <div class="' + ColorPicker.BLOCK_CLASS_NAME + '"></div>',
  "</div>",
].join("");

class RGBInput {
  static max = 255;
  static min = 0;

  constructor(container, key, value) {
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
    input.setAttribute("max", this.constructor.max);
    input.setAttribute("min", this.constructor.min);
    input.dataset.key = this.key;
    input.value = this.value;

    span.innerHTML = this.key.toLocaleUpperCase();
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

      if (valueAsNumber > this.constructor.max) {
        this.setValue(this.constructor.max);
        return;
      } else if (valueAsNumber < this.constructor.min) {
        this.setValue(this.constructor.min);
        return;
      }

      this.value = valueAsNumber;
    });
  }
}

export default ColorPicker;
