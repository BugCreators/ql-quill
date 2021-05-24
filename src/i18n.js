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

export function replaceMustache(str) {
  const reg = /{{(.+?)}}/g;

  let result = null;
  do {
    result = reg.exec(str);
    if (result) {
      str = str.replace(result[0], i18n.t(result[1]));
    }
  } while (result);

  return str;
}

export default i18n;
