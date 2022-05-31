import {SurfaceContext} from "./canvas";

type EventCategory = string
type EventType = string
type EventDirection = "down" | "up"

export class CoolEvent {
    type:EventType
    category:EventCategory
    timestamp:number
    details:any
    ctx:SurfaceContext
    target:any
    direction:EventDirection
    stopped: any;

    constructor(ctx: SurfaceContext, category:EventCategory, type:EventType) {
        this.ctx = ctx
        this.category = category
        this.type = type
    }
}

export type Modifiers = {
    shift:boolean
    alt:boolean
    ctrl:boolean
    meta:boolean
}

export const POINTER_CATEGORY:EventCategory = "POINTER_CATEGORY"
export const POINTER_MOVE:EventType = "POINTER_MOVE"
export const POINTER_DRAG:EventType = "POINTER_DRAG"
export const POINTER_DOWN:EventType = "POINTER_DOWN"
export const POINTER_UP:EventType = "POINTER_UP"
export const PRIMARY_BUTTON:number = 0
export const SECONDARY_BUTTON:number = 2

export function gen_id(prefix: string) {
    return `${prefix}_${Math.floor(Math.random() * 100000)}`
}

export type Callback = (any) => any;

export class SuperArray {
    private data: any[];

    constructor() {
        this.data = []
    }

    clear() {
        this.data = []
    }

    push_end(value: any) {
        this.data.push(value)
    }

    length() {
        return this.data.length
    }

    pop_start() {
        return this.data.shift()
    }

    forEach(cb: Callback) {
        // @ts-ignore
        this.data.forEach((v, i) => cb(v, i))
    }
}

export class Point {
    x: number
    y: number

    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    translate(x: number, y: number) {
        return new Point(this.x - x, this.y - y)
    }

    divide_floor(scale: number) {
        return new Point(
            Math.floor(this.x / scale),
            Math.floor(this.y / scale)
        )
    }

    add(pt: Point) {
        return new Point(
            this.x + pt.x,
            this.y + pt.y,
        )
    }

    set(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    copy_from(pt: Point) {
        this.x = pt.x
        this.y = pt.y
    }

    clone() {
        return new Point(this.x, this.y)
    }

    subtract(trans: Point) {
        return new Point(
            this.x - trans.x,
            this.y - trans.y
        )
    }

    magnitude() {
        return Math.sqrt(this.x*this.x + this.y*this.y)
    }

    divide(val:number) {
        return new Point(this.x/val, this.y/val)
    }

    scale(val:number) {
        return new Point(this.x*val, this.y*val)
    }
    unit() {
        return this.divide(this.magnitude())
    }

    toString(): String {
        return `Point(${this.x},${this.y})`
    }
}

export class Rect {
    x: number;
    y: number;
    w: number;
    h: number;

    constructor(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }

    contains(pt: Point): boolean {
        if (pt.x < this.x) return false;
        if (pt.y < this.y) return false;
        if (pt.x >= this.x + this.w) return false;
        if (pt.y >= this.y + this.h) return false;
        return true;
    }

    bottom() {
        return this.y + this.h;
    }

    right() {
        return this.x + this.w;
    }

    shrink(v: number): Rect {
        return new Rect(this.x + v, this.y + v, this.w - v - v, this.h - v - v)
    }
    position() {
        return new Point(this.x,this.y)
    }
    center() {
        return new Point(this.x+this.w/2,this.y+this.h/2)
    }

    add_position(pt:Point) {
        this.x += pt.x
        this.y += pt.y
    }

    intersects(rect:Rect) {
        if(this.contains(new Point(rect.x,rect.y))) return true
        if(this.contains(new Point(rect.x,rect.y+rect.h))) return true
        if(this.contains(new Point(rect.x+rect.w,rect.y))) return true
        if(this.contains(new Point(rect.x+rect.w,rect.y+rect.h))) return true
        return false
    }

}

export class Size {
    w: number;
    h: number;

    constructor(w, h) {
        this.w = w
        this.h = h
    }

    shrink(pad: number) {
        return new Size(this.w - pad * 2, this.h - pad * 2)
    }

    grow(pad: number) {
        return new Size(this.w + pad * 2, this.h + pad * 2)
    }

    subtract(delta: Point) {
        return new Size(this.w - delta.x, this.h - delta.y)
    }

    add(delta: Point) {
        return new Size(this.w + delta.x, this.h + delta.y)
    }

    contains(cursor: Point): boolean {
        if (cursor.x < 0) return false
        if (cursor.y < 0) return false
        if (cursor.x > this.w) return false
        if (cursor.y > this.h) return false
        return true
    }

    toString(): String {
        return `${this.w}x${this.h}`
    }

    equals(s: Size) {
        return this.w === s.w && this.h === s.h
    }
}

export class PointerEvent extends CoolEvent {
    position:Point
    delta:Point
    button:number
    modifiers:Modifiers

    constructor(ctx:SurfaceContext, type: EventType, position: Point, delta:Point) {
        super(ctx, POINTER_CATEGORY, type);
        this.position = position
        this.delta = delta
        this.direction = 'down'
    }
}

export const KEYBOARD_CATEGORY:EventCategory = "KEYBOARD_CATEGORY"
export const KEYBOARD_DOWN:EventType = 'KEYBOARD_DOWN'
export const KEYBOARD_UP:EventType = 'KEYBOARD_UP'
export class KeyboardEvent extends CoolEvent {
    key:string
    code:string
    modifiers:Modifiers
    constructor(surface: SurfaceContext, type:EventType) {
        super(surface, KEYBOARD_CATEGORY, type);
    }
}

export const SCROLL_CATEGORY:EventCategory = "SCROLL_CATEGORY"
export const SCROLL_EVENT:EventType = "SCROLL_EVENT"
export class ScrollEvent extends CoolEvent {
    delta:Point
    position:Point
    modifiers:Modifiers

    constructor(surface: SurfaceContext, type: EventType, position: Point, delta: Point) {
        super(surface, SCROLL_CATEGORY, type)
        this.position = position
        this.delta = delta
    }
}

export const FOCUS_CATEGORY:EventCategory = "FOCUS_CATEGORY"
export const FOCUS_GAINED:EventType = "FOCUS_GAINED"
export const FOCUS_LOST:EventType = "FOCUS_LOST"
export class FocusEvent extends CoolEvent {
    constructor(surface: SurfaceContext, FOCUS_GAINED: EventType) {
        super(surface, FOCUS_CATEGORY, FOCUS_GAINED);
    }
}

export const COMMAND_CATEGORY:EventCategory = "COMMAND_CATEGORY"
export const COMMAND_ACTION:EventType = "action"
export class CommandEvent extends CoolEvent {
    constructor(ctx: SurfaceContext, type: EventType, target: any) {
        super(ctx, COMMAND_CATEGORY, type);
        this.target = target
    }
}
export const COMMAND_CHANGE:EventType = "change"
export type Action = { caption: string }

export const CLIPBOARD_CATEGORY:EventCategory = "CLIPBOARD_CATEGORY"
export const CLIPBOARD_COPY:EventType = "ClipboardCopy"
export const CLIPBOARD_CUT:EventType = "ClipboardCut"
export const CLIPBOARD_PASTE:EventType = "ClipboardPaste"
export class ClipboardEvent extends CoolEvent {
    content:any
    mimetype:string
}

export interface View {
    hflex(): boolean
    vflex(): boolean
    size():Size
    set_size(size:Size)
    position():Point
    set_position(point:Point)
    layout(g: SurfaceContext, available: Size): Size
    draw(g: SurfaceContext): void
    visible(): boolean
    input(event: CoolEvent): void
    on(type: string, cb: Callback): void
    off(type: string, cb: Callback): void
    name(): string
}

export interface ParentView {
    is_parent_view(): boolean,

    get_children(): View[]
    find_child(id:string):View|null

    clip_children(): boolean,
    // should the parent be counted as a mouse focus
    can_receive_mouse(): boolean

}

export abstract class BaseParentView implements View, ParentView {
    protected _hflex: boolean
    protected _vflex: boolean
    id: string
    protected _visible: boolean
    protected _children: View[]
    private _listeners: Map<string, Callback[]>
    protected _name: string
    private _size: Size;
    private _position: Point;

    constructor(id: string) {
        this.id = id
        this._size = new Size(100,100)
        this._position = new Point(0,0)
        this._children = []
        this._name = 'unnamed'
        this._listeners = new Map<string, Callback[]>()
        this._visible = true
        this._hflex = false
        this._vflex = false
    }

    hflex(): boolean {
        return this._hflex
    }
    set_hflex(hflex) {
        this._hflex = hflex
    }
    vflex(): boolean {
        return this._vflex
    }
    set_vflex(vflex) {
        this._vflex = vflex
    }

    protected log(...args) {
        console.log(this.name(), ...args)
    }

    size():Size {
        return this._size
    }
    set_size(size: Size) {
        this._size = size
    }
    position(): Point {
        return this._position
    }
    set_position(point: Point) {
        this._position = point
    }

    clip_children(): boolean {
        return false;
    }

    draw(g: SurfaceContext): void {
    }

    get_children(): View[] {
        return this._children
    }
    find_child(id: string): View|null {
        // @ts-ignore
        return this.get_children().find((ch:View) => ch.id === id)
    }

    add(view: View) {
        this._children.push(view)
    }

    remove(view: View) {
        this._children = this._children.filter(ch => ch !== view)
    }

    input(event: CoolEvent): void {
    }

    is_parent_view(): boolean {
        return true
    }

    name(): string {
        return this._name
    }
    set_name(name:string) {
        this._name = name
    }


    on(type: string, cb: Callback) {
        this._get_listeners(type).push(cb)
    }

    off(type: string, cb: Callback) {
        this._listeners.set(type, this._get_listeners(type).filter(c => c != cb))
    }

    fire(type: string, payload: any) {
        this._get_listeners(type).forEach(cb => cb(payload))
    }

    visible(): boolean {
        return this._visible
    }

    abstract layout(g: SurfaceContext, available: Size): Size

    private _get_listeners(type: string) {
        if (!this._listeners.has(type)) this._listeners.set(type, [])
        return this._listeners.get(type)
    }

    can_receive_mouse(): boolean {
        return false;
    }
}

export abstract class BaseView implements View {
    protected _hflex: boolean;
    protected _vflex: boolean;
    protected _visible: boolean
    protected _name: string
    private _listeners: Map<string, Callback[]>
    protected id: string;
    private _size: Size;
    private _position: Point;

    constructor(id: string) {
        this.id = id
        this._size = new Size(100,100)
        this._position = new Point(0,0)
        this._visible = true
        this._name = 'unnamed'
        this._listeners = new Map<string, Callback[]>()
        this._hflex = false
        this._vflex = false
    }

    hflex(): boolean {
        return this._hflex
    }
    vflex(): boolean {
        return this._vflex
    }

    protected log(...args) {
        console.log(`${this.name()}:`, ...args)
    }

    private _get_listeners(type: string) {
        if (!this._listeners.has(type)) this._listeners.set(type, [])
        return this._listeners.get(type)
    }

    on(type: string, cb: Callback) {
        this._get_listeners(type).push(cb)
    }

    off(type: string, cb: Callback) {
        this._listeners.set(type, this._get_listeners(type).filter(c => c != cb))
    }

    fire(type: string, payload: any) {
        this._get_listeners(type).forEach(cb => cb(payload))
    }

    size():Size {
        return this._size
    }
    set_size(size: Size) {
        this._size = size
    }
    position(): Point {
        return this._position
    }
    set_position(point: Point) {
        this._position = point
    }

    input(event: CoolEvent): void {
    }

    name(): string {
        return this._name
    }
    set_name(name:string) {
        this._name = name
    }

    visible(): boolean {
        return this._visible
    }

    abstract layout(g: SurfaceContext, available: Size): Size

    abstract draw(g: SurfaceContext): void
}

export function with_props(comp: View, json: any): View {
    if (!json) throw new Error("null json object")
    if (!comp) throw new Error("null component")
    Object.keys(json).forEach((key: string) => {
        //already handled type
        if (key === 'type') return
        //handle children separately
        if (key === 'children') return
        //id is a property instead of a setter
        if (key === 'id') {
            // @ts-ignore
            comp.id = json.id
            return
        }
        let setter = `set_${key}`
        // console.log("setting",key,setter)
        if (comp[setter]) {
            comp[setter](json[key])
        } else {
            console.log("no setter", setter)
        }
    })
    return comp
}

export function with_action(view: View, cb: Callback): View {
    view.on(COMMAND_ACTION, cb)
    return view
}