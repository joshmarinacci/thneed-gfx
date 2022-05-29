import {
    BaseParentView,
    BaseView,
    CoolEvent,
    gen_id,
    KEYBOARD_CATEGORY,
    KeyboardEvent,
    Point,
    POINTER_CATEGORY,
    POINTER_DOWN,
    POINTER_DRAG,
    PointerEvent,
    Rect,
    SCROLL_EVENT,
    ScrollEvent,
    Size,
    View
} from "./core";
import {SurfaceContext} from "./canvas";
import {ActionButton} from "./components";

export class LayerView extends BaseParentView {
    _type: string

    constructor(name?: string) {
        super(gen_id('layer'))
        this._type = 'layer-view'
        if (name) {
            this._name = name
        }
    }

    draw(g: SurfaceContext): void {
    }

    layout(g: SurfaceContext, available: Size): Size {
        this._children.forEach(ch => ch.layout(g, available))
        this.set_size(available)
        return available
    }

    set_visible(visible: boolean) {
        this._visible = visible
    }
}

export type VAlign = "top" | "center" | "bottom" | "stretch"

export class HBox extends BaseParentView {
    private _fill: string;
    pad: number;
    private _valign: VAlign;

    constructor() {
        super(gen_id('hbox'));
        this._valign = 'top'
        this.pad = 0
        this._fill = null
    }

    set_fill(fill: string) {
        this._fill = fill
    }

    set_valign(valign: VAlign) {
        this._valign = valign
    }

    layout(g: SurfaceContext, real_available: Size): Size {
        let available = real_available.shrink(this.pad);
        //split out flex and non-flex children
        let yes_flex = this._children.filter(ch => ch.hflex())
        let non_flex = this._children.filter(ch => !ch.hflex())
        //call layout on the non-flex children first
        let total_w = 0
        let leftover_w = available.w
        non_flex.map((ch: View) => {
            let size = ch.layout(g, new Size(leftover_w, available.h))
            total_w += size.w
            leftover_w -= size.w
        })
        if (yes_flex.length > 0) {
            //allocate the rest of the space equally to the flex children
            let flex_avail = new Size((available.w - total_w) / yes_flex.length, available.h)
            //call layout on the flex children
            yes_flex.map((ch: View) => {
                let size = ch.layout(g, flex_avail)
                total_w += size.w
            })
        }
        let maxh = 0
        //find the max height
        this.get_children().forEach(ch => maxh = Math.max(ch.size().h, maxh))
        let nx = this.pad
        let ny = this.pad
        //place all children (they've already set their width and height)
        this._children.forEach(ch => {
            if (this._valign === 'top') ch.set_position(new Point(nx, ny))
            if (this._valign === 'center') ch.set_position(new Point(nx, (maxh - ch.size().h) / 2))
            if (this._valign === 'bottom') ch.set_position(new Point(nx, maxh - ch.size().h))
            if (this._valign === 'stretch') {
                ch.set_position(new Point(nx, ny))
                ch.size().h = maxh
            }
            nx += ch.size().w
        })
        //return own size
        this.set_size(new Size(nx + this.pad * 2, maxh + this.pad * 2))
        if (this.vflex()) this.size().h = real_available.h
        if (this.hflex()) this.size().w = real_available.w
        return this.size()
    }

    draw(g: SurfaceContext) {
        if (this._fill) g.fillBackgroundSize(this.size(), this._fill)
    }
}

export type HAlign = "left" | "center" | "right" | "stretch"

export class VBox extends BaseParentView {
    private _fill: string;
    pad: number;
    halign: HAlign;

    constructor() {
        super(gen_id('vbox'));
        this._fill = null
        this.halign = "left"
        this.pad = 0
    }

    fill(): string {
        return this._fill
    }

    set_fill(fill: string) {
        this._fill = fill
    }

    layout(g: SurfaceContext, real_available: Size): Size {
        let available = real_available.shrink(this.pad);

        let yes_flex = this.get_children().filter(ch => ch.vflex())
        let non_flex = this.get_children().filter(ch => !ch.vflex())
        //call layout on the non-flex children first
        let total_h = 0
        let leftover_h = available.h
        non_flex.map(ch => {
            let size = ch.layout(g, new Size(available.w, leftover_h))
            total_h += size.h
            leftover_h -= size.h
        })
        if (yes_flex.length > 0) {
            //allocate the rest of the space equally to the flex children
            let flex_avail = new Size(available.w, (available.h - total_h) / yes_flex.length)
            //call layout on the flex children
            yes_flex.map((ch: View) => {
                let size = ch.layout(g, flex_avail)
                total_h += size.h
            })
        }
        //place all children (they've already set their width and height)
        let nx = this.pad
        let ny = this.pad
        let maxw = 0
        this.get_children().forEach(ch => maxw = Math.max(ch.size().w, maxw))
        this.get_children().forEach(ch => {
            if (this.halign === 'left') ch.set_position(new Point(nx, ny))
            if (this.halign === 'center') ch.set_position(new Point((maxw - ch.size().w) / 2, ny))
            if (this.halign === 'right') ch.set_position(new Point(maxw - ch.size().w, ny))
            if (this.halign === 'stretch') {
                ch.set_position(new Point(nx, ny))
                ch.size().w = maxw
            }
            ny += ch.size().h
        })
        //return own size
        this.size().w = maxw + this.pad * 2
        this.size().h = ny + this.pad * 2
        if (this.hflex()) {
            this.size().w = available.w
        }
        if (this.vflex()) {
            this.size().h = available.h
        }
        return this.size()
    }

    draw(g: SurfaceContext) {
        if (this._fill) g.fillBackgroundSize(this.size(), this._fill)
    }

    clear_children() {
        this._children = []
    }
}

export class GrowPanel extends BaseParentView {
    private fill: string

    constructor() {
        super(gen_id('grow'));
        this.fill = null
        this._hflex = true
        this._vflex = true
    }

    layout(g: SurfaceContext, available: Size): Size {
        this.set_size(available)
        return this.size()
    }

    draw(g: SurfaceContext) {
        if (this.fill) g.fillBackgroundSize(this.size(), this.fill)
    }

    set_fill(fill: string) {
        this.fill = fill
    }
    with_fill(fill: string) {
        this.fill = fill
        return this
    }
}

class ScrollWrapper extends BaseParentView {
    xoff: number
    yoff: number

    constructor() {
        super("scroll-wrapper");
        this.xoff = 0
        this.yoff = 0
        this._name = 'scroll-wrapper'
    }

    clip_children(): boolean {
        return true
    }

    layout(g: SurfaceContext, available: Size): Size {
        if (this.yoff > 0) this.yoff = 0
        if (this.xoff > 0) this.xoff = 0
        this.set_size(available)

        this.get_children().forEach(ch => {
            let size = ch.layout(g, available)
            if (size.w + this.xoff < available.w) {
                this.xoff = available.w - size.w
            }
            if (size.h + this.yoff < available.h) {
                this.yoff = available.h - size.h
            }
            if (size.w < available.w) {
                this.xoff = (available.w - size.w) / 2
            }
            if (size.h < available.h) {
                this.yoff = (available.h - size.h) / 2
            }
            ch.set_position(new Point(this.xoff, this.yoff))
        })
        return available
    }

    input(event: CoolEvent) {
        if (event.type === SCROLL_EVENT && event.direction === "up") {
            let e = event as ScrollEvent
            this.xoff -= e.delta.x
            this.yoff -= e.delta.y
            e.stopped = true
            e.ctx.repaint()
        }
    }

}

class ScrollBar extends BaseView {
    private vert: boolean;
    private wrapper: ScrollWrapper;

    constructor(vert: boolean, wrapper: ScrollWrapper) {
        super(gen_id("scroll-bar"));
        this.wrapper = wrapper
        this.vert = vert
        if (this.vert) {
            this.set_size(new Size(20, 100))
        } else {
            this.set_size(new Size(100, 20))
        }
    }

    draw(g: SurfaceContext): void {
        //draw the gutter
        g.fillBackgroundSize(this.size(), '#888')
        //draw the thumb
        if (this.wrapper.get_children().length == 1) {
            let viewport_size = this.wrapper.size()
            let content_size = this.wrapper.get_children()[0].size()
            // this.log("content",content,'vs',wsize)
            if (this.vert) {
                let gutter_length = this.size().h - 40
                let fract = viewport_size.h / content_size.h
                let s = gutter_length * fract
                let thumb_off = this.wrapper.yoff * fract
                g.fill(new Rect(0, 20 - thumb_off, 20, s), '#ccc');
            } else {
                let gutter_length = this.size().w - 50
                let fract = viewport_size.w / content_size.w
                let s = gutter_length * fract
                let thumb_off = this.wrapper.xoff * fract
                g.fill(new Rect(20 - thumb_off, 0, s, 20), '#ccc');
            }
        }
        //draw the arrows
        if (this.vert) {
            g.fill(new Rect(0, 0, 20, 20), '#999')
            g.draw_glyph(8593, 0, 0, 'base', 'black', 1)
            g.fill(new Rect(0, this.size().h - 20, 20, 20), '#999')
            g.draw_glyph(8595, 0, this.size().h - 20, 'base', 'black', 1)
        } else {
            g.fill(new Rect(0, 0, 20, 20), '#999')
            g.draw_glyph(8592, 0, 0, 'base', 'black', 1)
            g.fill(new Rect(this.size().w - 20, 0, 20, 20), '#999')
            g.draw_glyph(8594, this.size().w - 20, 0, 'base', 'black', 1)
        }
    }

    input(e: CoolEvent) {
        if (e.category !== POINTER_CATEGORY) return
        let event = e as PointerEvent
        if (event.type === POINTER_DOWN) {
            if (this.vert) {
                if (event.position.y < 20) {
                    this.wrapper.yoff += 20
                }
                if (event.position.y > this.size().h - 20) {
                    this.wrapper.yoff -= 20
                }
            } else {
                if (event.position.x < 20) {
                    this.wrapper.xoff += 20
                }
                if (event.position.x > this.size().w - 20) {
                    this.wrapper.xoff -= 20
                }
            }
        }
        if (event.type === POINTER_DRAG) {
            let viewport_size = this.wrapper.size()
            let content_size = this.wrapper.get_children()[0].size()
            if (this.vert) {
                let fract = viewport_size.h / content_size.h
                this.wrapper.yoff -= event.delta.y / fract
            } else {
                let fract = viewport_size.w / content_size.w
                this.wrapper.xoff -= event.delta.x / fract
            }
            event.ctx.repaint()
        }
        if (event.type === 'wheel') {
            let viewport_size = this.wrapper.size()
            let content_size = this.wrapper.get_children()[0].size()
            if (this.vert) {
                let fract = viewport_size.h / content_size.h
                this.wrapper.yoff -= event.delta.y / fract
            } else {
                let fract = viewport_size.w / content_size.w
                this.wrapper.xoff -= event.delta.x / fract
            }
            event.ctx.repaint()
        }
    }

    layout(g: SurfaceContext, available: Size): Size {
        return this.size()
    }
}

export class ScrollView extends BaseParentView {
    private hbar: ScrollBar;
    private vbar: ScrollBar
    private content: View
    private wrapper: ScrollWrapper;
    private up: ActionButton;
    private down: ActionButton;
    private _pref_width: number

    constructor() {
        super(gen_id("scroll-view"))
        this._name = 'scroll-view'
        this._pref_width = 300

        this.wrapper = new ScrollWrapper()
        this.add(this.wrapper)

        this.hbar = new ScrollBar(false, this.wrapper)
        // @ts-ignore
        this.hbar._name = 'h-scroll-bar'
        this.add(this.hbar)
        this.vbar = new ScrollBar(true, this.wrapper)
        // @ts-ignore
        this.vbar._name = 'v-scroll-bar'
        this.add(this.vbar)

    }


    draw(g: SurfaceContext): void {
        g.fillBackgroundSize(this.size(), '#aaa')
    }

    set_pref_width(num: number) {
        this._pref_width = num
    }

    layout(g: SurfaceContext, available: Size): Size {
        this.set_size(new Size(this._pref_width, 300))
        if (this.hflex()) {
            this.size().w = available.w
        }
        if (this.vflex()) {
            this.size().h = available.h
        }
        let ws = this.size().shrink(10)
        this.get_children().forEach(ch => {
            if (ch == this.wrapper) {
                ch.layout(g, ws)
            } else {
                ch.layout(g, available)
            }
        })
        this.hbar.set_size(new Size(this.size().w - 20, 20))
        this.hbar.set_position(new Point(0, this.size().h - this.hbar.size().h))
        this.vbar.set_size(new Size(20, this.size().h - 20))
        this.vbar.set_position(new Point(this.size().w - this.vbar.size().w, 0))
        return this.size()
    }

    set_content(view: View) {
        this.content = view
        this.wrapper.add(view)
    }
}

export class PopupContainer extends BaseParentView {
    constructor() {
        super(gen_id("popupcontainer"))
        this._name = "popup_container"
    }

    draw(g: SurfaceContext): void {
        g.fillBackgroundSize(this.size(), 'gray')
    }

    layout(g: SurfaceContext, available: Size): Size {
        let box = this._children[0]
        let size = box.layout(g, new Size(1000, 1000))
        this.set_size(size)
        return new Size(size.w, size.h)
    }

    open_at(position: Point) {
        this.set_position(position)
    }

    hide() {
        this._visible = false
        console.log("hiding", this._visible)
    }
}

export class PopupLayer extends LayerView {
    constructor() {
        super(gen_id('popup-layer'))
        this._name = 'popup-layer'
    }

    draw(g: SurfaceContext) {
        if (this._children.length > 0) g.fillBackgroundSize(this.size(), 'rgba(255,255,255,0.7)')
    }

    input(event: CoolEvent) {
        if (event.type === POINTER_DOWN) {
            this._children = []
            event.stopped = true
        }
    }

    override can_receive_mouse(): boolean {
        if (this.get_children().length > 0) return true
        return false
    }
}

export class DialogLayer extends LayerView {
    constructor() {
        super(gen_id('dialog-layer'))
        this._name = 'dialog-layer'
    }

    draw(g: SurfaceContext) {
        if (this._children.length > 0) g.fillBackgroundSize(this.size(), 'rgba(255,255,255,0.7)')
    }
}

export class DialogContainer extends BaseParentView {
    constructor() {
        super("dialog-container")
        this._name = 'dialog-container'
        this.set_size(new Size(250,250))
    }

    draw(g: SurfaceContext): void {
        g.fillBackgroundSize(this.size(), 'gray')
    }

    layout(g: SurfaceContext, available: Size): Size {
        let box = this._children[0]
        let size = box.layout(g, this.size())//new Size(600, 600))
        // this.set_size(size)
        this.set_position(new Point(
            (g.size().w - size.w) / 2,
            (g.size().h - size.h) / 2
        ))
        return new Size(size.w, size.h)
    }
}

export class KeystrokeCaptureView extends LayerView {
    constructor(main_view: View) {
        super(gen_id("keystroke_capture_view"))
        this._name = 'keystroke-capture-view'
        this.add(main_view)
    }

    override input(event: CoolEvent) {
        if (event.category === KEYBOARD_CATEGORY) {
            let kb = event as KeyboardEvent
            // this.log("got kb", kb)
            if (kb.key === 's' && kb.modifiers.meta === true) {
                // console.log("intercepting save")
                // @ts-ignore
                event.domEvent.preventDefault()
                kb.stopped = true
            }
            if (kb.key === 'd' && kb.modifiers.meta === true && kb.modifiers.ctrl === true) {
                // console.log("toggling debug")
            }
        }
        super.input(event);
    }
}