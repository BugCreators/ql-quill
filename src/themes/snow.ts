import Quill from "../core/quill";
import type QlQuill from "../quill";
import type { QlExpandedOptions } from "../types";
import ColorPicker from "../ui/color-picker";
import type { FontStyle as BaseFontStyle } from "quill/formats/font";
import type { SizeStyle as BaseSizeStyle } from "quill/formats/size";
import type {
  default as Toolbar,
  ToolbarConfig,
  ToolbarProps,
} from "quill/modules/toolbar";
import type BaseSnow from "quill/themes/snow";

const Snow = Quill.import("themes/snow") as typeof BaseSnow;

/** 默认工具栏：没传 toolbar 配置时用它 */
const DEFAULT_TOOLS: Array<string | Record<string, string>> = [
  "bold", // 加粗
  "italic", // 斜体
  "underline", // 下划线
  { script: "sub" }, // 上标
  { script: "super" }, // 下标
  "clean", // 清除格式
  "table",
  "image", // 插入图片
];

const FONT_WHITELIST = [
  "Arial",
  "serif",
  "monospace",
  "Cursive",
  "SimSun",
  "SimHei",
  "Microsoft-YaHei",
];

const SIZE_WHITELIST = [
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
];

/** font / size 这两种下拉，用白名单展开成对象形式交给 toolbar */
const WHITELISTS: Record<string, string[]> = {
  font: FONT_WHITELIST,
  size: SIZE_WHITELIST,
};

/** 默认值不出现在下拉里，但仍作为格式白名单生效 */
const HIDDEN_OPTIONS = ["14px", "Arial"];

const AlignStyle = Quill.import("attributors/style/align");

const FontStyle = Quill.import("attributors/style/font") as typeof BaseFontStyle;
FontStyle.whitelist = FONT_WHITELIST;

const SizeStyle = Quill.import("attributors/style/size") as typeof BaseSizeStyle;
SizeStyle.whitelist = SIZE_WHITELIST;

Quill.register("formats/align", AlignStyle);
Quill.register("formats/size", SizeStyle);
Quill.register("formats/font", FontStyle);

class SnowTheme extends Snow {
  colorPicker?: ColorPicker;
  declare options: QlExpandedOptions;
  declare quill: QlQuill;

  constructor(quill: QlQuill, options: QlExpandedOptions) {
    const toolbar = options.modules?.toolbar as ToolbarProps | undefined;

    if (toolbar) expandToolbarConfig(toolbar, options);

    super(quill, options);
  }

  extendToolbar(toolbar: Toolbar) {
    super.extendToolbar(toolbar);

    if (toolbar.container?.querySelector(".ql-color")) {
      this.colorPicker = new ColorPicker(this.quill, undefined);
    }
  }
}

/**
 * toolbar 传字符串（选择器）或数组，数组里可以写 "font" / "size" 简写，
 * 这里把简写展开成带白名单的对象，并补上开启了却没写进 toolbar 的自定义按钮。
 */
function expandToolbarConfig(
  toolbar: ToolbarProps,
  options: QlExpandedOptions,
): void {
  if (typeof toolbar.container === "string") return;
  // quill 的类型只认二维数组，这里传一维同样生效（见 expandToolbarConfig 的 isGrouped 判断）
  if (!toolbar.container) {
    toolbar.container = DEFAULT_TOOLS as unknown as ToolbarConfig;
  }

  const container = toolbar.container as Array<any>;
  const isGrouped = Array.isArray(container[0]);
  const groups = isGrouped ? container : [container];

  // 先认为所有自定义按钮都没配进 toolbar
  const enabled = options.custom.reduce<Record<string, boolean>>((map, key) => {
    map[key] = false;

    return map;
  }, {});

  groups.forEach(group => {
    group.forEach((item: unknown, index: number) => {
      if (typeof item !== "string") return;

      if (options.custom.includes(item)) enabled[item] = true;

      const whitelist = WHITELISTS[item];
      if (whitelist) {
        group[index] = {
          [item]: whitelist.map(value =>
            HIDDEN_OPTIONS.includes(value) ? false : value,
          ),
        };
      }
    });
  });

  for (const key in enabled) {
    if (!enabled[key]) container.push(isGrouped ? [key] : key);
  }
}

export default SnowTheme;
