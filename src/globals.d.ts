/**
 * KityFormula 公式编辑器在 iframe 内暴露的全局对象，
 * 通过 window.kfe 读取公式图片与 LaTeX 源码。
 */
interface Window {
  kfe?: {
    execCommand<T = any>(
      command: string,
      callback?: (data: { img: string }) => void,
    ): T;
  };
}
