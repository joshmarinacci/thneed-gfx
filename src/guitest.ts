import {CanvasSurface, SurfaceContext} from "./canvas";
import {
    ActionButton, CheckButton,
    FontIcon,
    Header,
    HSpacer,
    Label,
    NumberTextLine,
    RadioButton,
    SelectList, TextLine, ToggleButton
} from "./components";
import {
    BaseParentView,
    BaseView,
    COMMAND_ACTION,
    COMMAND_CHANGE,
    CommandEvent, CoolEvent,
    gen_id,
    Point, POINTER_CATEGORY, POINTER_DRAG, PointerEvent,
    Size,
    View,
    with_props
} from "./core";
// @ts-ignore
import basefont_data from "./base_font.json";
// @ts-ignore
import toolbar_json from "./toolbar.json"
import {DebugLayer, ResizeHandle} from "./debug";
import {randi} from "../../spritesheet_editor/common/util";
import {TableView} from "./table";
import {
    DialogContainer,
    DialogLayer, GrowPanel, HBox,
    KeystrokeCaptureView, LayerView,
    PopupContainer,
    PopupLayer,
    ScrollView,
    VBox
} from "./containers";

class FixedGridPanel extends BaseView {
    private sw: number;
    private sh: number;
    constructor(size:Size) {
        super(gen_id("fixed-grid"))
        this.sw = size.w
        this.sh = size.h
    }
    draw(g: CanvasSurface): void {
        g.fillBackgroundSize(this.size(),'#ccccff')
        g.ctx.strokeStyle = 'black'
        g.ctx.beginPath()
        for(let i=0; i<this.sw; i+=25) {
            g.ctx.moveTo(i,0)
            g.ctx.lineTo(i,this.sh)
        }
        for(let i=0; i<this.sh; i+=25) {
            g.ctx.moveTo(0,i)
            g.ctx.lineTo(this.sw,i)
        }
        g.ctx.stroke()
    }
    layout(g: CanvasSurface, available: Size): Size {
        this.set_size(new Size(this.sw,this.sh))
        return this.size()
    }
}

class LCDView extends BaseView {
    constructor() {
        super("lcd-view");
        this._name = 'lcd-view'
    }
    draw(g: CanvasSurface): void {
        g.fillBackgroundSize(this.size(),'#ccc')
        let text = 'LCD View'
        let size = g.measureText(text,'base')
        let x = (this.size().w - size.w)/2
        let y = (this.size().h - size.h)/2
        // g.fillRect(x,y,size.w,size.h,'aqua')
        g.fillStandardText(text,x,y+size.h,'base')
    }

    layout(g: CanvasSurface, available: Size): Size {
        this.set_size(new Size(200,60))
        return this.size()
    }
}

class DropdownButton extends ActionButton {
    data: any[];
    private renderer: (v:any) => string;
    private selected_index: number;
    constructor(data: string[], selected:number, param2: (v:any) => string) {
        super(gen_id('dropdown'))
        this.data = data
        this.selected_index = selected
        this.renderer = param2
        this.caption = 'invalid'
        if(this.selected_index >= 0 && this.selected_index < this.data.length) {
            this.caption = this.renderer(this.data[this.selected_index])
        }
        this.on('action',(evt:CommandEvent)=>{
            let popup = new PopupContainer();
            let popup_box = new VBox()
            this.data.map(item => with_props(new ActionButton(),{caption:this.renderer(item)}))
                .forEach((btn,i) => {
                    btn.on('action',(evt2)=>{
                        let popup_layer = evt2.ctx.find_by_name('popup-layer') as PopupLayer
                        popup_layer.remove(popup)
                        this.selected_index = i
                        if(this.selected_index >= 0 && this.selected_index < this.data.length) {
                            this.caption = this.renderer(this.data[this.selected_index])
                        }
                    })
                    popup_box.add(btn)
                })
            popup.add(popup_box)
            let pt = evt.ctx.view_to_local(new Point(0,this.size().h),this)
            popup.set_position(pt)
            let popup_layer = evt.ctx.find_by_name('popup-layer') as LayerView
            popup_layer.add(popup)
        })
    }

    set_selected_index(number: number) {
        this.selected_index = number
        if(this.selected_index >= 0 && this.selected_index < this.data.length) {
            this.caption = this.renderer(this.data[this.selected_index])
        }
    }
    set_renderer(rend:(v:any)=>string) {
        this.renderer = rend
    }
}

function open_songs_dialog(surf:CanvasSurface) {
    return ()=>{
        let dialog = new DialogContainer()
        let vbox = new VBox()
        vbox.set_vflex(true)
        vbox.halign = 'stretch'
        vbox.add(with_props(new Header(),{caption:"dialog header"}))

        let top_body = new VBox()
        {
            let hbox = new HBox()
            hbox.add(with_props(new ActionButton(),{caption:"action"}))
            hbox.add(with_props(new ToggleButton(),{caption:'toggle'}))
            hbox.add(with_props(new CheckButton(),{caption:"check"}))
            hbox.add(with_props(new RadioButton(),{caption:"radio"}))
            top_body.add(hbox)
        }
        {
            let hbox = new HBox()
            let text_input = with_props(new TextLine(),{text:"some text"}) as TextLine
            text_input.set_pref_width(100)
            hbox.add(text_input)

            let number_input = with_props(new NumberTextLine(), { value:45}) as NumberTextLine
            hbox.add(number_input)
            top_body.add(hbox)
        }
        // text input
        // number input
        // range with label
        // radio button group: hbox or vbox?


        vbox.add(top_body)
        let body = new VBox()
        body.halign = 'right'
        body.set_vflex(true)
        body.set_fill('white')
        body.add(new ActionButton("dialog body"))
        let scroll = new ScrollView()
        scroll.set_hflex(true)
        scroll.set_vflex(true)
        scroll.set_content(new FixedGridPanel(new Size(600,600)))
        body.add(scroll)


        vbox.add(body)

        let bottom_bar = new HBox()
        let cancel = with_props(new ActionButton(),{caption:'Cancel'})
        cancel.on('action',()=>{
            let dialog_layer = surf.find_by_name('dialog-layer') as LayerView
            dialog_layer.remove(dialog)
        })
        bottom_bar.add(cancel)
        bottom_bar.add(new HSpacer())
        bottom_bar.add(with_props(new ActionButton(),{caption:'Okay'}))
        vbox.add(bottom_bar)
        dialog.add(vbox)
        let dialog_layer = surf.find_by_name('dialog-layer') as LayerView
        dialog_layer.add(dialog)
    }
}

function apply_props(json: any, comp: any):any {
    if(!json) throw new Error("null json object")
    if(!comp) throw new Error("null component")
    Object.keys(json).forEach((key:string) => {
        //already handled type
        if(key === 'type') return
        //handle children separately
        if(key === 'children') return
        //id is a property instead of a setter
        if(key === 'id') {
            comp.id = json.id
            return
        }
        let setter = `set_${key}`
        // console.log("setting",key,setter)
        if(comp[setter]) {
            comp[setter](json[key])
        } else {
            console.log("no setter",setter)
        }
    })
    return comp
}

function build_component(json:any):View {
    if(!json) throw new Error(`empty json in build component`)
    if(!json.type) throw new Error(`json has no type`)
    let typ = json.type.toLowerCase()
    if(typ === 'hbox') return apply_props(json,new HBox())
    if(typ === 'actionbutton') {
        let comp = new ActionButton({caption:"some text"})
        apply_props(json,comp)
        return comp
    }
    if(typ == 'fonticon') {
        let cp = parseInt(json.codepoint,16)
        let comp = new FontIcon(cp)
        // @ts-ignore
        if(json.id) comp.id = json.id
        return comp
    }
    if(typ === 'hspacer') {
        let comp = new HSpacer()
        // @ts-ignore
        if(json.id) comp.id = json.id
        return comp
    }
    if(typ === "lcdview") {
        let comp = new LCDView()
        // @ts-ignore
        if(json.id) comp.id = json.id
        return comp
    }
    if(typ === "dropdown_button") {
        let comp = new DropdownButton([],-1,(s)=>"item")
        // @ts-ignore
        if(json.id) comp.id = json.id
        return comp
    }
    throw new Error(`unsupported type ${typ}`)
}
function restore_from_json(toolbar_json: any):View {
    console.log("working with",toolbar_json)
    let comps = toolbar_json.components.map(json => build_component(json))
    toolbar_json.components.forEach((json,i) => {
        let comp = comps[i]
        if(json.children) {
            json.children.forEach(id => {
                let ch = comps.find(ch => {
                    return ch.id === id
                })
                comp.add(ch)
            })
        }
    })
    let root_id = toolbar_json.root
    let root = comps.find(ch => ch.id === root_id)
    if(!root) throw new Error(`could not find root node ${root_id}`)
    return root
}

function make_toolbar(surf:CanvasSurface) {
    let toolbar:HBox = restore_from_json(toolbar_json) as HBox
    let drop:DropdownButton = toolbar.find_child('Dropdown_button_001') as DropdownButton
    drop.data = ['zero','mid','loud','bleeding ears']
    drop.set_renderer((v)=>v.toString())
    drop.set_selected_index(0)

    // @ts-ignore
    let add_songs:ActionButton = toolbar.find_child('ActionButton_004') as ActionButton
    add_songs.on(COMMAND_ACTION,open_songs_dialog(surf))
    return toolbar
}

function make_statusbar() {
    let status_bar = new HBox()
    status_bar.set_name('statusbar')
    status_bar.set_fill('#aaa')
    status_bar.set_vflex(false)
    status_bar.set_hflex(true)
    status_bar.add(new Label("cool status bar"))
    status_bar.add(with_props(new CheckButton(), {caption:'Cool?'}))
    status_bar.add(with_props(new RadioButton(), {caption:'Good?'}))
    status_bar.add(with_props(new RadioButton(), {caption:'Better.'}))
    status_bar.add(with_props(new RadioButton(), {caption:'Best!'}))
    status_bar.add(new HSpacer())
    return status_bar
}

function make_random_word(min,max) {
    let len = randi(min,max)
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.toLowerCase();
    var charactersLength = characters.length;
    for ( let i = 0; i < len; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
        if(i === 0) {
            result = result.toUpperCase()
        }
    }
    return result;
}
function make_random_words(min,max) {
    let count = randi(min,max)
    let res = ''
    for(let i=0; i<count; i++) {
        res += make_random_word(3,12) + ' '
    }
    return res
}

function make_song_list(surface: CanvasSurface) {
    let songs = []
    for(let i=0; i<100; i++) {
        songs.push({
            type:'song',
            artist:make_random_words(1,3),
            title: make_random_word(2,8),
            album: make_random_word(5,15),
        })
    }
    let song_list = new TableView(songs, ['artist','title','album'], [200,200,300] );
    song_list.set_name('song-list')
    song_list.set_hflex(true)
    song_list.set_vflex(true)
    return song_list
}

function make_standard(w:number,h:number): CanvasSurface{
    let surface = new CanvasSurface(w,h, 1.0);
    surface.load_jsonfont(basefont_data,'base','base')
    surface.debug = false
    let main = new LayerView();
    main.set_name('layer-view')
    let app_layer = new LayerView()

    app_layer.set_name('app-layer')
    main.add(app_layer)

    let dialog_layer = new DialogLayer()
    dialog_layer.set_name('dialog-layer')
    main.add(dialog_layer)

    let popup_layer = new PopupLayer()
    popup_layer.set_name('popup-layer')
    main.add(popup_layer)

    let dl = new DebugLayer()
    dl.set_visible(true)
    main.add(dl)
    surface.set_root(new KeystrokeCaptureView(main))

    return surface
}
function make_music_player(surface: CanvasSurface):View {
    let root = new VBox()
    root.set_name('root')
    root.add(make_toolbar(surface))

    let middle_layer = new HBox()
    middle_layer.set_vflex(true)
    middle_layer.set_name('middle')
    let source_list = new SelectList(['Library','Playlists','Radio'],(v)=>v)
    source_list.set_name('source-list')

    let scroll = new ScrollView()
    scroll.set_content(source_list)
    scroll.set_pref_width(220)
    scroll.set_vflex(true)
    middle_layer.add(scroll)

    middle_layer.add(make_song_list(surface))
    root.add(middle_layer)
    root.add(make_statusbar());

    root.set_hflex(true)
    root.set_vflex(true)
    return root
}

class FillChildPanel extends BaseParentView {
    constructor() {
        super('fill-child-panel');
    }
    layout(g: SurfaceContext, available: Size): Size {
        this.set_size(available)
        this._children.forEach(ch => ch.layout(g,available))
        return this.size()
    }
}

class TabbedPanel extends BaseParentView {
    private tabs: Map<View, String>;
    private tab_bar: HBox;
    private wrapper: FillChildPanel;
    private selected: View;
    constructor() {
        super("tabbed-panel");
        this.tabs = new Map<View,String>()
        this.tab_bar = new HBox()
        this.tab_bar.set_fill('green')
        this.tab_bar.set_hflex(true)
        this.add(this.tab_bar)
        this.wrapper = new FillChildPanel();
        this.add(this.wrapper)
        this.selected = null
    }
    draw(g: SurfaceContext) {
        // this.log('drawing',this.size())
    }

    layout(g: SurfaceContext, available: Size): Size {
        this.tab_bar.layout(g, new Size(available.w,available.h));
        let ts = this.tab_bar.size()
        this.wrapper.layout(g, new Size(available.w, available.h - ts.h))
        this.wrapper.set_position(new Point(0,ts.h))
        this.set_size(available)
        return this.size()
    }

    add_view(title: string, content: View) {
        this.tabs.set(content,title)
        let tab_button = new ToggleButton()
        tab_button.set_caption(title)
        tab_button.set_selected(false)
        tab_button.on(COMMAND_CHANGE,()=>{
            this.log("switching tabs to",title,content)
            this.selected = content
            this.tab_bar.get_children().forEach(ch => {
                (ch as ToggleButton).set_selected(false)
            })
            tab_button.set_selected(true)
            // @ts-ignore
            this.wrapper._children = []
            this.wrapper.add(content)
        })
        this.tab_bar.add(tab_button)
        // this.tab_bar.add(with_props(new ToggleButton(),{caption:title, selected:false}))
    }
}

function make_login_root(surface: CanvasSurface):View {
    let root = new VBox()
    root.set_vflex(true)
    root.halign = 'center'
    root.set_hflex(true)
    root.add(with_props(new Header(), {caption:'login'}))
    //username | box
    let username_row = new HBox()
    username_row.add(with_props(new Label(), {caption:'username'}))
    username_row.add(with_props(new TextLine(), {text:''}))
    root.add(username_row)
    //password | box
    let password_row = new HBox()
    password_row.add(with_props(new Label(), {caption:'password'}))
    password_row.add(with_props(new TextLine(), {text:''}))
    root.add(password_row)

    let button_row = new HBox()
    button_row.add(with_props(new ActionButton(), {caption:'< Cancel'}))
    button_row.add(with_props(new ActionButton(), {caption:'Log In >'}))
    root.add(button_row)
    //cancel | login
    let container = new DialogContainer()
    container.set_size(new Size(300,200))
    container.add(root)
    return container
}

class WindowResizeHandle extends BaseView {
    private window: ResizableWindow;
    constructor(window:ResizableWindow) {
        super('window-resize-handle');
        this.set_size(new Size(20, 20))
        this.window = window
    }
    draw(g: SurfaceContext): void {
        g.fillBackgroundSize(this.size(), '#888')
        g.draw_glyph(2921, 2, 0, 'base', 'black')
    }

    layout(g: SurfaceContext, available: Size): Size {
        return this.size()
    }

    override input(event: CoolEvent) {
        if (event.category === POINTER_CATEGORY) {
            let pt = event as PointerEvent
            if(event.type === POINTER_DRAG) {
                this.window.set_size(this.window.size().add(pt.delta))
            }
            event.stopped = true
            event.ctx.repaint()
        }
    }
}

class ResizableWindow extends BaseParentView {
    private titlebar: Header;
    private resize_handle: WindowResizeHandle;
    private content:View;
    constructor() {
        super("resizable-window");
        this.titlebar = new Header()
        this.titlebar.set_caption('Alert!')
        this.add(this.titlebar)

        this.resize_handle = new WindowResizeHandle(this);
        this.add(this.resize_handle)
        this.set_size(new Size(300,200))
    }
    draw(g: SurfaceContext) {
        g.fillBackgroundSize(this.size(),'#f0f0f0')
        g.strokeBackgroundSize(this.size(),'black')
    }

    layout(g: SurfaceContext, available: Size): Size {
        this.titlebar.layout(g,this.size())
        this.titlebar.set_position(new Point(0,0))
        this.resize_handle.layout(g,this.size())
        this.resize_handle.set_position(new Point(this.size().w-20, this.size().h-20))

        let y = this.titlebar.size().h
        let h = this.size().h - this.titlebar.size().h - this.resize_handle.size().h;
        this.content.layout(g,new Size(this.size().w,h))
        this.content.set_position(new Point(0,y))
        return this.size()
    }

    set_content(content: View) {
        this.content = content
        this.add(this.content)
    }
}
function make_action_window(surface: CanvasSurface):View {
    let vbox = new VBox()
    // vbox.set_fill('green')
    vbox.set_hflex(true)
    vbox.set_vflex(true)
    vbox.halign = 'center'
    let label = with_props(new Label(),{caption:'Destroy Moon?'})
    vbox.add(label)
    let button_bar = new HBox()
    button_bar.add(with_props(new ActionButton(),{caption:"Yes"}))
    button_bar.add(with_props(new ActionButton(),{caption:"No"}))
    button_bar.add(with_props(new ActionButton(),{caption:"Cancel"}))
    vbox.add(button_bar)

    let window = new ResizableWindow()
    window.set_content(vbox)

    // let root = new DialogContainer()
    // root.set_size(new Size(500,500))
    // root.add(window)
    // return root
    return window
}

export function start() {
    let surface = make_standard(1024,720)
    let tab_root = new TabbedPanel()
    tab_root.set_name('tabbed-root');
    // let btn = with_props(new ActionButton(), {caption:'foo'});
    // tab_root.add_view("The first tab",with_props(new ActionButton(), {caption:'foo'}));
    // tab_root.add_view("The second tab",with_props(new ActionButton(), {caption:'bar'}));

    let music_root:View = make_music_player(surface) as View;
    tab_root.add_view('Music Player',music_root);

    let login_root = make_login_root(surface);
    tab_root.add_view('Login Dialog', login_root);

    let action_dialog = make_action_window(surface);
    tab_root.add_view('Window', action_dialog);

    (surface.find_by_name('app-layer') as LayerView).add(tab_root)
    surface.start()
    // open_songs_dialog(surface)()
    surface.repaint()
}

