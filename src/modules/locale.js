import Quill from "quill";

import zhCn from "../locale/zh-cn";

let L = null; // global locale
const Ls = {}; // global loaded locale

function parseLocale(preset, object, isLocal) {
  let l;
  if (!preset) return L;
  if (typeof preset === "string") {
    const presetLower = preset.toLowerCase();
    if (Ls[presetLower]) {
      l = presetLower;
    }
    if (object) {
      Ls[presetLower] = object;
      l = presetLower;
    }
    const presetSplit = preset.split("-");
    if (!l && presetSplit.length > 1) {
      return parseLocale(presetSplit[0]);
    }
  } else {
    const { name } = preset;
    Ls[name] = preset;
    l = name;
  }
  if (!isLocal && l) L = l;
  return l || (!isLocal && L);
}

const Module = Quill.import("core/module");

class Locale extends Module {
  constructor(quill, options) {
    super(quill, options);

    this.$L = parseLocale(zhCn, null, true);
  }

  $locale(key) {
    const locale = Ls[this.$L];

    return key ? locale[key] : locale;
  }

  locale(preset, object) {
    if (!preset) return this.$L;

    const nextLocaleName = parseLocale(preset, object, true);
    if (nextLocaleName) this.$L = nextLocaleName;
    return this;
  }
}

export default Locale;
