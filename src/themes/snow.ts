import QlQuill, { QlQuillOptionsStatic } from "../index";
import { Toolbar, ToolbarOptionsObj } from "quill";
import ColorPicker from "../ui/color-picker";

const Snow = QlQuill.import("themes/snow");

const DEFAULTS: Record<string, Array<any>> = {
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
  colorPicker?: ColorPicker;
  declare options: QlQuillOptionsStatic;

  constructor(quill: QlQuill, options: QlQuillOptionsStatic) {
    expandConfig(options.modules?.toolbar as ToolbarOptionsObj, options);

    super(quill, options);
  }

  extendToolbar(toolbar: Toolbar) {
    super.extendToolbar(toolbar);

    if (toolbar.container.querySelector(".ql-color")) {
      this.colorPicker = new ColorPicker(this.quill, null);
    }
  }
}

function expandConfig(toolbar: ToolbarOptionsObj, options: QlQuillOptionsStatic): void {
  if (typeof toolbar.container === "string") return;
  if (!toolbar.container) toolbar.container = DEFAULTS.tool;

  const container = toolbar.container as any[];

  const twoD = Array.isArray(container[0]);
  const toolbarTemp = twoD ? container : [container];

  let custom: { [key: string]: boolean } = {};

  toolbarTemp.forEach(tool => {
    options.custom.forEach(t => !custom[t] && (custom[t] = tool.indexOf(t) !== -1));

    (["font", "size"] as (keyof typeof DEFAULTS)[]).forEach(format => {
      const index = tool.indexOf(format);
      if (index !== -1) {
        const style = QlQuill.import("attributors/style/" + format);

        style.whitelist = DEFAULTS[format];

        // 设为内联
        QlQuill.register(
          {
            ["formats/" + format]: style,
          },
          true
        );

        tool[index] = { [format]: DEFAULTS[format] };
      }
    });
  });

  for (const key in custom) !custom[key] && container.push(twoD ? [key] : key);
}

export default SnowTheme;
