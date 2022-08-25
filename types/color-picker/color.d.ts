interface Hsva {
    h: number;
    s: number;
    v: number;
    a?: number;
}
/**
 * h.s.v. 转换为 r.g.b
 * @param h
 * @param s
 * @param v
 */
export declare const hsv2rgb: (h: number, s: number, v: number) => {
    r: number;
    g: number;
    b: number;
};
/**
 * r.g.b 转换为 h.s.v
 * @param r
 * @param g
 * @param b
 * @param a
 */
export declare const rgb2hsv: (r: number, g: number, b: number, a?: number) => Hsva;
/**
 * h.s.v转换为h.s.l
 * @param h
 * @param s
 * @param v
 */
export declare const hsv2hsl: (h: number, s: number, v: number) => {
    h: number;
    s: number;
    l: number;
};
/**
 * h.s.l转换为h.s.v
 * @param h
 * @param s
 * @param l
 * @param a
 */
export declare const hsl2hsv: (h: number, s: number, l: number, a?: number) => Hsva;
/**
 * hex转换为rgb
 * @param color
 */
export declare const hex2rgb: (color: string) => {
    r: number;
    g: number;
    b: number;
};
/**
 * rgb转化为hex
 * @param r
 * @param g
 * @param b
 */
export declare const rgb2hex: (r: number, g: number, b: number) => string;
/**
 * 解析输入的任意颜色值
 * 输出h.s.v.a
 * @param color
 */
export declare const parseColor: (color: string) => Hsva;
export {};
