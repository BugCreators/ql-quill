import QlQuill from "../index";
import type { QlExpandedOptions } from "../types";
import ColorPicker from "../ui/color-picker";
import type { FontStyle as BaseFontStyle } from "quill/formats/font";
import type { SizeStyle as BaseSizeStyle } from "quill/formats/size";
import type { default as Toolbar, ToolbarProps } from "quill/modules/toolbar";
import type BaseSnow from "quill/themes/snow";

const Snow = QlQuill.import("themes/snow") as typeof BaseSnow;

const DEFAULTS: Record<string, Array<any>> = {
  tool: [
    "bold", // 加粗
    "italic", // 斜体
    "underline", // 下划线
    { script: "sub" }, // 上标
    { script: "super" }, // 下标
    "clean", // 清除格式
    "table",
    "image", // 插入图片
  ],
  font: [
    "Arial",
    "serif",
    "monospace",
    "Cursive",
    "SimSun",
    "SimHei",
    "Microsoft-YaHei",
  ],
  size: [
    "6px",
    "8px",
    "10px",
    "12px",
    "14px",
    "16px",
    "18px",
    "20px",
    "22px",
    "24px",
    "26px",
  ],
};

const AlignStyle = QlQuill.import("attributors/style/align");

const FontStyle = QlQuill.import(
  "attributors/style/font"
) as typeof BaseFontStyle;
FontStyle.whitelist = DEFAULTS.font;

const SizeStyle = QlQuill.import(
  "attributors/style/size"
) as typeof BaseSizeStyle;
SizeStyle.whitelist = DEFAULTS.size;

QlQuill.register(
  {
    "formats/align": AlignStyle,
    "formats/size": SizeStyle,
    "formats/font": FontStyle,
  },
  true
);

class SnowTheme extends Snow {
  colorPicker?: ColorPicker;
  declare options: QlExpandedOptions;
  declare quill: QlQuill;

  constructor(quill: QlQuill, options: QlExpandedOptions) {
    expandConfig(options.modules?.toolbar as ToolbarProps, options);

    super(quill, options);
  }

  extendToolbar(toolbar: Toolbar) {
    super.extendToolbar(toolbar);

    if (toolbar.container!.querySelector(".ql-color")) {
      this.colorPicker = new ColorPicker(this.quill, undefined);
    }
  }
}

function expandConfig(toolbar: ToolbarProps, options: QlExpandedOptions): void {
  if (typeof toolbar.container === "string") return;
  if (!toolbar.container) toolbar.container = DEFAULTS.tool;

  const container = toolbar.container as any[];

  const twoD = Array.isArray(container[0]);
  const toolbarTemp = twoD ? container : [container];

  const custom = options.custom.reduce((obj, key) => {
    obj[key] = false;

    return obj;
  }, {} as { [key: string]: boolean });

  toolbarTemp.forEach((tool) => {
    tool.forEach((t: string | Record<string, any[]>, index: number) => {
      if (typeof t === "string") {
        if (options.custom.includes(t)) {
          custom[t] = true;
        }

        if (["font", "size"].includes(t)) {
          tool[index] = {
            [t]: DEFAULTS[t].map((item) =>
              ["14px", "Arial"].includes(item) ? false : item
            ),
          };
          t = tool[index];
        }
      }
    });
  });

  for (const key in custom) !custom[key] && container.push(twoD ? [key] : key);
}

export default SnowTheme;
