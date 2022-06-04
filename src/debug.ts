import {
    BaseParentView,
    BaseView, COMMAND_CHANGE,
    CoolEvent, gen_id,
    ParentView, Point,
    POINTER_CATEGORY,
    POINTER_DOWN,
    POINTER_DRAG,
    PointerEvent, Size,
    View,
    with_change
} from "./core";
import {CanvasSurface, rect_from_pos_size} from "./canvas";
import {Label, ToggleButton} from "./components";
import {LayerView, VBox} from "./containers";

export class DebugLensGlass extends BaseView {
    private _draw_names: boolean;
    private draw_sizes: boolean;
    private draw_bounds: boolean;
    private draw_flex: boolean;
    private draw_align: boolean;
    private lens: DebugLens;

    constructor(p: DebugLens, size: Size) {
        super(gen_id('debug-glass'));
        this.lens = p
        this._name = 'debug-lens-glass'
        this.set_size(size)
    }

    layout(g: CanvasSurface, available: Size): Size {
        return this.size()
    }

    override draw(g: CanvasSurface) {
        let root = g.root()
        g.ctx.save()
        g.ctx.beginPath()
        let size = this.size()
        g.ctx.rect(0, 0, size.w, size.h);
        g.ctx.clip()
        let trans = g.view_to_local(new Point(0, 0), this)
        g.ctx.translate(-trans.x, -trans.y)
        this.draw_outline(g, root)
        this.draw_selected(g)
        g.ctx.restore()
    }

    private draw_outline(g: CanvasSurface, view: View) {
        if (view.name() === 'debug-layer') return
        let pos = view.position()
        let size = view.size()
        g.ctx.save()
        if (this.draw_bounds) {
            g.ctx.strokeStyle = 'black'
            g.ctx.lineWidth = 1
            for(let s=1; s<4; s++) {
                g.ctx.strokeStyle = (s%2==0)?'red':'black'
                g.ctx.beginPath()
                g.ctx.rect(pos.x + s, pos.y + s, size.w - s * 2, size.h - s * 2)
                g.ctx.stroke()
            }
        }

        function draw_debug_text(g, pos, text) {
            let metrics = g.measureText(text, 'base')
            g.ctx.save()
            g.ctx.translate(pos.x, pos.y)
            g.ctx.fillStyle = 'white'
            g.ctx.fillRect(0, 0, metrics.w + 4, 10 + 4 + 4)
            g.ctx.strokeStyle = 'black'
            g.ctx.lineWidth = 1
            g.ctx.strokeRect(0, 0, metrics.w + 4, 10 + 4 + 4)
            g.ctx.fillStyle = 'black'
            g.fillStandardText(text, 4, 10 + 4 + 4, 'base')
            g.ctx.restore()
        }

        if (this._draw_names) {
            draw_debug_text(g, pos.add(new Point(5, 5)), view.name())
        }
        if (this.draw_sizes) {
            let size = view.size()
            let text = `${size.w.toFixed(1)} x ${size.h.toFixed(1)}`
            draw_debug_text(g, pos.add(new Point(5, 25)), text)
        }

        if(this.draw_flex) {
            let text = `hflex=${view.hflex()} vflex=${view.vflex()}`
            draw_debug_text(g, pos.add(new Point(5, 35)), text)
        }
        if(this.draw_align) {
            if('halign' in view) {
                // @ts-ignore
                let text = `halign=${view.halign}`
                draw_debug_text(g, pos.add(new Point(5, 45)), text)
            }
            if('valign' in view) {
                // @ts-ignore
                let text = `valign=${view.valign}`
                draw_debug_text(g, pos.add(new Point(5, 45)), text)
            }
        }

        function is_parent(view: View) {
            // @ts-ignore
            return view.is_parent_view && view.is_parent_view()
        }

        function as_parent(view: View): ParentView {
            return view as unknown as ParentView
        }

        if (is_parent(view)) {
            let parent = as_parent(view)
            g.ctx.save()
            g.ctx.translate(pos.x, pos.y)
            parent.get_children().forEach((ch: View) => {
                this.draw_outline(g, ch)
            })
            g.ctx.restore()
        }
        g.ctx.restore()
    }

    draw_names():boolean {
        return this._draw_names
    }
    set_draw_names(selected: boolean) {
        this._draw_names = selected
    }
    set_draw_sizes(selected: boolean) {
        this.draw_sizes = selected
    }
    set_draw_bounds(selected: boolean) {
        this.draw_bounds = selected
    }
    set_draw_flex(selected: boolean) {
        this.draw_flex = selected
    }
    set_draw_align(selected: boolean) {
        this.draw_align = selected
    }

    override input(event: CoolEvent) {
        // this.log(event)
        if(event.type === POINTER_DOWN) {
            let p = event as PointerEvent
            let p2 = event.ctx.view_to_local(p.position, this)
            this.log("global",p2)
            let views = []
            let should_recurse = (view:View) => {
                if(!view.visible()) return false
                if(view.name() === 'debug-layer') return false
                if(view.name() === 'debug-lens') return false
                return true
            }
            let should_include = (view:View) => {
                if(view.name() === 'dialog-layer') return false
                if(view.name() === 'debug-layer') return false
                if(view.name() === 'popup-layer') return false
                if(view.name() === 'debug-lens') return false
                if(view.name() === 'debug-lens-glass') return false
                return true
            }
            this.pick_under_cursor(event.ctx.root(),p2, views, should_recurse, should_include);
            this.log("path is",views)
            this.lens.set_selected(views[views.length-1])
        }
    }
    private pick_under_cursor(view: View, cursor: Point, views: View[], should_recurse: (view: View) => boolean, should_include: (view: View) => (boolean)) {
        if(!should_recurse(view)) return
        if(view.size().contains(cursor) && should_include(view)) {
            views.push(view)
        }
        // @ts-ignore
        if (view.is_parent_view && view.is_parent_view()) {
            let parent = view as unknown as ParentView;
            // this.log("going into parent",view.name())
            let chs = parent.get_children()
            chs.forEach(ch => {
                this.pick_under_cursor(ch, cursor.subtract(ch.position()), views, should_recurse, should_include)
            })
        }
    }

    private draw_selected(g: CanvasSurface) {
        if(!this.lens._selected) return
        let trans = g.view_to_local(new Point(0,0),this.lens._selected)
        // this.log("trans",trans)
        // this.log("selected is", this._selected.name())
        // let me_trans = g.view_to_local(new Point(0,0,),this)
        // this.log("me_trans = ", me_trans)
        let rect = rect_from_pos_size(trans,this.lens._selected.size())
        g.stroke(rect,'red')
    }
}

export class ResizeHandle extends BaseView {
    private lens: DebugLens;

    constructor(lens: DebugLens) {
        super(gen_id('debug-lens-resize'))
        this._name = 'debug-lens-resize-handle'
        this.lens = lens
        this.set_size(new Size(20, 20))
    }

    override input(event: CoolEvent) {
        if (event.category === POINTER_CATEGORY) {
            let pt = event as PointerEvent
            if(event.type === POINTER_DRAG) {
                this.lens.set_size(this.lens.size().add(pt.delta))
            }
            event.stopped = true
            event.ctx.repaint()
        }
    }

    draw(g: CanvasSurface): void {
        g.fillBackgroundSize(this.size(), '#888')
        g.draw_glyph(2921, 2, 0, 'base', 'black')
    }

    layout(g: CanvasSurface, available: Size): Size {
        return this.size()
    }

}

class DebugPropSheet extends BaseParentView{
    private lens: DebugLens;
    private vbox: VBox;
    constructor(lens:DebugLens) {
        super("debug-prop-sheet")
        this.lens = lens
        this.lens.on('select',()=>this.rebuild())
        this.vbox = new VBox()
        this.add(this.vbox);
    }
    override draw(g: CanvasSurface) {
        g.fillBackgroundSize(this.size(),'white')
    }

    layout(g: CanvasSurface, available: Size): Size {
        this.get_children().forEach(ch => {
            ch.layout(g, available)
        })
        this.set_size(new Size(this.vbox.size().w,this.vbox.size().h))
        return this.size()
    }

    private rebuild() {
        let sel = this.lens._selected
        this.log("rebuilding prop sheet for ",sel)
        this.vbox.clear_children()

        this.vbox.add(new Label("id"))
        // @ts-ignore
        this.vbox.add(new Label(sel.id))

        this.vbox.add(new Label("name"))
        this.vbox.add(new Label(sel.name()))

        this.vbox.add(new Label(`hflex: ${sel.hflex()}`))
        this.vbox.add(new Label(`vflex: ${sel.vflex()}`))

        this.vbox.add(new Label(`size: ${sel.size().toString()}`))
    }
}

export class DebugLens extends BaseParentView {
    private vbox: VBox;
    private sidebar_width:number
    private sidebar_right:boolean
    private glass: DebugLensGlass;
    private resize_handle: ResizeHandle;
    private propsheet: DebugPropSheet;
    _selected: View | null;

    constructor() {
        super(gen_id('debug-lens'));
        this._name = 'debug-lens'
        this.set_size(new Size(400, 300))
        let vbox = new VBox()
        vbox.set_name('debug-lens-vbox')
        vbox.halign = 'left'
        this.vbox = vbox
        this.sidebar_right = false
        this.sidebar_width = 200
        vbox.add(with_change(new ToggleButton('right'),
            (e)=> this.sidebar_right = !this.sidebar_right))
        vbox.add(with_change(new ToggleButton('names'),
            (e) => this.glass.set_draw_names(e.target.selected())))
        vbox.add(with_change(new ToggleButton('bounds'),
            (e) => this.glass.set_draw_bounds(e.target.selected())))
        this.propsheet = new DebugPropSheet(this)
        vbox.add(this.propsheet)
        this.add(vbox)
        this.glass = new DebugLensGlass(this,this.size())
        this.add(this.glass)
        this.resize_handle = new ResizeHandle(this)
        this.add(this.resize_handle)
    }

    override input(event: CoolEvent) {
        if (event.type === POINTER_DOWN) {
            // console.log('starting at',event)
        }
        if (event.type === POINTER_DRAG) {
            if(event.target !== this) return
            this.set_position(this.position().add((event as PointerEvent).delta))
            event.ctx.repaint()
        }
    }
    override can_receive_mouse(): boolean {
        return true
    }

    override draw(g: CanvasSurface) {
        g.ctx.save()
        g.ctx.fillStyle = '#a0a0a0'
        let s = this.size()
        g.ctx.fillRect(0, 0, s.w, 20)
        if(this.sidebar_right) {
            g.ctx.fillRect(0, 0, 20, s.h)
            g.ctx.fillRect(s.w - this.sidebar_width, 0, this.sidebar_width, s.h)
            g.ctx.strokeRect(20, 20, this.size().w-this.sidebar_width-20, this.size().h-20-20)
        } else {
            g.ctx.fillRect(0, 0, this.sidebar_width, s.h)
            g.ctx.fillRect(s.w - 20, 0, 20, s.h)
            g.ctx.strokeRect(this.sidebar_width, 20, this.size().w-this.sidebar_width-20, this.size().h-20-20)
        }
        g.ctx.fillRect(0, s.h - 20, s.w, 20)
        g.ctx.strokeStyle = '#444'
        g.ctx.strokeRect(0, 0, this.size().w, this.size().h)
        g.fillStandardText('debug lens', 10, 20, 'base')
        let txt = `size: ${this.glass.size().w} x ${this.glass.size().h}`
        let metrics = g.measureText(txt,'base')
        g.fillStandardText(txt, (this.size().w-metrics.w)/2,this.size().h,'base')
        g.ctx.restore()
    }

    layout(g: CanvasSurface, available: Size): Size {
        this.get_children().forEach(ch => {
            ch.layout(g, available)
        })
        let s = this.size()
        if(this.sidebar_right) {
            this.vbox.set_position(new Point(s.w-this.sidebar_width, 20))
            this.glass.set_position(new Point(20, 20))
        } else {
            this.vbox.set_position(new Point(0, 20))
            this.glass.set_position(new Point(this.sidebar_width, 20))
        }
        this.glass.set_size(new Size(s.w - this.sidebar_width - 20, s.h - 20 - 20))
        this.resize_handle.set_position(new Point(s.w - 20, s.h - 20))
        return this.size()
    }

    set_visible(b: boolean) {
        this._visible = b
    }

    set_selected(view: View | null) {
        this._selected = view
        this.fire('select',this._selected)
    }
}

export class DebugLayer extends LayerView {
    private button: ToggleButton;
    constructor() {
        super("debug-layer");
        this._name = 'debug-layer'
        let dl = new DebugLens()
        dl.set_visible(false)
        this.add(dl)
        this.button = new ToggleButton('D')
        this.button.on(COMMAND_CHANGE,() => {
            dl.set_visible(!dl.visible())
        })
        this.add(this.button)
    }
    layout(g: CanvasSurface, available: Size): Size {
        this.button.layout(g,available)
        super.layout(g, available);
        let s = this.size()
        let b = this.button.size()
        this.button.set_position(new Point(s.w - b.w,s.h - b.h))
        return this.size()
    }
}
