import { PlainObject } from "./utils";
declare type ColorFormat = "hsl" | "hsv" | "hex" | "rgb";
interface Colors {
  h: number;
  s: number;
  v: number;
  a: number;
}
interface Props {
  value?: string;
  format?: ColorFormat;
  alpha?: boolean;
  change?: Function;
}
/**
 * 颜色选择器
 * @export
 * @class ColorPicker
 */
export declare class ColorPicker {
  static hex2rgb: (color: string) => {
    r: number;
    g: number;
    b: number;
  };
  static rgb2hex: (r: number, g: number, b: number) => string;
  protected _states: PlainObject;
  protected _props: Props;
  /**
   * Creates an instance of ColorPicker.
   * @param {HTMLElement} wrapper
   * @param {Props} [options]
   * @memberof ColorPicker
   */
  constructor(wrapper: HTMLElement, options?: Props);
  /**
   * 手动更新值
   * @public
   * @param {(Colors | null)} value
   * @memberof ColorPicker
   */
  setValue(value: string | null): void;
  /**
   * 获取当前颜色
   * @public
   * @returns {string}
   * @memberof ColorPicker
   */
  getValue(format?: ColorFormat): string;
  destroy(): void;
}
export default ColorPicker;
