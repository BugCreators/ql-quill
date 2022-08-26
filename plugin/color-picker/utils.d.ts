export declare const $: (selector: string, context?: HTMLElement | Document) => HTMLElement;
export declare const on: (el: Element | Document, event: string, listener: EventListener) => void;
export declare const off: (el: Element | Document, event: string, listener: EventListener) => void;
export declare const isFunction: (value: any) => boolean;
export interface PlainObject {
    [key: string]: any;
}
