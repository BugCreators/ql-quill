import Quill from "quill";
import ColorPicker from "../ui/color-picker";

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
  size: ["12px", false, "16px", "18px", "20px", "22px", "24px", "26px"],
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
        const style = Quill.import("attributors/style/" + format);

        style.whitelist = DEFAULTS[format];

        // 设为内联
        Quill.register(
          {
            ["formats/" + format]: style,
          },
          true
        );

        tool[index] = { [format]: DEFAULTS[format] };
      }
    });
  });

  for (const key in custom) !custom[key] && toolbar.push(twoD ? [key] : key);
}

export default SnowTheme;
