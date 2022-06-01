import Quill from "quill";
import MoColorPicker from "@plugin/color-picker/mo.color-picker.es.js";

const Snow = Quill.import("themes/snow");

const DEFAULTS = {
  tool: [
    "bold", // 加粗
    "italic", // 斜体
    "underline", // 下划线
    { script: "sub" }, // 上标
    { script: "super" }, // 下标
    "clean", // 清除格式
    "image", // 插入图片
  ],
  font: [false, "serif", "monospace", "Cursive", "SimSun", "SimHei", "Microsoft-YaHei"],
  size: ["12", false, "14", "16", "18", "20", "22", "24", "26"],
};

class SnowTheme extends Snow {
  constructor(quill, options) {
    expandConfig(options.modules.toolbar, options);

    super(quill, options);
  }

  extendToolbar(toolbar) {
    super.extendToolbar(toolbar);

    if (toolbar.container.querySelector(".ql-color")) {
      this.colorPicker = new ColorPicker(this.quill, null);
    }
  }
}

function expandConfig(toolbar, options) {
  if (typeof toolbar.container === "string") return;
  if (!toolbar.container) toolbar.container = DEFAULTS.tool;

  toolbar = toolbar.container;

  const twoD = Array.isArray(toolbar[0]);
  const toolbarTemp = twoD ? toolbar : [toolbar];

  let custom = {};

  toolbarTemp.forEach(tool => {
    options.custom.forEach(t => !custom[t] && (custom[t] = tool.indexOf(t) !== -1));

    ["font", "size"].forEach(format => {
      const index = tool.indexOf(format);
      if (index !== -1) {
        const Format = Quill.import("formats/" + format);
        Format.whitelist = DEFAULTS[format];

        tool[index] = { [format]: DEFAULTS[format] };
      }
    });
  });

  for (const key in custom) !custom[key] && toolbar.push(twoD ? [key] : key);
}

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

    this.block = this.root.querySelector(".ql-color-block");
    this.inputContainer = this.root.querySelector(".ql-color-inputs");
    this.standardContainer = this.root.querySelector(".ql-color-standard");

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

  initPicker() {
    const picker = this.root.querySelector(".ql-color-picker");

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

        previewColor !== this.color && this.updateColor(this.color, COLOR_SELECT_HOVER);
      },
      true
    );

    this.inputContainer.addEventListener("change", () => {
      const colors = this.inputs.map(input => input.value);

      this.updateColor(MoColorPicker.rgb2hex(...colors), COLOR_INPUT);
    });

    this.root.querySelector(".ql-color-confrim").addEventListener("click", () => this.save());

    this.root.querySelector(".ql-color-default").addEventListener("click", () => this.updateColor());

    this.quill.on("selection-change", range => {
      if (range == null) return;
      this.hide();
    });
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

export default SnowTheme;
