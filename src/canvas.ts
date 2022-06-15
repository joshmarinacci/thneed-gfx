import {StandardTextHeight, StandardTextStyle, TextColor} from "./style";
import {
    Callback,
    FOCUS_GAINED,
    FOCUS_LOST,
    FocusEvent,
    KEYBOARD_DOWN,
    KEYBOARD_UP,
    KeyboardEvent, Modifiers,
    ParentView, Point,
    POINTER_DOWN,
    POINTER_DRAG, POINTER_MOVE,
    POINTER_UP,
    PointerEvent, Rect,
    SCROLL_EVENT,
    ScrollEvent, Size,
    View
} from "./core";
import {Sheet, Sprite, SpriteGlyph, Tilemap} from "./sprites";

export function log(...args) {
    console.log('SNAKE:', ...args);
}

const CLEAR_COLOR = '#f0f0f0'

export function rect_from_pos_size(point: Point, size: Size) {
    return new Rect(
        point.x,
        point.y,
        size.w,
        size.h
    )
}

export class MouseInputService {
    private surface: SurfaceContext;
    private down: boolean;
    private path: [];
    private last_point: Point;
    private target: never;
    constructor(surface: SurfaceContext) {
        this.surface = surface
        this.down = false
        this.last_point = new Point(0,0)
    }
    trigger_mouse_down(position:Point, button:number) {
        this.log("trigger_mouse_down")
        this.down = true;
        this.last_point = position
        this.path = this.scan_path(position)
        this.target = this.path[this.path.length-1] // last
        let evt = new PointerEvent(this.surface, POINTER_DOWN, position, new Point(0,0))
        evt.button = button
        evt.target = this.target
        this.log("event is", evt)
        this.log("path is",this.path)
        this.propagatePointerEvent(evt,this.path)
        this.surface.repaint()
    }

    trigger_mouse_move(position: Point, button: number) {
        let delta = position.subtract(this.last_point)
        this.last_point = position.clone()
        let evt
        if(this.down) {
            evt = new PointerEvent(this.surface, POINTER_DRAG, position, delta)
        } else {
            this.path = this.scan_path(position)
            evt = new PointerEvent(this.surface, POINTER_MOVE, position, delta)
        }
        evt.button = button
        evt.target = this.path[this.path.length - 1] // last
        this.propagatePointerEvent(evt, this.path)
        this.surface.repaint()
    }

    trigger_mouse_up(position: Point, button: number) {
        this.log("trigger_mouse_up")
        this.down = false
        let evt = new PointerEvent(this.surface, POINTER_UP, position, new Point(0,0))
        evt.button = button
        evt.target = this.path[this.path.length-1] // last
        this.log("event is", evt)
        this.log("path is",this.path)
        this.propagatePointerEvent(evt,this.path)
        this.surface.repaint()
    }

    trigger_scroll(position:Point, delta:Point) {
        this.path = this.scan_path(position)
        let evt = new ScrollEvent(this.surface, SCROLL_EVENT, position, delta)
        this.propagateScrollEvent(evt,this.path)
    }

    private calculate_path_to_cursor(view: View, position: Point, path:View[]):boolean {
        // this.log('searching for',position,'on',view.name())
        if(!view) return false
        if (!view.visible()) return false
        let bounds = rect_from_pos_size(view.position(),view.size())
        if (bounds.contains(position)) {
            // @ts-ignore
            if (view.is_parent_view && view.is_parent_view()) {
                let parent = view as unknown as ParentView;
                // go in reverse order to the top drawn children are picked first
                for (let i = parent.get_children().length-1; i >= 0; i--) {
                    let ch = parent.get_children()[i]
                    let pos = position.subtract(view.position())
                    let picked = this.calculate_path_to_cursor(ch,pos,path)
                    if(picked) {
                        path.unshift(ch)
                        return true
                    }
                }
                if(parent.can_receive_mouse()) {
                    return true
                }
            } else {
                return true
            }
        }
        return false
    }

    private log(...args) {
        console.log('MouseService:',...args)
    }

    private scan_path(position: Point) {
        let path:[] = []
        this.calculate_path_to_cursor(this.surface.root(),position,path)
        // this.log("final path is",path)
        return path
    }

    private propagatePointerEvent(evt: PointerEvent, path: []) {
        let stopped = false
        let pt = evt.position

        path.forEach((view:View) => {
            if(stopped) {
                this.log("done")
                return
            }
            // this.log("down: view",view.name())
            evt.position = evt.position.subtract(view.position())
            view.input(evt)
            if(evt.stopped) {
                stopped = true
            }
        })
    }

    private propagateScrollEvent(evt: ScrollEvent, path: []) {
        let stopped = false
        let pt = evt.position.clone()
        evt.direction = "down"
        path.forEach((view:View) => {
            if(stopped) {
                return
            }
            evt.position = evt.position.subtract(view.position())
            view.input(evt)
            if(evt.stopped) {
                stopped = true
            }
        })
        if(stopped) return;
        path.reverse()
        evt.direction = "up"
        path.forEach((view:View) => {
            if(stopped) {
                // this.log("done")
                return
            }
            evt.position = evt.position.add(view.position())
            view.input(evt)
            if(evt.stopped) {
                stopped = true
            }
        })
    }

}

class KeyboardInputService {
    private surface: CanvasSurface;
    private log(...args) {
        console.log('KeyboardService:',...args)
    }
    constructor(surface:CanvasSurface) {
        this.surface = surface
    }

    dispatch_keyboard_focus_change(old_focus: View, new_focus: View) {
        let e_old = new FocusEvent(this.surface, FOCUS_LOST)
        //send focus lost to old focus
        if(old_focus) old_focus.input(e_old)
        //send focus gained to new focus
        let e_new = new FocusEvent(this.surface, FOCUS_GAINED)
        if(new_focus) new_focus.input(e_new)
        //don't use a path, no one can intercept?
    }

    private calculate_path_to_keyboard_focus(root:View, target: View): View[]|boolean {
        if(!root) return false
        if(!root.visible()) return false
        if(root === target) return [root]
        // @ts-ignore
        if (root.is_parent_view && root.is_parent_view()) {
            let parent = root as unknown as ParentView;
            for (let i = parent.get_children().length-1; i >= 0; i--) {
                let ch = parent.get_children()[i]
                // this.log('checking child',ch)
                let res = this.calculate_path_to_keyboard_focus(ch,target)
                if(res) {
                    (res as View[]).unshift(root)
                    return res as View[]
                }
            }
        }
    }

    trigger_key_down(key: string, code: string, modifiers: Modifiers) {
        let evt = new KeyboardEvent(this.surface, KEYBOARD_DOWN)
        evt.key = key
        evt.code = code
        evt.modifiers = modifiers
        let path = this.calculate_path_to_keyboard_focus(this.surface.root(),this.surface.keyboard_focus()) as View[]
        this.surface.propagateKeyboardEvent(evt, path)
        this.surface.repaint()
    }

    trigger_key_up(key: string, code: string, modifiers: Modifiers) {
        let evt = new KeyboardEvent(this.surface, KEYBOARD_UP)
        evt.key = key
        evt.code = code
        evt.modifiers = modifiers
        let path = this.calculate_path_to_keyboard_focus(this.surface.root(),this.surface.keyboard_focus()) as View[]
        this.surface.propagateKeyboardEvent(evt, path)
        this.surface.repaint()

    }
}

export interface SurfaceContext {
    size():Size;
    root():View;
    set_root(root:View);
    repaint();
    clear();
    fill(rect: Rect, color: string);
    stroke(rect: Rect, color: string);
    fillBackgroundSize(size:Size, color: string);
    strokeBackgroundSize(size: Size, color: string);
    measureText(caption: string, font_name?:string):Size;
    fillStandardText(caption: string, x: number, y: number, font_name?:string, scale?:number);
    fillText(caption: string, pt:Point, color:string, font_name?:string, scale?:number);
    draw_glyph(codepoint: number, x:number, y:number, font_name: string, fill: string, scale?:number);
    set_sprite_scale(scale:number);
    set_smooth_sprites(sprite_smoothing:boolean)
    draw_sprite(pt:Point, sprite: Sprite);

    keyboard_focus():View;
    set_keyboard_focus(view:View);
    is_keyboard_focus(view:View);
    release_keyboard_focus(view:View);
    view_to_local(pt: Point, view: View):Point;
    find_by_name(name:string):View|null;
}
export class CanvasSurface implements SurfaceContext {
    private w: number;
    private h: number;
    private _sprite_scale: number;
    private _sprite_smooth: boolean;

    size(): Size {
        return new Size(this.w,this.h)
    }

    private canvas: HTMLCanvasElement;
    private _root: View;
    ctx: CanvasRenderingContext2D;
    debug: boolean;
    private scale: number;
    private _input_callback: Callback;
    protected _keyboard_focus: View;
    private fonts:Map<string,CanvasFont>
    private global_smoothing = true
    private _pointer_target: View|null;
    private mouse: MouseInputService;
    private keyboard: KeyboardInputService;

    constructor(w: number, h: number, scale?:number) {
        this.log("making canvas ",w,h)
        this.w = w;
        this.h = h;
        this.scale = this.scale || 1
        this._sprite_scale = 1
        this._sprite_smooth = true
        this.canvas = document.createElement('canvas');
        this.canvas.width = w * window.devicePixelRatio * this.scale
        this.canvas.height = h * window.devicePixelRatio * this.scale
        this.log("real canvas is",this.canvas.width,this.canvas.height)
        this.canvas.setAttribute('tabindex', '0');
        //turn this on for high-dpi support
        this.canvas.style.width = `${this.w * this.scale}px`
        this.canvas.style.height = `${this.h * this.scale}px`
        this.log("canvas style = ", this.canvas.style)
        this.ctx = this.canvas.getContext('2d');
        this.debug = false;
        this.clear()
        this.fonts = new Map()
        this._pointer_target = null
    }

    addToPage() {
        document.body.appendChild(this.canvas);
    }
    set_root(root: View) {
        this._root = root;
    }
    root():View {
        return this._root
    }

    repaint() {
        if(this.debug) console.time("repaint");
        this.layout_stack();
        this.clear();
        this.draw_stack()
        if(this.debug) console.timeEnd("repaint");
    }

    clear() {
        this.ctx.fillStyle = CLEAR_COLOR
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
    }

    private layout_stack() {
        if(!this._root) {
            console.warn("root is null")
        } else {
            let available_size = new Size(this.w,this.h)
            // this.log("layout_stack with size",available_size)
            let size = this._root.layout(this, available_size)
            // console.log("canvas, root requested",size)
        }
    }
    private draw_stack() {
        this.ctx.imageSmoothingEnabled = this.global_smoothing
        this.ctx.save();
        this.ctx.translate(0.5, 0.5);
        this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
        this.ctx.scale(this.scale, this.scale)
        this.debug_draw_rect(new Rect(0, 0, this.w - 1, this.h - 1), 'canvas')
        if(this._root) this.draw_view(this._root)
        this.ctx.restore()
    }

    private draw_view(view: View) {
        this.ctx.save();
        let pos = view.position()
        this.ctx.translate(pos.x, pos.y)
        // @ts-ignore
        // console.log("drawing",view.id,view.name())
        if(view.visible()) {
            view.draw(this);
        }
        // @ts-ignore
        if (view.is_parent_view && view.is_parent_view() && view.visible()) {
            let parent = view as unknown as ParentView;
            if(parent.clip_children()) {
                this.ctx.beginPath()
                let size = view.size()
                this.ctx.rect(0,0,size.w,size.h);
                this.ctx.clip()
            }
            parent.get_children().forEach(ch => {
                if (this.debug) {
                    this.ctx.save();
                }
                this.draw_view(ch);
                if (this.debug) {
                    this.ctx.restore()
                }
            })
        }
        let bds = rect_from_pos_size(view.position(),view.size())
        // @ts-ignore
        this.debug_draw_rect(bds, view.name())
        this.ctx.restore()
    }

    fill(rect: Rect, color: string) {
        this.ctx.fillStyle = color
        this.ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
    }

    stroke(rect: Rect, color: string) {
        this.ctx.lineWidth = 1 * this.scale
        this.ctx.strokeStyle = color
        this.ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
    }
    fillBackgroundSize(size:Size, color: string) {
        this.ctx.fillStyle = color
        this.ctx.fillRect(0, 0, size.w, size.h);
    }
    strokeBackgroundSize(size: Size, color: string) {
        this.ctx.strokeStyle = color
        this.ctx.strokeRect(0,0, size.w, size.h);
    }
    private debug_draw_rect(bds: Rect, title: string) {
        if (!this.debug) return
        this.ctx.strokeStyle = 'black'
        this.ctx.lineWidth = 0.5;
        let cx = bds.x + bds.w/2
        let cy = bds.y + bds.h/2
        for (let i = 0; i < 3; i++) {
            this.ctx.beginPath()
            this.ctx.strokeStyle = (i % 2 === 1) ? 'red' : 'black'
            this.ctx.rect(bds.x + i, bds.y + i, bds.w - i * 2, bds.h - i * 2);
            this.ctx.stroke()
        }
        let str = `${title} (${bds.x.toFixed(1)},${bds.y.toFixed(1)}) (${bds.w.toFixed(1)}x${bds.h.toFixed(1)})`
        for (let i = 0; i < 3; i++) {
            this.ctx.font = '10px sans-serif';
            this.ctx.fillStyle = 'white'
            this.ctx.fillText(str, cx+3 + i, cy+3 + i)
        }
        for (let i = 0; i < 1; i++) {
            this.ctx.font = '10px sans-serif';
            this.ctx.fillStyle = 'black'
            this.ctx.fillText(str, cx+3 + i + 1, cy+3 + i + 1)
        }
    }
    fillRect(x: number, y: number, w: number, h: number, color: string) {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x,y,w,h)
    }
    private screen_to_local(evt: MouseEvent):Point {
        let rect = this.canvas.getBoundingClientRect();
        let pt = new Point(evt.x-rect.x,evt.y-rect.y);
        pt.x /= this.scale
        pt.y /= this.scale
        return pt
    }

    propagateKeyboardEvent(evt: KeyboardEvent, path:View[]) {
        if(this._input_callback) this._input_callback(evt)
        if(!this._keyboard_focus) {
            // if(this._input_callback) this._input_callback(evt)
            return
        }
        if(!path) {
            this.log("no path, can't propagate")
            return
        }
        let stopped = false
        path.forEach((view:View) => {
            if(stopped) {
                this.log("bailing out early")
                return
            }
            view.input(evt)
            if(evt.stopped) stopped = true
        })
        // if(this._keyboard_focus) this._keyboard_focus.input(evt)
        // if(this._input_callback) this._input_callback(evt)
    }

    keyboard_focus(): View {
        return this._keyboard_focus
    }
    set_keyboard_focus(view:View) {
        let old = this._keyboard_focus
        this._keyboard_focus = view
        this.keyboard.dispatch_keyboard_focus_change(old,this._keyboard_focus)
    }
    is_keyboard_focus(view:View) {
        return view === this._keyboard_focus
    }
    release_keyboard_focus(view:View) {
        this._keyboard_focus = null
    }

    on_input(cb: Callback) {
        this._input_callback = cb
    }

    measureText(caption: string, font_name?:string):Size {
        if(font_name && this.fonts.has(font_name)) {
            let font = this.fonts.get(font_name)
            if(font) {
                return font.measureText(caption)
            }
        }
        this.ctx.font = StandardTextStyle
        let metrics = this.ctx.measureText(caption)
        if('fontBoundingBoxAscent' in metrics) {
            return new Size(metrics.width, metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent);
        }
        return new Size(metrics.width, 16);
    }
    fillStandardText(caption: string, x: number, y: number, font_name?:string, scale?:number) {
        if(!scale) scale = 1
        if(font_name && this.fonts.has(font_name)) {
            let font = this.fonts.get(font_name)
            if(font) {
                font.fillText(this.ctx,caption,x,y-StandardTextHeight,scale)
                return
            }
        }
        this.ctx.fillStyle = TextColor
        this.ctx.font = StandardTextStyle
        this.ctx.fillText(caption,x, y)
    }
    fillText(caption: string, pt:Point, color:string, font_name?:string, scale?:number) {
        if(!scale) scale = 1
        if(font_name && this.fonts.has(font_name)) {
            let font = this.fonts.get(font_name)
            if(font) {
                font.fillText(this.ctx,caption,pt.x,pt.y-StandardTextHeight,scale)
                return
            }
        }
        this.ctx.fillStyle = color
        this.ctx.font = StandardTextStyle
        this.ctx.fillText(caption,pt.x,pt.y)
    }

    draw_glyph(codepoint: number, x:number, y:number, font_name: string, fill: string, scale?:number) {
        if(!scale) scale = 1
        this.ctx.fillStyle = fill
        if(font_name && this.fonts.has(font_name)) {
            let font = this.fonts.get(font_name)
            if(font) {
                font.draw_glpyh(this.ctx,codepoint,x,y,scale)
            }
        }
    }
    private log(...args) {
        console.log("CANVAS: ", ...args)
    }

    load_jsonfont(basefont_data: any, name:string, ref_name: string) {
        let fnt = basefont_data.fonts.find(ft => ft.name === name)
        this.fonts.set(ref_name,new CanvasFont(fnt))
    }

    set_sprite_scale(scale:number) {
        this._sprite_scale = scale
    }
    set_smooth_sprites(sprite_smoothing:boolean) {
        this._sprite_smooth = sprite_smoothing
    }
    draw_sprite(pt:Point, sprite: Sprite) {
        if(!sprite) {
            console.warn("sprite missing")
            return
        }
        this.ctx.imageSmoothingEnabled = this._sprite_smooth
        this.ctx.drawImage(sprite._img,pt.x,pt.y,sprite._img.width*this._sprite_scale,sprite._img.height*this._sprite_scale)
    }

    draw_tilemap(tilemap: Tilemap, sheet:Sheet, x: number, y: number, scale: number) {
        tilemap.forEachPixel((val,i,j) => {
            if (!val || val === 0) return;
            // let sheet = this.doc.get_selected_sheet()
            let tile = sheet.sprites.find((t:Sprite) => t.id ===val);
            this.ctx.imageSmoothingEnabled = false
            if(tile) {
                this.ctx.drawImage(tile._img,x+i*scale,y+j*scale, scale, scale)
            }
        })

    }

    public find_by_name(name: string):View|null {
        return this.find_by_name_view(this._root,name)
    }

    private find_by_name_view(view: View, name: string):View|null {
        if (view.name() === name) return view
        // @ts-ignore
        if (view.is_parent_view && view.is_parent_view()) {
            let parent = view as unknown as ParentView;
            // go in reverse order to the top drawn children are picked first
            for (let i = parent.get_children().length - 1; i >= 0; i--) {
                let ch = parent.get_children()[i]
                let res = this.find_by_name_view(ch,name)
                if(res) return res
            }
        }
        return null
    }

    public local_to_view(pt: Point, view: View) {
        let trans = this.calculate_transform_to(this._root,view)
        let f = pt.subtract(trans)
        return f
    }
    private calculate_transform_to(root:View,view:View):Point {
        if(root === view) {
            return root.position().clone()
        }
        // @ts-ignore
        if (root.is_parent_view && root.is_parent_view()) {
            let parent = root as unknown as ParentView;
            for(let i=0; i<parent.get_children().length; i++) {
                let ch = parent.get_children()[i]
                let ptx = this.calculate_transform_to(ch,view)
                if(ptx) {
                    return ptx.add(root.position())
                }
            }
        }
        return null
    }

    public view_to_local(pt: Point, view: View) {
        let trans = this.calculate_transform_to(this._root,view)
        return pt.add(trans)
    }

    private _setup_mouse_input() {
        this.mouse = new MouseInputService(this)
        this.canvas.addEventListener('contextmenu',(e)=>{
            e.preventDefault();
            return false;
        })
        this.canvas.addEventListener('mousedown',(domEvent:MouseEvent)=>{
            let position = this.screen_to_local(domEvent)
            this.mouse.trigger_mouse_down(position, domEvent.button)
            if(this._input_callback) this._input_callback({})
            domEvent.preventDefault()
        })
        this.canvas.addEventListener('mousemove',(domEvent:MouseEvent)=>{
            let position = this.screen_to_local(domEvent)
            this.mouse.trigger_mouse_move(position, domEvent.button)
            if(this._input_callback) this._input_callback({})
            domEvent.preventDefault()
        })
        this.canvas.addEventListener('mouseup',(domEvent:MouseEvent)=>{
            let position = this.screen_to_local(domEvent)
            this.mouse.trigger_mouse_up(position, domEvent.button)
            if(this._input_callback) this._input_callback({})
            domEvent.preventDefault()
        })
        this.canvas.addEventListener('wheel',(domEvent)=>{
            let position = this.screen_to_local(domEvent)
            let delta = new Point(domEvent.deltaX, domEvent.deltaY)
            this.mouse.trigger_scroll(position, delta)
            if(this._input_callback) this._input_callback({})
            domEvent.preventDefault()
        });
    }
    private _setup_keyboard_input() {
        this.keyboard = new KeyboardInputService(this)
        document.addEventListener('keydown',(e)=>{
            let modifiers:Modifiers = {
                alt: e.altKey,
                ctrl: e.ctrlKey,
                meta: e.metaKey,
                shift: e.shiftKey
            }
            this.keyboard.trigger_key_down(e.key, e.code, modifiers)
            if(!e.altKey && !e.metaKey) e.preventDefault()
        })
        document.addEventListener('keyup',(e) => {
            let modifiers:Modifiers = {
                alt: e.altKey,
                ctrl: e.ctrlKey,
                meta: e.metaKey,
                shift: e.shiftKey
            }
            this.keyboard.trigger_key_up(e.key, e.code, modifiers)
            if(!e.altKey && !e.metaKey) e.preventDefault()
        })
    }

    start() {
        this.addToPage()
        this._setup_mouse_input();
        this._setup_keyboard_input()
        this.repaint()
    }
}

class CanvasFont {
    private data: any;
    private metas:Map<number,SpriteGlyph>
    private scale = 2;
    constructor(data) {
        this.data = data
        this.metas = new Map()
        this.data.glyphs.forEach(gl => {
            this.generate_image(gl)
            this.metas.set(gl.meta.codepoint,gl)
        })
    }
    measureText(text) {
        let xoff = 0
        let h = 0
        for(let i=0; i<text.length; i++) {
            let cp = text.codePointAt(i)
            if(this.metas.has(cp)) {
                let glyph = this.metas.get(cp)
                let sw = glyph.w - glyph.meta.left - glyph.meta.right
                xoff += sw + 1
                h = Math.max(h,glyph.h)
            } else {
                xoff += 10
                h = Math.max(h,10)
            }
        }
        return new Size(xoff*this.scale,h*this.scale)
    }

    fillText(ctx:CanvasRenderingContext2D, text:string,x:number,y:number, scale?:number) {
        if(!scale) scale = 1
        ctx.fillStyle = 'red'
        let size = this.measureText(text)
        let xoff = 0
        let yoff = 2
        // ctx.fillRect(x+xoff, y+yoff, size.w, size.h)
        for (let i = 0; i < text.length; i++) {
            let cp = text.codePointAt(i)
            let dx = x + xoff*this.scale*scale
            if (this.metas.has(cp)) {
                let glyph = this.metas.get(cp)
                ctx.imageSmoothingEnabled = false
                //@ts-ignore
                let img = glyph.img
                let sx = glyph.meta.left
                let sy = 0
                let sw = glyph.w - glyph.meta.left - glyph.meta.right
                let sh = glyph.h //- glyph.meta.baseline
                let dy = y + (yoff+glyph.meta.baseline-1)*this.scale*scale
                let dw = sw*this.scale*scale
                let dh = sh*this.scale*scale
                ctx.drawImage(img, sx,sy,sw,sh, dx,dy, dw,dh)
                xoff += sw + 1
            } else {
                //missing the glyph
                let ew = 8
                let dy = y + (yoff)*this.scale*scale
                ctx.strokeRect(dx,dy,ew*this.scale*scale,ew*this.scale*scale)
                xoff += ew + 1

            }
        }
    }

    draw_glpyh(ctx:CanvasRenderingContext2D, cp:number, x:number, y:number, scale?:number) {
        let xoff = 0
        let yoff = 2
        if(this.metas.has(cp)) {
            let glyph = this.metas.get(cp)
            ctx.imageSmoothingEnabled = false
            //@ts-ignore
            let img = glyph.img
            let sx = glyph.meta.left
            let sy = 0
            let sw = glyph.w - glyph.meta.left - glyph.meta.right
            let sh = glyph.h //- glyph.meta.baseline
            let dx = x + xoff*this.scale*scale
            let dy = y + (yoff+glyph.meta.baseline-1)*this.scale*scale
            let dw = sw*this.scale*scale
            let dh = sh*this.scale*scale
            ctx.drawImage(img, sx,sy,sw,sh, dx,dy, dw,dh)
        }
    }

    private generate_image(gl) {
        gl.img = document.createElement('canvas')
        gl.img.width = gl.w
        gl.img.height = gl.h
        let c = gl.img.getContext('2d')
        c.fillStyle = 'green'
        c.fillRect(0,0,gl.img.width,gl.img.height)
        for (let j = 0; j < gl.h; j++) {
            for (let i = 0; i < gl.w; i++) {
                let n = j * gl.w + i;
                let v = gl.data[n];
                if(v %2 === 0) {
                    c.fillStyle = 'white'
                    // c.fillRect(i, j, 1, 1)
                    c.clearRect(i,j,1,1)
                }
                if(v%2 === 1) {
                    c.fillStyle = 'black'
                    c.fillRect(i, j, 1, 1)
                }
            }
        }
    }
}
