import { PlainObject } from './utils';
interface Handlers extends PlainObject {
}
export interface Coordinate {
    top: number;
    left: number;
}
interface Props {
    start?: Function;
    drag?: Function;
    end?: Function;
}
/**
 * Draggable 基类
 * 用于元素在其父元素上自由拖拽
 * 如 Range
 * @export
 * @class Draggable
 * @extends {EventsBus}
 */
export declare class Draggable {
    static dragging: boolean;
    protected _$el: Element;
    protected _handlers: Handlers;
    protected _props: Props;
    /**
     * Creates an instance of Draggable.
     * @param {Element} el
     * @param {Props} [options]
     * @memberof Draggable
     */
    constructor(el: Element, options?: Props);
    destroy(): void;
}
export default Draggable;
