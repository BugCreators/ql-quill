import Quill from "quill";

/**
 * Quill 的全局注册表（blot / module / format）。
 * 模块层统一从这里取，避免模块反向引用 QlQuill 类，形成 index ↔ modules 的循环依赖。
 */
export default Quill;

/** Quill 类的静态类型，用于模块里声明 quill 参数 */
export type QuillStatic = typeof Quill;
