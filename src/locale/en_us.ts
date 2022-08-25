import QlQuill from "../index";
import type { Locale } from ".";

const locale: Locale = {
  name: "en_us",
  插入重点: "Insert Import",
  插入公式: "Insert Formula",
  取消: "cancel",
  确定: "ok",
  重置: "reset",
};

const localeModule = QlQuill.import("modules/locale");

localeModule.locale(locale, null, true);

export default locale;
