import i18n from "i18next";

import zhCn from "@locales/zh-cn.json";
import enUs from "@locales/en-us.json";

const DEFAULT_LOCALES = "zh-CN";

export function initI18n(locales = DEFAULT_LOCALES) {
  i18n.init({
    lng: locales,
    fallbackLng: DEFAULT_LOCALES,
    resources: {
      "zh-CN": zhCn,
      "en-US": enUs,
    },
  });
}

export default i18n;
