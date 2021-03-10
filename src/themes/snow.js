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
    this.rgbContainer = this.root.querySelector(".ql-color-rgb");
    this.standardContainer = this.root.querySelector(".ql-color-standard");

    this.initPicker();
    this.buildSelect(this.constructor.STANDARD_COLORS);

    this.position(buttonContainer);

    this.setColor();
    this.listen();
  }

  initPicker() {
    const picker = this.root.querySelector(".ql-color-picker");

    this.instance = new MoColorPicker(picker, {
      format: "hex",
      change: color => this.updateColor(color, true),
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
    this.standardContainer.addEventListener(
      "mouseover",
      e => {
        const { color } = e.target.dataset;

        if (color) {
          this.updateColor(color);
          this.instance.setValue(color);
        }
      },
      true
    );

    this.standardContainer.addEventListener(
      "click",
      e => {
        const { color } = e.target.dataset;

        color && this.setColor(color);
      },
      true
    );

    this.standardContainer.addEventListener(
      "mouseout",
      () => {
        const previewColor = this.instance.getValue();

        previewColor !== this.color && this.setColor(this.color);
      },
      true
    );

    this.root
      .querySelector(".ql-color-button-confrim")
      .addEventListener("click", () => this.save());

    this.root
      .querySelector(".ql-color-button-default")
      .addEventListener("click", () => this.setColor());

    this.quill.on("selection-change", range => {
      if (range == null) return;
      this.hide();
    });
  }

  edit(color) {
    this.show();
    this.setColor(color);
  }

  position(container) {
    this.root.style.left = container.offsetLeft + "px";
  }

  setColor(color = this.constructor.DEFAULT_COLOR) {
    this.updateColor(color, true);

    this.instance.setValue(color);
  }

  updateColor(color, change = false) {
    this.block.style.background = color;

    const [r, g, b] = hex2rgb(color);

    this.rgbContainer.innerHTML = `
      <span>R: ${r}</span>
      <span>G: ${g}</span>
      <span>B: ${b}</span>
    `;

    if (change) {
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
  '<div>',
  "  <span>标准颜色</span>",
  '  <div class="ql-color-standard"></div>',
  '  <div class="ql-color-picker"></div>',
  "</div>",
  '<div class="ql-color-confrim">',
  '  <div class="ql-color-button">',
  '    <button type="button" class="ql-btn ql-btn-primary ql-color-button-confrim">确定</button>',
  '    <button type="button" class="ql-btn ql-color-button-default">恢复默认</button>',
  "  </div>",
  '  <div class="ql-color-preview">',
  '    <div class="ql-color-rgb"></div>',
  '    <div class="ql-color-block"></div>',
  "  </div>",
  "</div>",
].join("");

/**
 * @desc hex转rgb
 * @param {String} color hex格式字符串
 * @returns {Array} [r, g, b]
 */
function hex2rgb(color) {
  color = color.replace(/^#/, "");
  if (color.length === 3) {
    const colors = [];
    for (let i = 0; i < 3; i++) {
      colors.push(color[i], color[i]);
    }
    color = colors.join("");
  }

  const r = parseInt([color[0], color[1]].join(""), 16);
  const g = parseInt([color[2], color[3]].join(""), 16);
  const b = parseInt([color[4], color[5]].join(""), 16);

  return [r, g, b];
}

export default SnowTheme;
