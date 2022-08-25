import type { Locale } from "../locale/index";

type PartialLocale = Partial<Locale>;

let L = "zh_cn"; // global locale
const Ls: Record<string, PartialLocale> = {
  zh_cn: {},
}; // global loaded locale

function parseLocale(preset: undefined, object?: PartialLocale, isLocal?: boolean): string;
function parseLocale(preset?: string | PartialLocale, object?: PartialLocale, isLocal?: boolean): boolean;
function parseLocale(preset?: string | PartialLocale, object?: PartialLocale, isLocal?: boolean): string | boolean {
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
    if (name) {
      Ls[name] = preset;
      l = name;
    }
  }
  if (!isLocal && l) L = l;
  return l || (!isLocal && L);
}

class LocaleModule {
  static locale = parseLocale;
  static Ls = Ls;

  constructor(quill: any, options: string | PartialLocale) {
    if (typeof options === "object" && !options.name) options = Ls[L];
    parseLocale(options, undefined);
  }

  get $L() {
    return L;
  }

  $locale(): PartialLocale;
  $locale(key: string): string;
  $locale(key?: string): string | PartialLocale {
    const locale = Ls[this.$L];

    return key ? locale[key] || key : locale;
  }

  locale(preset?: string | PartialLocale, object?: PartialLocale) {
    if (!preset) return this.$L;

    parseLocale(preset, object);
  }
}

export default LocaleModule;
