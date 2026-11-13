import Quill from "quill";
import type { Locale, LocaleRegistry } from "./";

const locale: Locale = {
  name: "en_us",
  插入重点: "Insert Import",
  插入公式: "Insert Formula",
  取消: "cancel",
  确定: "ok",
  重置: "reset",
};

const localeModule = Quill.import("modules/locale") as LocaleRegistry;

localeModule.locale(locale, undefined, true);

export default locale;
