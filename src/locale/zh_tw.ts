import Quill from "quill";
import type { Locale } from "./";
import type { LocaleInstance } from "../modules/locale";

const locale: Locale = {
  name: "zh_tw",
  插入重点: "插入重點",
  插入公式: "插入公式",
  取消: "取消",
  确定: "確定",
  重置: "重置",
};

const localeModule = Quill.import("modules/locale") as LocaleInstance;

localeModule.locale(locale);

export default locale;
