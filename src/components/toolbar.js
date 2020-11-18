class Toolbar {
  constructor(userConfig) {
    this.id = `toolbar-${Math.random().toString(36).slice(-8)}`;

    const config = expandConfig(userConfig);

    this.container = document.createElement("div");
    this.container.setAttribute("id", this.id);
    config.forEach(item => {
      const button = document.createElement("button");
      button.setAttribute("type", "button");
      if (typeof item === "string") {
        button.setAttribute("title", translateTitle(item));
        button.classList.add(`ql-${item}`);
      } else if (typeof item === "object") {
        const name = Object.keys(item)[0];
        const value = item[name];
        button.classList.add(`ql-${name}`);
        button.setAttribute("value", value);
        button.setAttribute("title", translateTitle(value));
      }
      this.container.appendChild(button);
    });
  }
}

Toolbar.CUSTOM = ["table", "import", "option", "formula", "question"];

Toolbar.DEFAULT = [
  "bold", // 加粗
  "italic", // 斜体
  "underline", // 下划线
  { script: "sub" }, // 上标
  { script: "super" }, // 下标
  "clean", // 清除格式
  "image", // 插入图片
];

Toolbar.TABLE_EDIT_TOOLBAR = [{ table: "TD" }];

Toolbar.TRANSLATE = {
  bold: "加粗",
  italic: "斜体",
  underline: "下划线",
  sub: "上标",
  super: "下标",
  clean: "清除格式",
  image: "插入图片",
  TD: "插入表格",
  TIR: "插入1行",
  TIC: "插入1列",
  TDR: "删除1行",
  TDC: "删除1列",
  import: "插入重点",
  option: "插入小题",
  question: "插入小题",
  formula: "插入公式",
};

function expandConfig(userConfig) {
  let config = Toolbar.DEFAULT;

  Toolbar.CUSTOM.forEach(label => {
    if (!config.includes(label) && userConfig[label]) {
      if (label === "table") {
        config = config.concat(Toolbar.TABLE_EDIT_TOOLBAR);
      } else {
        config.push(label);
      }
    }
  });

  return config;
}

function translateTitle(name) {
  return Toolbar.TRANSLATE[name];
}

export default Toolbar;
