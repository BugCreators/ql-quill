class Toolbar {
  constructor(userConfig) {
    this.id = `toolbar-${Math.random().toString(36).slice(-8)}`;

    const config = expandConfig(userConfig);

    this.container = document.createElement("div");
    this.container.setAttribute("id", this.id);

    config.forEach(format => {
      if (typeof format === "string") {
        addButton(this.container, format);
      } else {
        const name = Object.keys(format)[0];
        const value = format[name];
        Array.isArray(value)
          ? addSelect(this.container, name, value)
          : addButton(this.container, name, value);
      }
    });
  }
}

function addButton(container, format, value) {
  let input = document.createElement("button");
  input.setAttribute("type", "button");
  input.classList.add("ql-" + format);
  if (value != null) {
    input.value = value;
  }
  container.appendChild(input);
}

function addSelect(container, format, values) {
  let input = document.createElement("select");
  input.classList.add("ql-" + format);
  values.forEach(function (value) {
    let option = document.createElement("option");
    if (value !== false) {
      option.setAttribute("value", value);
    } else {
      option.setAttribute("selected", "selected");
    }
    input.appendChild(option);
  });
  container.appendChild(input);
}

Toolbar.CUSTOM = ["import", "option", "formula", "question"];

Toolbar.DEFAULT = [
  "bold", // 加粗
  "italic", // 斜体
  "underline", // 下划线
  { script: "sub" }, // 上标
  { script: "super" }, // 下标
  "clean", // 清除格式
  "image", // 插入图片
];

Toolbar.FONT_LIST = [
  "Sans-Serif",
  "SimSun",
  "SimHei",
  "Microsoft-YaHei",
  "KaiTi",
  "FangSong",
  "Arial",
];

Toolbar.SIZE_LIST = ["12", false, "14", "16", "18", "20", "22", "24", "26"];

function expandConfig(userConfig) {
  const config = Array.isArray(userConfig.toolbar)
    ? userConfig.toolbar
    : Toolbar.DEFAULT;

  Toolbar.CUSTOM.forEach(label => {
    if (!config.includes(label) && userConfig[label]) {
      config.push(label);
    }
  });

  const fontIdx = config.indexOf("font");
  if (fontIdx !== -1) {
    config[fontIdx] = { font: Toolbar.FONT_LIST };
  }

  const sizeIdx = config.indexOf("size");
  if (sizeIdx !== -1) {
    config[sizeIdx] = { size: Toolbar.SIZE_LIST };
  }

  return config;
}

export default Toolbar;
