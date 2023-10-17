import type { QuillOptionsStatic, DeltaStatic } from "quill";
import type { QuillOptionsModules } from "./quill";

export interface QlQuillOptionsStatic extends QuillOptionsStatic {
  custom: string[];
}

export interface FileLike extends Blob {
  name: string;
  lastModified: number;
}

export interface CustomToolOptions {
  /** 开启插入重点功能 不推荐使用此配置 建议在toolbar配置 */
  import?: boolean;
  /** 开启插入小题(sub-option标签)功能 不推荐使用此配置 建议在toolbar配置 */
  option?: boolean;
  /** 开启插入小题(sub-question标签)功能 不推荐使用此配置 建议在toolbar配置 */
  question?: boolean;
  /** 开启插入公式 */
  formula?: string;
}

export interface ImageObjOptions {
  /** 图片上传accept */
  accept?: string;
  /** 是否自动上传粘贴的base64图片 */
  base64AutoUpload?: boolean;
  /** 剪贴板中的图片回调 */
  clipboard?(node: HTMLElement, delta: DeltaStatic): DeltaStatic;
  /** 是否开启拖拽上传  */
  drop?: boolean;
  /** 文件上传时触发 */
  action?(
    file: FileLike,
    resolce: (file: string, atts?: Record<string, any>) => void,
    reject: () => void
  ): void;
}

export type ImageOptions = (() => void) | ImageObjOptions;

export interface QlOptions extends CustomToolOptions {
  /** toolbar配置 */
  toolbar?: QuillOptionsModules["toolbar"];
  /** 文本字数限制 */
  limit?: number;
  /** 字数达到上限时触发 */
  onLimit?(): void;
  /** 编辑器默认富文本 */
  value?: string | DeltaStatic;
  /** 富文本值改变时触发 */
  onChange?(value: string, delta: DeltaStatic): void;
  /** 图片相关配置 */
  image?: ImageOptions;
  /** 图片是否可缩放 */
  imageResize?: boolean;
  /** 编辑器默认语言 */
  locale?: string;
  /** 是否开启从 word 复制文本 */
  pasteFromWord?: boolean;
  /** 编辑器聚焦时触发 */
  onFocus?(): void;
  /** 编辑器失焦时触发 */
  onBlur?(): void;
}

export type QlQuillOptions = Partial<QlQuillOptionsStatic> & QlOptions;

export * from "../plugin/color-picker/mo.color-picker.es";

export * from "./locale";
