import {SurfaceContext} from "./canvas";
import {
    calculate_style,
    SelectedColor,
    StandardLeftPadding,
    StandardTextHeight,
    STD_STYLE, Style
} from "./style";
import {
    Action,
    BaseView,
    Callback,
    COMMAND_ACTION,
    COMMAND_CHANGE,
    CommandEvent,
    CoolEvent,
    gen_id,
    KEYBOARD_CATEGORY,
    KEYBOARD_DOWN,
    KeyboardEvent,
    Point,
    POINTER_CATEGORY,
    POINTER_DOWN,
    POINTER_UP,
    PointerEvent,
    Rect,
    Size
} from "./core";
import {PopupContainer, VBox} from "./containers";
import {LOGICAL_KEYBOARD_CODE} from "./generated";

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
    protected _caption: string
    private active: boolean
    constructor(props?:any) {
        super(gen_id("button2"))
        this._name = 'button2'
        this._caption = 'no caption'
        if(props && props.caption) this._caption = props.caption
        this.active = false
    }
    caption() {
        return this._caption
    }
    set_caption(caption:string) {
        this._caption = caption
    }
    draw(g: SurfaceContext): void {
        let style = calculate_style(this.constructor.name,false,this.active);
        g.fillBackgroundSize(this.size(),style.background_color)
        g.strokeBackgroundSize(this.size(), style.border_color)
        let text_color = style.text_color
        g.fillText(this._caption, new Point(STD_STYLE.PADDING.LEFT, StandardTextHeight),text_color, 'base')
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
        this.set_size(g.measureText(this._caption,'base').grow(StandardLeftPadding))
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
        let style:Style = calculate_style(this.constructor.name,this.selected(),this._active)
        g.fillText(this._caption, new Point(x, y+StandardTextHeight-2), style.text_color, 'base')
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
    constructor(caption?: string) {
        super()
        if(caption) this.set_caption(caption)
    }
    draw(ctx: SurfaceContext) {
        let style = calculate_style(this.constructor.name,this.selected(),this._active)
        ctx.fillBackgroundSize(this.size(), style.background_color)
        ctx.strokeBackgroundSize(this.size(),style.border_color)
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
        let style = calculate_style(this.constructor.name,false,this.active)
        g.fillBackgroundSize(this.size(), style.background_color)
        g.strokeBackgroundSize(this.size(), style.border_color)
        if(this._icon !== 0) {
            let x = StandardLeftPadding
            let y = StandardLeftPadding
            g.draw_glyph(this._icon,x,y,'base',style.text_color)
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
        let style = calculate_style(this.constructor.name,false,false)
        g.fillBackgroundSize(this.size(),style.background_color)
        this.data.forEach((item,i) => {
            if (i === this.selected_index) {
                let style = calculate_style(this.constructor.name,true,false)
                g.fill(new Rect(0,30*i,this.size().w,25), style.background_color)
            }
            let str = this.renderer(item)
            g.fillStandardText(str,StandardLeftPadding,i*30 + 20, 'base')
        })
    }
    input(event:CoolEvent) {
        if(event.category === KEYBOARD_CATEGORY && event.type === KEYBOARD_DOWN) {
            let kv = event as KeyboardEvent
            if (kv.code === LOGICAL_KEYBOARD_CODE.ARROW_UP && this.selected_index > 0) {
                this.set_selected_index(this.selected_index-1)
            }
            if (kv.code === LOGICAL_KEYBOARD_CODE.ARROW_DOWN && this.selected_index < this.data.length - 1) {
                this.set_selected_index(this.selected_index+1)
            }
        }
        if(event.category !== POINTER_CATEGORY) return
        if(event.type === POINTER_DOWN) {
            let evt = event as PointerEvent
            let pt = evt.position
            let y = Math.floor(pt.y / 30)
            this.set_selected_index(y)
            event.ctx.set_keyboard_focus(this)
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

    private set_selected_index(index: number) {
        this.selected_index = index
        let item = this.data[this.selected_index]
        this.fire('change', {item: item, y: this.selected_index})
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
        let style = calculate_style(this.constructor.name,false,false)
        g.fillBackgroundSize(this.size(),style.background_color)
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
        let style = calculate_style(this.constructor.name,false,false)
        g.draw_glyph(this.codepoint, 0, 0, 'base', style.text_color)
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
