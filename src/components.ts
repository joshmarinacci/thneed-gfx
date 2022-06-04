import {CanvasSurface, SurfaceContext} from "./canvas";
import {
    ControlBG, SelectedColor, SelectedTextColor,
    StandardLeftPadding,
    StandardTextHeight, StandardTextStyle, TextColor
} from "./style";
import {
    Action,
    BaseView,
    Callback,
    COMMAND_ACTION,
    COMMAND_CHANGE,
    CommandEvent,
    CoolEvent,
    FOCUS_CATEGORY,
    gen_id,
    KEYBOARD_DOWN, KeyboardEvent,
    Point,
    POINTER_CATEGORY,
    POINTER_DOWN,
    POINTER_UP,
    PointerEvent, Rect,
    Size
} from "./core";
import {HBox, PopupContainer, VBox} from "./containers";

export class Label extends BaseView {
    protected _caption: string

    constructor(caption?: string) {
        super(gen_id("label"))
        this._name = 'label'
        this._caption = caption || "no caption"
    }
    caption():string {
        return this._caption
    }
    set_caption(caption:string) {
        this._caption = caption
    }

    draw(g: SurfaceContext): void {
        g.fillStandardText(this._caption, StandardLeftPadding, StandardTextHeight,'base');
    }

    layout(g: SurfaceContext, available: Size): Size {
        this.set_size(g.measureText(this._caption,'base').grow(StandardLeftPadding))
        return this.size()
    }
}

export class CustomLabel extends Label {
    private cb: Callback;
    constructor(text:string,cb:Callback) {
        super(text);
        this.cb = cb
    }
    override draw(ctx: SurfaceContext) {
        this._caption = this.cb({})
        super.draw(ctx);
    }
}
export class ActionButton extends BaseView {
    protected caption: string
    private active: boolean
    constructor(props?:any) {
        super(gen_id("button2"))
        this._name = 'button2'
        this.caption = 'no caption'
        if(props && props.caption) this.caption = props.caption
        this.active = false
    }
    set_caption(caption:string) {
        this.caption = caption
    }
    draw(g: SurfaceContext): void {
        g.fillBackgroundSize(this.size(),this.active?SelectedColor:ControlBG)
        g.strokeBackgroundSize(this.size(), TextColor)
        g.fillText(this.caption, new Point(StandardLeftPadding, StandardTextHeight),this.active?SelectedTextColor:TextColor, 'bas')
    }
    input(event:CoolEvent) {
        if(event.category !== POINTER_CATEGORY) return
        if(event.type === POINTER_DOWN) {
            this.active = true
        }
        if(event.type === POINTER_UP) {
            this.active = false
            let ae = new CommandEvent(event.ctx, COMMAND_ACTION, this)
            this.fire(ae.type, ae)
        }
    }
    layout(g: SurfaceContext, available: Size): Size {
        this.set_size(g.measureText(this.caption,'base').grow(StandardLeftPadding))
        return this.size()
    }
}

export abstract class BaseSelectButton extends BaseView {
    _caption: string
    _selected:boolean
    _active:boolean
    selected_icon: number;
    icon: number;
    constructor() {
        super(gen_id("base-button"))
        this._caption = 'no caption'
        this._selected = false;
        this.icon = -1
        this.selected_icon = -1
        this._active = false
    }
    selected():boolean {
        return this._selected
    }
    set_selected(sel:boolean) {
        this._selected = sel
    }
    caption() {
        return this._caption
    }
    set_caption(caption:string) {
        this._caption = caption
    }
    draw(g: SurfaceContext) {
        let x = StandardLeftPadding
        let y = StandardLeftPadding
        if(this.has_icon()) {
            g.draw_glyph(this._selected ? this.selected_icon : this.icon, x, y, 'base', 'black')
            x += 16 // glyph width
            x += StandardLeftPadding // space between text and glyph
        }
        g.fillText(this._caption, new Point(x, y+StandardTextHeight-2), this._active?SelectedTextColor:TextColor, 'base')
    }
    input(event: CoolEvent): void {
        if (event.type === POINTER_DOWN) {
            this._active = true
        }
        if (event.type === POINTER_UP) {
            this._active = false
            this._selected = !this._selected
            let ae = new CommandEvent(event.ctx, COMMAND_CHANGE, this)
            this.fire(ae.type, ae)
        }
    }
    layout(g: SurfaceContext, available: Size): Size {
        let size = g.measureText(this._caption,'base').grow(StandardLeftPadding)
        if(this.has_icon()) {
            size.w += 16
        }
        size.w += StandardLeftPadding // gap between icon and texst
        this.set_size(size)
        return size
    }

    private has_icon():boolean{
        return this.icon !== -1
    }
}
export class ToggleButton extends BaseSelectButton {
    // private active: boolean
    constructor(caption?: string) {
        super()
        if(caption)this.set_caption(caption)
    }
    draw(ctx: SurfaceContext) {
        let bg = ControlBG
        if(this.selected()) {
            bg = SelectedColor
        }
        if(this._active) {
            bg = SelectedColor
        }
        ctx.fillBackgroundSize(this.size(), bg)
        ctx.strokeBackgroundSize(this.size(),TextColor)
        super.draw(ctx)
    }
}

export class CheckButton extends BaseSelectButton {
    constructor() {
        super();
        this.icon = 800
        this.selected_icon = 801
    }
}
export class RadioButton extends BaseSelectButton {
    constructor() {
        super();
        this.icon = 802
        this.selected_icon = 803
    }
}
export class IconButton extends BaseView {
    private active: boolean
    private _icon:number
    constructor() {
        super(gen_id("glyph-button"))
        this._name = 'glyph-button'
        this.active = false
        this._icon = 0
    }
    draw(g: SurfaceContext): void {
        g.fillBackgroundSize(this.size(), this.active?SelectedColor:ControlBG)
        g.strokeBackgroundSize(this.size(), this.active?SelectedTextColor:TextColor)
        if(this._icon !== 0) {
            let x = StandardLeftPadding
            let y = StandardLeftPadding
            g.draw_glyph(this._icon,x,y,'base','black')
        }
    }
    input(event:CoolEvent) {
        if(event.category !== POINTER_CATEGORY) return
        if(event.type === POINTER_DOWN) {
            this.active = true
        }
        if(event.type === POINTER_UP) {
            this.active = false
            let ae = new CommandEvent(event.ctx, COMMAND_ACTION, this)
            this.fire(ae.type, ae)
        }
    }
    layout(g: SurfaceContext, available: Size): Size {
        this.set_size(new Size(16,16).grow(StandardLeftPadding))
        return this.size()
    }

    icon():number {
        return this._icon
    }
    set_icon(icon: number) {
        this._icon = icon
    }
}

export class SelectList extends BaseView {
    private data: any[];
    private renderer: any;
    private selected_index: number;

    constructor(data:any[], renderer) {
        super('tree')
        this.data = data
        this.renderer = renderer
        this.selected_index = -1
        this._vflex = true
    }
    draw(g: SurfaceContext): void {
        g.fillBackgroundSize(this.size(),'#ddd')
        this.data.forEach((item,i) => {
            if (i === this.selected_index) {
                g.fill(new Rect(0,30*i,this.size().w,25), SelectedColor)
            }
            let str = this.renderer(item)
            g.fillStandardText(str,StandardLeftPadding,i*30 + 20, 'base')
        })
    }
    input(event:CoolEvent) {
        if(event.category !== POINTER_CATEGORY) return
        if(event.type === POINTER_DOWN) {
            let evt = event as PointerEvent
            let pt = evt.position
            let y = Math.floor(pt.y / 30)
            let item = this.data[y]
            this.selected_index = y
            this.fire('change',{item:item,y:y})
        }
    }
    set_data(data: any[]) {
        this.data = data
    }
    layout(g: SurfaceContext, available: Size): Size {
        if(this.hflex()) {
            this.set_size(new Size(available.w, available.h))
        } else {
            this.set_size(new Size(200, available.h))
        }
        return this.size()
    }
}

export class Header extends BaseView {
    private _caption: string
    private fill: string;

    constructor(caption?: string) {
        super(gen_id("header"))
        this._name = 'header'
        this.fill = SelectedColor
        this._caption = caption || "no caption"
        this._hflex = true
    }
    caption():string {
        return this._caption
    }
    set_caption(caption:string) {
        this._caption = caption
    }
    draw(g: SurfaceContext): void {
        g.fillBackgroundSize(this.size(),this.fill)
        let size = g.measureText(this._caption,'base')
        let x = (this.size().w - size.w) / 2
        g.fillStandardText(this._caption, x, StandardTextHeight,'base');
    }
    layout(g: SurfaceContext, available: Size): Size {
        let text_size = g.measureText(this._caption,'base').grow(StandardLeftPadding)
        this.set_size(new Size(available.w, text_size.h))
        return this.size()
    }
}

export class HSpacer extends BaseView {
    constructor() {
        super("h-spacer");
        this._hflex = true
        this._name = 'h-spacer'
    }
    layout(g: SurfaceContext, available: Size): Size {
        this.set_size(new Size(available.w, 0))
        return this.size()
    }
    draw(g: SurfaceContext) {
    }
}

export class FontIcon extends BaseView {
    private codepoint: number

    constructor(codepoint: number) {
        super(gen_id('fonticon'))
        this.codepoint = codepoint
    }

    draw(g: SurfaceContext): void {
        g.draw_glyph(this.codepoint, 0, 0, 'base', 'black')
    }

    layout(g: SurfaceContext, available: Size): Size {
        this.set_size(new Size(16, 16))
        return this.size()
    }
}


export class DropdownButton extends ActionButton {
    actions: Action[]
    constructor() {
        super();
        this.actions = []
        this.on('action', (e) => {
            let popup = new PopupContainer();
            let popup_box = new VBox()
            popup_box.set_vflex(false)
            this.actions.forEach(act => {
                let button = new ActionButton(act.caption)
                button.set_caption(act.caption)
                button.on('action', () => {
                    // @ts-ignore
                    act.fun();
                    popup.hide()
                })
                popup_box.add(button)
            })
            popup.add(popup_box)
            let popup_layer = e.ctx.find_by_name('popup-layer')
            popup_layer.add(popup)
            let off = e.ctx.view_to_local(new Point(0, 0), this)
            popup.open_at(off.add(new Point(0, this.size().h)));
        })
    }
    set_actions(actions: Action[]) {
        this.actions = actions
    }
}

export class TextLine extends BaseView {
    text: string;
    private cursor: number;
    private pref_width: number;

    constructor() {
        super(gen_id("text-line"));
        this._name = '@text-line'
        this.text = "abc"
        this.pref_width = 100
        this.cursor = this.text.length
    }

    draw(g: CanvasSurface): void {
        let bg = '#ddd'
        if (g.is_keyboard_focus(this)) bg = 'white'
        g.fillBackgroundSize(this.size(), bg)
        g.strokeBackgroundSize(this.size(), 'black')
        if (g.is_keyboard_focus(this)) {
            g.ctx.fillStyle = TextColor
            g.ctx.font = StandardTextStyle
            let parts = this._parts()
            let bx = 5
            let ax = bx + g.measureText(parts.before, 'base').w
            g.fillStandardText(parts.before, bx, 20, 'base')
            g.fillStandardText(parts.after, ax, 20, 'base')
            g.ctx.fillStyle = 'black'
            g.ctx.fillRect(ax, 2, 2, 20)
        } else {
            g.fillStandardText(this.text, 5, 20, 'base');
        }
    }

    input(event: CoolEvent) {
        if (event.category === FOCUS_CATEGORY) {
            // this.log("got keyboard focus change",event.category)
        }
        if (event.type === POINTER_DOWN) {
            event.ctx.set_keyboard_focus(this)
        }
        if (event.type === KEYBOARD_DOWN) {
            let e = event as KeyboardEvent
            if (e.code === 'KeyD' && e.modifiers.ctrl) return this.delete_right()
            if (e.code === 'Backspace') return this.delete_left()
            if (e.code === 'ArrowLeft') return this.cursor_left()
            if (e.code === 'ArrowRight') return this.cursor_right()
            if (e.code === 'Enter') {
                event.ctx.release_keyboard_focus(this)
                this.fire('action', this.text)
                return
            }
            if (e.key && e.key.length === 1) this.insert(e.key)
        }
    }

    layout(g: SurfaceContext, available: Size): Size {
        this.set_size(new Size(this.pref_width, 26))
        if (this._hflex) {
            this.size().w = available.w
        }
        return this.size()
    }

    private insert(key: string) {
        let parts = this._parts()
        this.text = `${parts.before}${key}${parts.after}`
        this.cursor_right()
        this.fire('change',this.text)
    }

    private delete_left() {
        let parts = this._parts()
        this.text = `${parts.before.slice(0, parts.before.length - 1)}${parts.after}`
        this.cursor_left()
        this.fire('change',this.text)
    }

    private delete_right() {
        let parts = this._parts()
        this.text = `${parts.before}${parts.after.slice(1)}`
        this.fire('change',this.text)
    }

    private cursor_left() {
        this.cursor -= 1
        if (this.cursor < 0) this.cursor = 0
    }

    private cursor_right() {
        this.cursor += 1
        if (this.cursor > this.text.length) this.cursor = this.text.length
    }

    private _parts() {
        return {
            before: this.text.slice(0, this.cursor),
            after: this.text.slice(this.cursor),
        }
    }

    set_text(name: string) {
        this.text = name
        this.cursor = this.text.length
        this.fire('change',this.text)
    }

    set_pref_width(w: number) {
        this.pref_width = w
    }
}

export class NumberTextLine extends HBox {
    private _value:number
    private text_line: TextLine;
    private up_button: IconButton;
    private down_button: IconButton;
    constructor() {
        super()
        this.pad = 1
        this._value = 0
        this.text_line = new TextLine()
        this.add(this.text_line)
        this.text_line.on('change',() => {
            let v = parseInt(this.text_line.text,10);
            if(Number.isInteger(v)) {
                this._value = v
            } else {
                this.log("invalid!")
            }
        })
        this.up_button = new IconButton()
        this.up_button.set_icon(8593)
        this.up_button.on('action',() => {
            this.set_value(this.value()+1)
        })
        this.down_button = new IconButton()
        this.down_button.set_icon(8595)
        this.down_button.on('action',() => {
            this.set_value(this.value()-1)
        })
        this.add(this.up_button)
        this.add(this.down_button)
    }
    override draw(g):void {
        super.draw(g)
        if(!this.is_valid()) {
            g.strokeBackgroundSize(this.size(),'red')
        }
    }

    public set_value(value:number) {
        this._value = value
        this.text_line.set_text(''+value)
    }

    private is_valid() {
        let v = parseInt(this.text_line.text)
        return Number.isInteger(v)
    }

    value():number {
        return this._value
    }
}