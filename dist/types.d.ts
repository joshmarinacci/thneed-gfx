type EventCategory = string;
type EventType = string;
type EventDirection = "down" | "up";
declare class CoolEvent {
    type: EventType;
    category: EventCategory;
    timestamp: number;
    details: any;
    ctx: SurfaceContext;
    target: any;
    direction: EventDirection;
    stopped: any;
    constructor(ctx: SurfaceContext, category: EventCategory, type: EventType);
}
type Modifiers = {
    shift: boolean;
    alt: boolean;
    ctrl: boolean;
    meta: boolean;
};
type Callback = (any: any) => any;
declare class Point {
    x: number;
    y: number;
    constructor(x: any, y: any);
    translate(x: number, y: number): Point;
    divide_floor(scale: number): Point;
    add(pt: Point): Point;
    set(x: number, y: number): void;
    copy_from(pt: Point): void;
    clone(): Point;
    subtract(trans: Point): Point;
    toString(): String;
}
declare class Rect {
    x: number;
    y: number;
    w: number;
    h: number;
    constructor(x: any, y: any, w: any, h: any);
    contains(pt: Point): boolean;
    bottom(): number;
    right(): number;
    shrink(v: number): Rect;
}
declare class Size {
    w: number;
    h: number;
    constructor(w: any, h: any);
    shrink(pad: number): Size;
    grow(pad: number): Size;
    subtract(delta: Point): Size;
    add(delta: Point): Size;
    contains(cursor: Point): boolean;
    toString(): String;
    equals(s: Size): boolean;
}
declare class KeyboardEvent extends CoolEvent {
    key: string;
    code: string;
    modifiers: Modifiers;
    constructor(surface: SurfaceContext, type: EventType);
}
interface View {
    hflex(): boolean;
    vflex(): boolean;
    size(): Size;
    set_size(size: Size): any;
    position(): Point;
    set_position(point: Point): any;
    layout(g: SurfaceContext, available: Size): Size;
    draw(g: SurfaceContext): void;
    visible(): boolean;
    input(event: CoolEvent): void;
    on(type: string, cb: Callback): void;
    off(type: string, cb: Callback): void;
    name(): string;
}
declare class Sprite {
    id: string;
    name: string;
    w: number;
    h: number;
    data: number[];
    _img: HTMLCanvasElement;
    constructor(id: string, name: string, w: number, h: number, doc: Doc);
    forEachPixel(cb: (val: any, i: number, j: number) => void): void;
    set_pixel(x: number, y: number, color: any): void;
    sync(): void;
    get_pixel(x: number, y: number): any;
    toJsonObj(): object;
}
declare class Tilemap {
    id: string;
    name: string;
    w: number;
    h: number;
    data: number[];
    constructor(id: any, name: any, w: any, h: any);
    forEachPixel(cb: (val: any, i: number, j: number) => void): void;
    expand_width(number: number): void;
    set_pixel(x: number, y: number, color: any): void;
    get_pixel(x: number, y: number): any;
    toJsonObj(): {
        clazz: string;
        id: string;
        name: string;
        w: number;
        h: number;
        data: number[];
    };
}
type CB = (any: any) => void;
type Etype = "change" | "reload" | "structure" | 'main-selection' | 'palette-change';
declare class Observable {
    listeners: Map<Etype, Array<CB>>;
    constructor();
    addEventListener(etype: Etype, cb: CB): void;
    fire(etype: Etype, payload: any): void;
}
declare class Sheet {
    sprites: Sprite[];
    name: string;
    constructor(id: string, name: string);
    add(sprite: Sprite): void;
    toJsonObj(): {
        clazz: string;
        id: string;
        name: string;
        sprites: object[];
    };
}
type GlyphMeta = {
    codepoint: number;
    left: number;
    right: number;
    baseline: number;
};
declare class SpriteGlyph extends Sprite {
    meta: GlyphMeta;
    constructor(id: any, name: any, w: any, h: any, doc: Doc);
    sync(): void;
    toJsonObj(): object;
}
declare class SpriteFont {
    glyphs: SpriteGlyph[];
    name: string;
    constructor(id: any, name: any, doc: Doc);
    toJsonObj(): {
        clazz: string;
        id: string;
        name: string;
        glyphs: object[];
    };
    add(spriteGlyph: SpriteGlyph): void;
    set_selected_glyph_index(val: number): void;
    selected_glyph_index(): number;
    get_selected_glyph(): SpriteGlyph;
    set_selected_glyph(target: SpriteGlyph): void;
}
declare class Doc extends Observable {
    sheets: Sheet[];
    fonts: SpriteFont[];
    maps: Tilemap[];
    selected_tree_item: any;
    constructor();
    get_color_palette(): string[];
    set_palette(palette: string[]): void;
    set_selected_color(value: number): void;
    get_selected_color(): number;
    get_selected_tile_index(): number;
    set_selected_tile_index(val: number): void;
    get_selected_sheet(): Sheet;
    set_selected_sheet(target: Sheet): void;
    get_selected_tile(): Sprite;
    get_selected_map(): Tilemap;
    set_selected_map(target: Tilemap): void;
    get_selected_font(): SpriteFont;
    set_selected_font(target: SpriteFont): void;
    get_font_palette(): string[];
    get_map_grid_visible(): boolean;
    set_map_grid_visible(visible: boolean): void;
    toJsonObj(): {
        version: number;
        name: string;
        color_palette: string[];
        sheets: {
            clazz: string;
            id: string;
            name: string;
            sprites: object[];
        }[];
        fonts: {
            clazz: string;
            id: string;
            name: string;
            glyphs: object[];
        }[];
        maps: {
            clazz: string;
            id: string;
            name: string;
            w: number;
            h: number;
            data: number[];
        }[];
    };
    reset_from_json(data: any): void;
    dirty(): boolean;
    mark_dirty(): void;
    persist(): void;
    check_backup(): void;
    set_selected_tree_item_index(y: number): void;
    set_selected_tree_item(item: any): void;
    find_tilemap_by_name(name: string): Tilemap;
    set_name(text: string): void;
    name(): string;
    find_sheet_by_name(name: string): Sheet;
}
declare function log(...args: any[]): void;
interface SurfaceContext {
    size(): Size;
    root(): View;
    set_root(root: View): any;
    repaint(): any;
    clear(): any;
    fill(rect: Rect, color: string): any;
    stroke(rect: Rect, color: string): any;
    fillBackgroundSize(size: Size, color: string): any;
    strokeBackgroundSize(size: Size, color: string): any;
    measureText(caption: string, font_name?: string): Size;
    fillStandardText(caption: string, x: number, y: number, font_name?: string, scale?: number): any;
    draw_glyph(codepoint: number, x: number, y: number, font_name: string, fill: string, scale?: number): any;
    keyboard_focus(): View;
    set_keyboard_focus(view: View): any;
    is_keyboard_focus(view: View): any;
    release_keyboard_focus(view: View): any;
    view_to_local(pt: Point, view: View): Point;
    find_by_name(name: string): View | null;
}
export class CanvasSurface implements SurfaceContext {
    size(): Size;
    ctx: CanvasRenderingContext2D;
    debug: boolean;
    protected _keyboard_focus: View;
    constructor(w: number, h: number, scale?: number);
    addToPage(): void;
    set_root(root: View): void;
    root(): View;
    repaint(): void;
    clear(): void;
    fill(rect: Rect, color: string): void;
    stroke(rect: Rect, color: string): void;
    fillBackgroundSize(size: Size, color: string): void;
    strokeBackgroundSize(size: Size, color: string): void;
    fillRect(x: number, y: number, w: number, h: number, color: string): void;
    propagateKeyboardEvent(evt: KeyboardEvent, path: View[]): void;
    keyboard_focus(): View;
    set_keyboard_focus(view: View): void;
    is_keyboard_focus(view: View): boolean;
    release_keyboard_focus(view: View): void;
    on_input(cb: Callback): void;
    measureText(caption: string, font_name?: string): Size;
    fillStandardText(caption: string, x: number, y: number, font_name?: string, scale?: number): void;
    draw_glyph(codepoint: number, x: number, y: number, font_name: string, fill: string, scale?: number): void;
    load_jsonfont(basefont_data: any, name: string, ref_name: string): void;
    draw_sprite(x: number, y: number, sprite: Sprite, scale: number): void;
    draw_tilemap(tilemap: Tilemap, sheet: Sheet, x: number, y: number, scale: number): void;
    find_by_name(name: string): View | null;
    local_to_view(pt: Point, view: View): Point;
    view_to_local(pt: Point, view: View): Point;
    start(): void;
}

//# sourceMappingURL=types.d.ts.map
