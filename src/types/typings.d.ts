declare interface Window {
  kfe?: {
    execCommand<T = any>(command: string, callback?: (data: { img: string }) => void): T;
  };
}

declare interface Document {
  caretPositionFromPoint(x: number, y: number): any;
}

declare module "quill-blot-formatter/dist/BlotFormatter" {
  import BlotFormatter from "quill-blot-formatter";

  export default BlotFormatter;
}

declare namespace QuillBlotFormatter {
  interface Options {
    resizable?: boolean;
  }
}
