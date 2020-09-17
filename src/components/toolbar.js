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
        button.classList.add(`ql-${item}`);
      } else if (typeof item === "object") {
        const name = Object.keys(item)[0];
        const value = item[name];
        button.classList.add(`ql-${name}`);
        button.setAttribute("value", value);
      }
      this.container.appendChild(button);
    });
  }
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
  // 'import'               // 插入重点
];

function expandConfig(userConfig) {
  const config = Toolbar.DEFAULT;

  Toolbar.CUSTOM.forEach(label => {
    if (userConfig[label]) {
      config.push(label);
    }
  });

  return config;
}

export default Toolbar;
