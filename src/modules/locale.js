import Quill from "quill";

let L = "zh_cn"; // global locale
const Ls = {
  zh_cn: {},
}; // global loaded locale

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
    const presetSplit = preset.split("_");
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

    parseLocale(options, null);
  }

  get $L() {
    return L;
  }

  $locale(key) {
    const locale = Ls[this.$L];

    return key ? locale[key] || key : locale;
  }

  locale(preset, object) {
    if (!preset) return this.$L;

    parseLocale(preset, object);
  }
}

Locale.locale = parseLocale;
Locale.Ls = Ls;

export default Locale;
