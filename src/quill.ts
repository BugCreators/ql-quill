import type Quill from "quill";
import type { DeltaStatic, RangeStatic, ClipboardStatic, Sources, QuillOptionsStatic } from "quill";
import type EventEmitter from "eventemitter3";
import type Parchment from "parchment";
import type { Blot } from "parchment/dist/src/blot/abstract/blot";

export declare type ToolbarContainer = string | HTMLElement;
export declare type ToolbarOptions = string[] | Record<string, any>[] | (string | Record<string, any>)[];

export declare interface ToolbarOptionsObj {
  container: ToolbarOptions | ToolbarContainer;
  handlers?: {
    [key: string]: (value: any) => void;
  };
}

export declare interface QuillOptionsModules {
  toolbar?: ToolbarOptions | ToolbarOptionsObj;
  [key: string]: any;
}

export declare class Module<T = Quill, U = any> {
  static DEFAULTS: any;

  constructor(quill: T, options: U);
}

export declare interface Module<T, U = any> {
  quill: T;
  options: U;
}

export declare class Embed extends Parchment["Embed"] {
  restore(node: Node): Range | undefined;

  static tagName: any;
}

type Selector = string;
export declare type Matcher = (node: Node, delta: DeltaStatic) => DeltaStatic;
export declare type Matchers = [string, Matcher][];

export declare interface ClipboardOptions {
  matchers: Matchers;
}

export declare class Toolbar<T = Quill> extends Module<T, ToolbarOptions> {
  container: HTMLElement;
  controls: [string, HTMLElement][];
  handlers?: Record<string, Function>;

  addHandler(format: string, handler: Function): void;

  attach(input: HTMLElement): void;

  update(range: null | RangeStatic): void;
}

export declare class Clipboard<T> extends Module<T> implements ClipboardStatic {
  container: HTMLElement;

  addMatcher(selector: Selector, matcher: Matcher): void;

  convert(html?: string): DeltaStatic;

  onPaste(e: ClipboardEvent): void;

  prepareMatching(): [Matchers, Matchers];

  dangerouslyPasteHTML(html: string, source?: Sources): void;
  dangerouslyPasteHTML(index: number, html: string, source?: Sources): void;
}

export declare class Emitter extends EventEmitter.EventEmitter {
  static events: {
    EDITOR_CHANGE: string;
    SCROLL_BEFORE_UPDATE: string;
    SCROLL_BLOT_MOUNT: string;
    SCROLL_BLOT_UNMOUNT: string;
    SCROLL_OPTIMIZE: string;
    SCROLL_UPDATE: string;
    SELECTION_CHANGE: string;
    TEXT_CHANGE: string;
  };
  static sources: {
    API: Sources;
    SILENT: Sources;
    USER: Sources;
  };

  constructor();

  handleDOM(event: string, ...args: any): void;

  listenDOM(eventName: string, node: Element, handler: (event: MouseEvent, ...args: any) => void): void;
}

interface NativeRange {
  start: {
    node: Node;
    offset: number;
  };
  end: {
    node: Node;
    offset: number;
  };
  native: Range;
}

interface Bounds {
  bottom: number;
  height: number;
  left: number;
  right: number;
  top: number;
  width: number;
}

export declare class SelectionRange {
  index: number;
  length: number;
}

export declare class Selection {
  emitter: Emitter;
  scroll: any;
  composing: boolean;
  mouseDown: boolean;
  root: Element;
  cursor: Blot;
  lastRange: SelectionRange;
  savedRange: SelectionRange;

  constructor(scroll: any, emitter: Emitter);

  handleComposition(): void;

  handleDragging(): void;

  focus(): void;

  format(format: string, value: any): void;

  getBounds(index: number, length: number): DOMRect | Bounds | null;

  getNativeRange(): NativeRange | null;

  getRange(): [null, null] | [SelectionRange | NativeRange, SelectionRange | NativeRange];

  hasFocus(): boolean;

  normalizedToRange(range: NativeRange): SelectionRange;

  normalizeNative(nativeRange: Range): NativeRange | null;

  rangeToNative(range: NativeRange): (Node | number)[];

  scrollIntoView(scrollingContainer: Element): void;

  setNativeRange(
    startNode: Node | null,
    startOffset: number,
    endNode?: Node,
    endOffset?: number,
    force?: boolean
  ): void;

  setRange(range: NativeRange, force?: boolean, source?: keyof typeof Emitter.sources): void;

  update(source: keyof typeof Emitter.sources): void;
}

export declare class Theme<T, U> {
  static DEFAULTS: Pick<QuillOptionsStatic, "modules">;
  static themes: Record<string, Theme<any, any>>;

  quill: T;
  options: U;
  modules: Record<string, any>;

  constructor(quill: T, options: U);

  init(): void;

  addModule(name: string): any;
}

export declare class BaseTheme<T, U> extends Theme<T, U> {
  static DEFAULTS: typeof Theme.DEFAULTS & {
    toolbar: {
      handlers: {
        formula: () => void;
        image: () => void;
        video: () => void;
      };
    };
  };

  buildButtons(buttons: HTMLElement[], icons: Record<string, any>): void;

  buildPickers(selects: HTMLElement[], icons: Record<string, any>): void;
}

export declare class SnowTheme<T, U = any> extends BaseTheme<T, U> {
  static DEFAULTS: typeof BaseTheme.DEFAULTS & {
    toolbar: {
      handlers: { link: (value: any) => void };
    };
  };

  extendToolbar(toolbar: Toolbar): void;
}

interface Reference {
  top: number;
  bottom: number;
  left: number;
  width: number;
}

export declare class Tooltip<T = Quill> {
  quill: T;
  boundsContainer: HTMLElement;
  root: HTMLElement;

  constructor(quill: T, boundsContainer: HTMLElement | null);

  hide(): void;

  position(reference: Reference): any;

  show(): void;
}
