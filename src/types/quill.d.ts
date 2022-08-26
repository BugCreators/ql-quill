declare module "quill" {
  // Type definitions for Quill 1.3
  // Project: https://github.com/quilljs/quill/
  // Definitions by: Sumit <https://github.com/sumitkm>
  //                 Guillaume <https://github.com/guillaume-ro-fr>
  //                 James Garbutt <https://github.com/43081j>
  //                 Aniello Falcone <https://github.com/AnielloFalcone>
  //                 Mohammad Hossein Amri <https://github.com/mhamri>
  // Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

  // export = Quill;
  // export as namespace Quill;

  import { Blot } from "parchment/dist/src/blot/abstract/blot";

  /**
   * A stricter type definition would be:
   *
   *   type DeltaOperation ({ insert: any } | { delete: number } | { retain: number }) & OptionalAttributes;
   *
   *  But this would break a lot of existing code as it would require manual discrimination of the union types.
   */
  export type DeltaOperation = { insert?: any; delete?: number; retain?: number } & OptionalAttributes;
  export type Sources = "api" | "user" | "silent";

  export interface Key {
    key: string;
    shortKey?: boolean;
  }

  export interface StringMap {
    [key: string]: any;
  }

  export interface OptionalAttributes {
    attributes?: StringMap;
  }

  export type TextChangeHandler = (delta: DeltaStatic, oldContents: DeltaStatic, source: Sources) => any;
  export type SelectionChangeHandler = (range: RangeStatic, oldRange: RangeStatic, source: Sources) => any;
  export type EditorChangeHandler =
    | ((name: "text-change", delta: DeltaStatic, oldContents: DeltaStatic, source: Sources) => any)
    | ((name: "selection-change", range: RangeStatic, oldRange: RangeStatic, source: Sources) => any);

  export interface KeyboardStatic {
    addBinding(key: Key, callback: (range: RangeStatic, context: any) => void): void;
    addBinding(key: Key, context: any, callback: (range: RangeStatic, context: any) => void): void;
  }

  export interface ClipboardStatic {
    convert(html?: string): DeltaStatic;
    addMatcher(selectorOrNodeType: string | number, callback: (node: any, delta: DeltaStatic) => DeltaStatic): void;
    dangerouslyPasteHTML(html: string, source?: Sources): void;
    dangerouslyPasteHTML(index: number, html: string, source?: Sources): void;
  }

  export interface QuillOptionsStatic {
    debug?: string;
    modules?: QuillOptionsModules;
    placeholder?: string;
    readOnly?: boolean;
    theme?: string;
    formats?: string[];
    bounds?: HTMLElement | string;
    scrollingContainer?: HTMLElement | string;
    strict?: boolean;
  }

  export interface BoundsStatic {
    bottom: number;
    left: number;
    right: number;
    top: number;
    height: number;
    width: number;
  }

  export interface DeltaStatic {
    ops?: DeltaOperation[];
    retain(length: number, attributes?: StringMap): DeltaStatic;
    delete(length: number): DeltaStatic;
    filter(predicate: (op: DeltaOperation) => boolean): DeltaOperation[];
    forEach(predicate: (op: DeltaOperation) => void): void;
    insert(text: any, attributes?: StringMap): DeltaStatic;
    map<T>(predicate: (op: DeltaOperation) => T): T[];
    partition(predicate: (op: DeltaOperation) => boolean): [DeltaOperation[], DeltaOperation[]];
    reduce<T>(predicate: (acc: T, curr: DeltaOperation, idx: number, arr: DeltaOperation[]) => T, initial: T): T;
    chop(): DeltaStatic;
    length(): number;
    slice(start?: number, end?: number): DeltaStatic;
    compose(other: DeltaStatic): DeltaStatic;
    concat(other: DeltaStatic): DeltaStatic;
    diff(other: DeltaStatic, index?: number): DeltaStatic;
    eachLine(predicate: (line: DeltaStatic, attributes: StringMap, idx: number) => any, newline?: string): DeltaStatic;
    transform(index: number, priority?: boolean): number;
    transform(other: DeltaStatic, priority: boolean): DeltaStatic;
    transformPosition(index: number, priority?: boolean): number;
  }

  export class Delta implements DeltaStatic {
    constructor(ops?: DeltaOperation[] | { ops: DeltaOperation[] });
    ops?: DeltaOperation[];
    retain(length: number, attributes?: StringMap): DeltaStatic;
    delete(length: number): DeltaStatic;
    filter(predicate: (op: DeltaOperation) => boolean): DeltaOperation[];
    forEach(predicate: (op: DeltaOperation) => void): void;
    insert(text: any, attributes?: StringMap): DeltaStatic;
    map<T>(predicate: (op: DeltaOperation) => T): T[];
    partition(predicate: (op: DeltaOperation) => boolean): [DeltaOperation[], DeltaOperation[]];
    reduce<T>(predicate: (acc: T, curr: DeltaOperation, idx: number, arr: DeltaOperation[]) => T, initial: T): T;
    chop(): DeltaStatic;
    length(): number;
    slice(start?: number, end?: number): DeltaStatic;
    compose(other: DeltaStatic): DeltaStatic;
    concat(other: DeltaStatic): DeltaStatic;
    diff(other: DeltaStatic, index?: number): DeltaStatic;
    eachLine(predicate: (line: DeltaStatic, attributes: StringMap, idx: number) => any, newline?: string): DeltaStatic;
    transform(index: number): number;
    transform(other: DeltaStatic, priority: boolean): DeltaStatic;
    transformPosition(index: number): number;
  }

  export interface RangeStatic {
    index: number;
    length: number;
  }

  export class RangeStatic implements RangeStatic {
    constructor();
    index: number;
    length: number;
  }

  export interface EventEmitter {
    on(eventName: "text-change", handler: TextChangeHandler): EventEmitter;
    on(eventName: "selection-change", handler: SelectionChangeHandler): EventEmitter;
    on(eventName: "editor-change", handler: EditorChangeHandler): EventEmitter;
    once(eventName: "text-change", handler: TextChangeHandler): EventEmitter;
    once(eventName: "selection-change", handler: SelectionChangeHandler): EventEmitter;
    once(eventName: "editor-change", handler: EditorChangeHandler): EventEmitter;
    off(eventName: "text-change", handler: TextChangeHandler): EventEmitter;
    off(eventName: "selection-change", handler: SelectionChangeHandler): EventEmitter;
    off(eventName: "editor-change", handler: EditorChangeHandler): EventEmitter;
  }

  export class Quill implements EventEmitter {
    static sources: typeof Emitter.sources;

    /**
     * @private Internal API
     */
    root: HTMLDivElement;
    clipboard: ClipboardStatic;
    scroll: Blot;
    keyboard: KeyboardStatic;
    container: HTMLElement;
    selection: Selection;
    scrollingContainer: HTMLElement;
    emitter: Emitter;
    constructor(container: string | Element, options?: QuillOptionsStatic);
    deleteText(index: RangeStatic): DeltaStatic;
    deleteText(index: number, length: number, source?: Sources): DeltaStatic;
    disable(): void;
    enable(enabled?: boolean): void;
    getContents(index?: number, length?: number): DeltaStatic;
    getLength(): number;
    getText(index?: number, length?: number): string;
    insertEmbed(index: number, type: string, value: any, source?: Sources): DeltaStatic;
    insertText(index: number, text: string, source?: Sources): DeltaStatic;
    insertText(index: number, text: string, format: string, value: any, source?: Sources): DeltaStatic;
    insertText(index: number, text: string, formats: StringMap, source?: Sources): DeltaStatic;
    /**
     * @deprecated Remove in 2.0. Use clipboard.dangerouslyPasteHTML(index: number, html: string, source: Sources)
     */
    pasteHTML(index: number, html: string, source?: Sources): string;
    /**
     * @deprecated Remove in 2.0. Use clipboard.dangerouslyPasteHTML(html: string, source: Sources): void;
     */
    pasteHTML(html: string, source?: Sources): string;
    setContents(delta: DeltaStatic, source?: Sources): DeltaStatic;
    setText(text: string, source?: Sources): DeltaStatic;
    update(source?: Sources): void;
    updateContents(delta: DeltaStatic, source?: Sources): DeltaStatic;

    format(name: string, value: any, source?: Sources): DeltaStatic;
    formatLine(index: number, length: number, source?: Sources): DeltaStatic;
    formatLine(index: number, length: number, format: string, value: any, source?: Sources): DeltaStatic;
    formatLine(index: number, length: number, formats: StringMap, source?: Sources): DeltaStatic;
    formatText(index: number, length: number, source?: Sources): DeltaStatic;
    formatText(index: number, length: number, format: string, value: any, source?: Sources): DeltaStatic;
    formatText(index: number, length: number, formats: StringMap, source?: Sources): DeltaStatic;
    formatText(range: RangeStatic, format: string, value: any, source?: Sources): DeltaStatic;
    formatText(range: RangeStatic, formats: StringMap, source?: Sources): DeltaStatic;
    getFormat(range?: RangeStatic): StringMap;
    getFormat(index: number, length?: number): StringMap;
    removeFormat(index: number, length: number, source?: Sources): DeltaStatic;

    blur(): void;
    focus(): void;
    getBounds(index: number, length?: number): BoundsStatic;
    getSelection(focus: true): RangeStatic;
    getSelection(focus?: false): RangeStatic | null;
    hasFocus(): boolean;
    setSelection(index: number): void;
    setSelection(index: number, length: number, source?: Sources): void;
    setSelection(range: RangeStatic, source?: Sources): void;

    // static methods: debug, import, register, find
    static debug(level: string | boolean): void;
    static import<T>(this: T, path: "ui/tooltip"): typeof Tooltip<InstanceType<T>>;
    static import<T, U = any>(this: T, path: "themes/snow"): typeof SnowTheme<InstanceType<T>, U>;
    static import<T>(this: T, path: "delta"): typeof Delta;
    static import<T>(this: T, path: "modules/clipboard"): typeof Clipboard<InstanceType<T>>;
    static import(path: "blots/embed"): typeof Embed;
    static import<T>(this: T, path: "core/module"): typeof Module<InstanceType<T>>;
    static import<T = any>(path: string): T;
    static register(path: string, def: any, suppressWarning?: boolean): void;
    static register(defs: StringMap, suppressWarning?: boolean): void;

    static find(domNode: Node, bubble?: boolean): Quill | any;

    addContainer(classNameOrDomNode: string | Node, refNode?: Node): any;
    getModule<T = any>(name: string): T;
    getModule(name: string): any;

    // Blot interface is not exported on Parchment
    getIndex(blot: any): number;
    getLeaf(index: number): any;
    getLine(index: number): [any, number];
    getLines(index?: number, length?: number): any[];
    getLines(range: RangeStatic): any[];

    // EventEmitter methods
    on(eventName: "text-change", handler: TextChangeHandler): EventEmitter;
    on(eventName: "selection-change", handler: SelectionChangeHandler): EventEmitter;
    on(eventName: "editor-change", handler: EditorChangeHandler): EventEmitter;
    once(eventName: "text-change", handler: TextChangeHandler): EventEmitter;
    once(eventName: "selection-change", handler: SelectionChangeHandler): EventEmitter;
    once(eventName: "editor-change", handler: EditorChangeHandler): EventEmitter;
    off(eventName: "text-change", handler: TextChangeHandler): EventEmitter;
    off(eventName: "selection-change", handler: SelectionChangeHandler): EventEmitter;
    off(eventName: "editor-change", handler: EditorChangeHandler): EventEmitter;
  }

  import EventEmitter from "eventemitter3";
  import Parchment from "parchment";

  export type ToolbarContainer = string | HTMLElement;
  export type ToolbarOptions = string[] | Record<string, any>[] | (string | Record<string, any>)[];

  export interface ToolbarOptionsObj {
    container: ToolbarOptions | ToolbarContainer;
    handlers?: {
      [key: string]: (value: any) => void;
    };
  }

  export interface QuillOptionsModules {
    toolbar?: ToolbarOptions | ToolbarOptionsObj;
    [key: string]: any;
  }

  export class Module<T, U = any> {
    static DEFAULTS: any;

    constructor(quill: T, options: U);
  }

  export interface Module<T, U = any> {
    quill: T;
    options: U;
  }

  export class Embed extends Parchment.Embed {
    restore(node: Node): Range | undefined;

    static tagName: string | string[];
  }

  type Selector = string;
  type Matcher = (node: Node, delta: DeltaStatic) => DeltaStatic;
  type Matchers = [string, Matcher][];

  interface ClipboardOptions {
    matchers: Matchers;
  }

  export class Toolbar<T = Quill> extends Module<T, ToolbarOptions> {
    container: HTMLElement;
    controls: [string, HTMLElement][];
    handlers?: Record<string, Function>;

    addHandler(format: string, handler: Function): void;

    attach(input: HTMLElement): void;

    update(range: null | RangeStatic): void;
  }

  export class Clipboard<T> extends Module<T> implements ClipboardStatic {
    container: HTMLElement;

    addMatcher(selector: Selector, matcher: Matcher): void;

    convert(html?: string): DeltaStatic;

    onPaste(e: ClipboardEvent): void;

    prepareMatching(): [Matchers, Matchers];

    dangerouslyPasteHTML(html: string, source?: Sources): void;
    dangerouslyPasteHTML(index: number, html: string, source?: Sources): void;
  }

  export class Emitter extends EventEmitter.EventEmitter {
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

  export class SelectionRange {
    index: number;
    length: number;
  }

  export class Selection {
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

    setRange(range: NativeRange, force?: boolean, source?: keyof typeof Emitter.sources);

    update(source: keyof typeof Emitter.sources): void;
  }

  export class Theme<T, U> {
    static DEFAULTS: Pick<QuillOptionsStatic, "modules">;
    static themes: Record<string, Theme<any, any>>;

    quill: T;
    options: U;
    modules: Record<string, any>;

    constructor(quill: T, options: U);

    init(): void;

    addModule(name: string): any;
  }

  export class BaseTheme<T, U> extends Theme<T, U> {
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

  export class SnowTheme<T, U = any> extends BaseTheme<T, U> {
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

  export class Tooltip<T = Quill> {
    quill: T;
    boundsContainer: HTMLElement;
    root: HTMLElement;

    constructor(quill: T, boundsContainer: HTMLElement | null);

    hide(): void;

    position(reference: Reference): any;

    show(): void;
  }

  export default Quill;
}
