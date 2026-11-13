export interface Locale {
  name: string;
  插入重点: string;
  插入公式: string;
  取消: string;
  确定: string;
  重置: string;
  [key: string]: string;
}

/** 语言包只需要「注册」这一个能力；不引用 modules 的类型，避免语言包构建牵进别的目录 */
export interface LocaleRegistry {
  locale(
    preset: Locale,
    object?: Record<string, string>,
    isLocal?: boolean,
  ): unknown;
}
