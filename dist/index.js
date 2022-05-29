function $parcel$export(e, n, v, s) {
  Object.defineProperty(e, n, {get: v, set: s, enumerable: true, configurable: true});
}

$parcel$export(module.exports, "CanvasSurface", () => $3d39ed200ad179f0$export$b6fe5971b24d23c8);
const $1385bbac798b6a24$export$e22171881e21e37d = "#a3e3ff";
const $1385bbac798b6a24$export$d78081c6bf0643b7 = "#36baec";
const $1385bbac798b6a24$export$4b96206d0506e47f = "#e3e3e0";
const $1385bbac798b6a24$export$addd948fb18d2d08 = "#949492";
const $1385bbac798b6a24$export$165f1f1fad5fbec5 = $1385bbac798b6a24$export$e22171881e21e37d;
const $1385bbac798b6a24$export$9b5aefa8b8f9f54 = "#444";
const $1385bbac798b6a24$export$9f53be77959c9e4 = "16px sans-serif";
const $1385bbac798b6a24$export$63eec52eb5416473 = 20;
const $1385bbac798b6a24$export$58b2cdab93a993 = 10;
const $1385bbac798b6a24$export$bc1d2e14213c9578 = 5;
const $1385bbac798b6a24$export$6b1a51bbd32ad362 = "#f0f0f0";


class $6688e477b1ca86be$export$aa8e9462579016b1 {
    constructor(ctx, category, type){
        this.ctx = ctx;
        this.category = category;
        this.type = type;
    }
}
const $6688e477b1ca86be$export$9d2b52010bf6ce34 = "POINTER_CATEGORY";
const $6688e477b1ca86be$export$5c736a62aeec4dde = "POINTER_MOVE";
const $6688e477b1ca86be$export$bf9b45a2f73f134 = "POINTER_DRAG";
const $6688e477b1ca86be$export$1b45e8fa340ec4b9 = "POINTER_DOWN";
const $6688e477b1ca86be$export$325fffb5a0fb0686 = "POINTER_UP";
const $6688e477b1ca86be$export$6f2dffa1ce451720 = 0;
const $6688e477b1ca86be$export$3ee72973dad68c21 = 2;
function $6688e477b1ca86be$export$40fec46f639d6a4d(prefix) {
    return `${prefix}_${Math.floor(Math.random() * 100000)}`;
}
class $6688e477b1ca86be$export$2be20915eb18ceef {
    constructor(){
        this.data = [];
    }
    clear() {
        this.data = [];
    }
    push_end(value) {
        this.data.push(value);
    }
    length() {
        return this.data.length;
    }
    pop_start() {
        return this.data.shift();
    }
    forEach(cb) {
        // @ts-ignore
        this.data.forEach((v, i)=>cb(v, i));
    }
}
class $6688e477b1ca86be$export$baf26146a414f24a {
    constructor(x, y){
        this.x = x;
        this.y = y;
    }
    translate(x, y) {
        return new $6688e477b1ca86be$export$baf26146a414f24a(this.x - x, this.y - y);
    }
    divide_floor(scale) {
        return new $6688e477b1ca86be$export$baf26146a414f24a(Math.floor(this.x / scale), Math.floor(this.y / scale));
    }
    add(pt) {
        return new $6688e477b1ca86be$export$baf26146a414f24a(this.x + pt.x, this.y + pt.y);
    }
    set(x, y) {
        this.x = x;
        this.y = y;
    }
    copy_from(pt) {
        this.x = pt.x;
        this.y = pt.y;
    }
    clone() {
        return new $6688e477b1ca86be$export$baf26146a414f24a(this.x, this.y);
    }
    subtract(trans) {
        return new $6688e477b1ca86be$export$baf26146a414f24a(this.x - trans.x, this.y - trans.y);
    }
    toString() {
        return `Point(${this.x},${this.y})`;
    }
}
class $6688e477b1ca86be$export$c79fc6492f3af13d {
    constructor(x, y, w, h){
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }
    contains(pt) {
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
    shrink(v) {
        return new $6688e477b1ca86be$export$c79fc6492f3af13d(this.x + v, this.y + v, this.w - v - v, this.h - v - v);
    }
}
class $6688e477b1ca86be$export$cb6da89c6af1a8ec {
    constructor(w, h){
        this.w = w;
        this.h = h;
    }
    shrink(pad) {
        return new $6688e477b1ca86be$export$cb6da89c6af1a8ec(this.w - pad * 2, this.h - pad * 2);
    }
    grow(pad) {
        return new $6688e477b1ca86be$export$cb6da89c6af1a8ec(this.w + pad * 2, this.h + pad * 2);
    }
    subtract(delta) {
        return new $6688e477b1ca86be$export$cb6da89c6af1a8ec(this.w - delta.x, this.h - delta.y);
    }
    add(delta) {
        return new $6688e477b1ca86be$export$cb6da89c6af1a8ec(this.w + delta.x, this.h + delta.y);
    }
    contains(cursor) {
        if (cursor.x < 0) return false;
        if (cursor.y < 0) return false;
        if (cursor.x > this.w) return false;
        if (cursor.y > this.h) return false;
        return true;
    }
    toString() {
        return `${this.w}x${this.h}`;
    }
    equals(s) {
        return this.w === s.w && this.h === s.h;
    }
}
class $6688e477b1ca86be$export$94806efd9890932f extends $6688e477b1ca86be$export$aa8e9462579016b1 {
    constructor(ctx, type, position, delta){
        super(ctx, $6688e477b1ca86be$export$9d2b52010bf6ce34, type);
        this.position = position;
        this.delta = delta;
        this.direction = "down";
    }
}
const $6688e477b1ca86be$export$9ea12e6597684af = "KEYBOARD_CATEGORY";
const $6688e477b1ca86be$export$2f782da1dcec9699 = "KEYBOARD_DOWN";
const $6688e477b1ca86be$export$71f4199cf5d644e1 = "KEYBOARD_UP";
class $6688e477b1ca86be$export$a5c19b564dc41c2c extends $6688e477b1ca86be$export$aa8e9462579016b1 {
    constructor(surface, type){
        super(surface, $6688e477b1ca86be$export$9ea12e6597684af, type);
    }
}
const $6688e477b1ca86be$export$5acce15900d111af = "SCROLL_CATEGORY";
const $6688e477b1ca86be$export$ff567485663629e4 = "SCROLL_EVENT";
class $6688e477b1ca86be$export$6b6e41529b479d4c extends $6688e477b1ca86be$export$aa8e9462579016b1 {
    constructor(surface, type, position, delta){
        super(surface, $6688e477b1ca86be$export$5acce15900d111af, type);
        this.position = position;
        this.delta = delta;
    }
}
const $6688e477b1ca86be$export$a7f3c29903aaf76d = "FOCUS_CATEGORY";
const $6688e477b1ca86be$export$16f7cbdecbe19b78 = "FOCUS_GAINED";
const $6688e477b1ca86be$export$f82d7d72b9e09307 = "FOCUS_LOST";
class $6688e477b1ca86be$export$ef2db9a302825184 extends $6688e477b1ca86be$export$aa8e9462579016b1 {
    constructor(surface, FOCUS_GAINED1){
        super(surface, $6688e477b1ca86be$export$a7f3c29903aaf76d, FOCUS_GAINED1);
    }
}
const $6688e477b1ca86be$export$1b61a664d824d91b = "COMMAND_CATEGORY";
const $6688e477b1ca86be$export$d7d7f0f0e8a54cf8 = "action";
class $6688e477b1ca86be$export$4321e05f6706c18d extends $6688e477b1ca86be$export$aa8e9462579016b1 {
    constructor(ctx, type, target){
        super(ctx, $6688e477b1ca86be$export$1b61a664d824d91b, type);
        this.target = target;
    }
}
const $6688e477b1ca86be$export$9e79ac99d4b68a26 = "change";
const $6688e477b1ca86be$export$57832389c821635d = "CLIPBOARD_CATEGORY";
const $6688e477b1ca86be$export$af734cf1b8165bed = "ClipboardCopy";
const $6688e477b1ca86be$export$a43cee0a56e16595 = "ClipboardCut";
const $6688e477b1ca86be$export$fdaf284d88231086 = "ClipboardPaste";
class $6688e477b1ca86be$export$f7f37dd3b8ffe91f extends $6688e477b1ca86be$export$aa8e9462579016b1 {
}
class $6688e477b1ca86be$export$13bdd94145ae928f {
    constructor(id){
        this.id = id;
        this._size = new $6688e477b1ca86be$export$cb6da89c6af1a8ec(100, 100);
        this._position = new $6688e477b1ca86be$export$baf26146a414f24a(0, 0);
        this._children = [];
        this._name = "unnamed";
        this._listeners = new Map();
        this._visible = true;
        this._hflex = false;
        this._vflex = false;
    }
    hflex() {
        return this._hflex;
    }
    set_hflex(hflex) {
        this._hflex = hflex;
    }
    vflex() {
        return this._vflex;
    }
    set_vflex(vflex) {
        this._vflex = vflex;
    }
    log(...args) {
        console.log(this.name(), ...args);
    }
    size() {
        return this._size;
    }
    set_size(size) {
        this._size = size;
    }
    position() {
        return this._position;
    }
    set_position(point) {
        this._position = point;
    }
    clip_children() {
        return false;
    }
    draw(g) {}
    get_children() {
        return this._children;
    }
    find_child(id) {
        // @ts-ignore
        return this.get_children().find((ch)=>ch.id === id);
    }
    add(view) {
        this._children.push(view);
    }
    remove(view) {
        this._children = this._children.filter((ch)=>ch !== view);
    }
    input(event) {}
    is_parent_view() {
        return true;
    }
    name() {
        return this._name;
    }
    set_name(name) {
        this._name = name;
    }
    on(type, cb) {
        this._get_listeners(type).push(cb);
    }
    off(type, cb) {
        this._listeners.set(type, this._get_listeners(type).filter((c)=>c != cb));
    }
    fire(type, payload) {
        this._get_listeners(type).forEach((cb)=>cb(payload));
    }
    visible() {
        return this._visible;
    }
    _get_listeners(type) {
        if (!this._listeners.has(type)) this._listeners.set(type, []);
        return this._listeners.get(type);
    }
    can_receive_mouse() {
        return false;
    }
}
class $6688e477b1ca86be$export$920f40dd82baec9f {
    constructor(id){
        this.id = id;
        this._size = new $6688e477b1ca86be$export$cb6da89c6af1a8ec(100, 100);
        this._position = new $6688e477b1ca86be$export$baf26146a414f24a(0, 0);
        this._visible = true;
        this._name = "unnamed";
        this._listeners = new Map();
        this._hflex = false;
        this._vflex = false;
    }
    hflex() {
        return this._hflex;
    }
    vflex() {
        return this._vflex;
    }
    log(...args) {
        console.log(`${this.name()}:`, ...args);
    }
    _get_listeners(type) {
        if (!this._listeners.has(type)) this._listeners.set(type, []);
        return this._listeners.get(type);
    }
    on(type, cb) {
        this._get_listeners(type).push(cb);
    }
    off(type, cb) {
        this._listeners.set(type, this._get_listeners(type).filter((c)=>c != cb));
    }
    fire(type, payload) {
        this._get_listeners(type).forEach((cb)=>cb(payload));
    }
    size() {
        return this._size;
    }
    set_size(size) {
        this._size = size;
    }
    position() {
        return this._position;
    }
    set_position(point) {
        this._position = point;
    }
    input(event) {}
    name() {
        return this._name;
    }
    set_name(name) {
        this._name = name;
    }
    visible() {
        return this._visible;
    }
}
function $6688e477b1ca86be$export$9fdee197c47e806f(comp, json) {
    if (!json) throw new Error("null json object");
    if (!comp) throw new Error("null component");
    Object.keys(json).forEach((key)=>{
        //already handled type
        if (key === "type") return;
        //handle children separately
        if (key === "children") return;
        //id is a property instead of a setter
        if (key === "id") {
            // @ts-ignore
            comp.id = json.id;
            return;
        }
        let setter = `set_${key}`;
        // console.log("setting",key,setter)
        if (comp[setter]) comp[setter](json[key]);
        else console.log("no setter", setter);
    });
    return comp;
}
function $6688e477b1ca86be$export$d4afaa3ba0ec3b47(view, cb) {
    view.on($6688e477b1ca86be$export$d7d7f0f0e8a54cf8, cb);
    return view;
}


function $3d39ed200ad179f0$export$bef1f36f5486a6a3(...args) {
    console.log("SNAKE:", ...args);
}
const $3d39ed200ad179f0$var$CLEAR_COLOR = "#f0f0f0";
function $3d39ed200ad179f0$export$e8c1e4de1c401d98(point, size) {
    return new (0, $6688e477b1ca86be$export$c79fc6492f3af13d)(point.x, point.y, size.w, size.h);
}
class $3d39ed200ad179f0$var$MouseInputService {
    constructor(surface){
        this.surface = surface;
        this.down = false;
        this.last_point = new (0, $6688e477b1ca86be$export$baf26146a414f24a)(0, 0);
    }
    trigger_mouse_down(position, button) {
        this.down = true;
        this.last_point = position;
        this.path = this.scan_path(position);
        this.target = this.path[this.path.length - 1] // last
        ;
        let evt = new (0, $6688e477b1ca86be$export$94806efd9890932f)(this.surface, (0, $6688e477b1ca86be$export$1b45e8fa340ec4b9), position, new (0, $6688e477b1ca86be$export$baf26146a414f24a)(0, 0));
        evt.button = button;
        evt.target = this.target;
        this.propagatePointerEvent(evt, this.path);
        this.surface.repaint();
    }
    trigger_mouse_move(position, button) {
        let delta = position.subtract(this.last_point);
        this.last_point = position.clone();
        let evt;
        if (this.down) evt = new (0, $6688e477b1ca86be$export$94806efd9890932f)(this.surface, (0, $6688e477b1ca86be$export$bf9b45a2f73f134), position, delta);
        else {
            this.path = this.scan_path(position);
            evt = new (0, $6688e477b1ca86be$export$94806efd9890932f)(this.surface, (0, $6688e477b1ca86be$export$5c736a62aeec4dde), position, delta);
        }
        evt.button = button;
        evt.target = this.path[this.path.length - 1] // last
        ;
        this.propagatePointerEvent(evt, this.path);
        this.surface.repaint();
    }
    trigger_mouse_up(position, button) {
        this.down = false;
        let evt = new (0, $6688e477b1ca86be$export$94806efd9890932f)(this.surface, (0, $6688e477b1ca86be$export$325fffb5a0fb0686), position, new (0, $6688e477b1ca86be$export$baf26146a414f24a)(0, 0));
        evt.button = button;
        evt.target = this.path[this.path.length - 1] // last
        ;
        this.propagatePointerEvent(evt, this.path);
        this.surface.repaint();
    }
    trigger_scroll(position, delta) {
        this.path = this.scan_path(position);
        let evt = new (0, $6688e477b1ca86be$export$6b6e41529b479d4c)(this.surface, (0, $6688e477b1ca86be$export$ff567485663629e4), position, delta);
        this.propagateScrollEvent(evt, this.path);
    }
    calculate_path_to_cursor(view, position, path) {
        // this.log('searching for',position,'on',view.name())
        if (!view) return false;
        if (!view.visible()) return false;
        let bounds = $3d39ed200ad179f0$export$e8c1e4de1c401d98(view.position(), view.size());
        if (bounds.contains(position)) {
            // @ts-ignore
            if (view.is_parent_view && view.is_parent_view()) {
                let parent = view;
                // go in reverse order to the top drawn children are picked first
                for(let i = parent.get_children().length - 1; i >= 0; i--){
                    let ch = parent.get_children()[i];
                    let pos = position.subtract(view.position());
                    let picked = this.calculate_path_to_cursor(ch, pos, path);
                    if (picked) {
                        path.unshift(ch);
                        return true;
                    }
                }
                if (parent.can_receive_mouse()) return true;
            } else return true;
        }
        return false;
    }
    log(...args) {
        console.log("MouseService:", ...args);
    }
    scan_path(position) {
        let path = [];
        this.calculate_path_to_cursor(this.surface.root(), position, path);
        // this.log("final path is",path)
        return path;
    }
    propagatePointerEvent(evt, path) {
        let stopped = false;
        let pt = evt.position;
        path.forEach((view)=>{
            if (stopped) {
                this.log("done");
                return;
            }
            // this.log("down: view",view.name())
            evt.position = evt.position.subtract(view.position());
            view.input(evt);
            if (evt.stopped) stopped = true;
        });
    }
    propagateScrollEvent(evt, path) {
        let stopped = false;
        let pt = evt.position.clone();
        evt.direction = "down";
        path.forEach((view)=>{
            if (stopped) return;
            evt.position = evt.position.subtract(view.position());
            view.input(evt);
            if (evt.stopped) stopped = true;
        });
        if (stopped) return;
        path.reverse();
        evt.direction = "up";
        path.forEach((view)=>{
            if (stopped) // this.log("done")
            return;
            evt.position = evt.position.add(view.position());
            view.input(evt);
            if (evt.stopped) stopped = true;
        });
    }
}
class $3d39ed200ad179f0$var$KeyboardInputService {
    log(...args) {
        console.log("KeyboardService:", ...args);
    }
    constructor(surface){
        this.surface = surface;
    }
    dispatch_keyboard_focus_change(old_focus, new_focus) {
        let e_old = new (0, $6688e477b1ca86be$export$ef2db9a302825184)(this.surface, (0, $6688e477b1ca86be$export$f82d7d72b9e09307));
        //send focus lost to old focus
        if (old_focus) old_focus.input(e_old);
        //send focus gained to new focus
        let e_new = new (0, $6688e477b1ca86be$export$ef2db9a302825184)(this.surface, (0, $6688e477b1ca86be$export$16f7cbdecbe19b78));
        if (new_focus) new_focus.input(e_new);
    //don't use a path, no one can intercept?
    }
    calculate_path_to_keyboard_focus(root, target) {
        if (!root) return false;
        if (!root.visible()) return false;
        if (root === target) return [
            root
        ];
        // @ts-ignore
        if (root.is_parent_view && root.is_parent_view()) {
            let parent = root;
            for(let i = parent.get_children().length - 1; i >= 0; i--){
                let ch = parent.get_children()[i];
                // this.log('checking child',ch)
                let res = this.calculate_path_to_keyboard_focus(ch, target);
                if (res) {
                    res.unshift(root);
                    return res;
                }
            }
        }
    }
    trigger_key_down(key, code, modifiers) {
        let evt = new (0, $6688e477b1ca86be$export$a5c19b564dc41c2c)(this.surface, (0, $6688e477b1ca86be$export$2f782da1dcec9699));
        evt.key = key;
        evt.code = code;
        evt.modifiers = modifiers;
        let path = this.calculate_path_to_keyboard_focus(this.surface.root(), this.surface.keyboard_focus());
        this.surface.propagateKeyboardEvent(evt, path);
        this.surface.repaint();
    }
    trigger_key_up(key, code, modifiers) {
        let evt = new (0, $6688e477b1ca86be$export$a5c19b564dc41c2c)(this.surface, (0, $6688e477b1ca86be$export$71f4199cf5d644e1));
        evt.key = key;
        evt.code = code;
        evt.modifiers = modifiers;
        let path = this.calculate_path_to_keyboard_focus(this.surface.root(), this.surface.keyboard_focus());
        this.surface.propagateKeyboardEvent(evt, path);
        this.surface.repaint();
    }
}
class $3d39ed200ad179f0$export$b6fe5971b24d23c8 {
    size() {
        return new (0, $6688e477b1ca86be$export$cb6da89c6af1a8ec)(this.w, this.h);
    }
    global_smoothing = true;
    constructor(w, h, scale){
        this.log("making canvas ", w, h);
        this.w = w;
        this.h = h;
        this.scale = this.scale || 1;
        this.canvas = document.createElement("canvas");
        this.canvas.width = w * window.devicePixelRatio * this.scale;
        this.canvas.height = h * window.devicePixelRatio * this.scale;
        this.log("real canvas is", this.canvas.width, this.canvas.height);
        this.canvas.setAttribute("tabindex", "0");
        //turn this on for high-dpi support
        this.canvas.style.width = `${this.w * this.scale}px`;
        this.canvas.style.height = `${this.h * this.scale}px`;
        this.log("canvas style = ", this.canvas.style);
        this.ctx = this.canvas.getContext("2d");
        this.debug = false;
        this.clear();
        this.fonts = new Map();
        this._pointer_target = null;
    }
    addToPage() {
        document.body.appendChild(this.canvas);
    }
    set_root(root) {
        this._root = root;
    }
    root() {
        return this._root;
    }
    repaint() {
        if (this.debug) console.time("repaint");
        this.layout_stack();
        this.clear();
        this.draw_stack();
        if (this.debug) console.timeEnd("repaint");
    }
    clear() {
        this.ctx.fillStyle = $3d39ed200ad179f0$var$CLEAR_COLOR;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    layout_stack() {
        if (!this._root) console.warn("root is null");
        else {
            let available_size = new (0, $6688e477b1ca86be$export$cb6da89c6af1a8ec)(this.w, this.h);
            // this.log("layout_stack with size",available_size)
            let size = this._root.layout(this, available_size);
        // console.log("canvas, root requested",size)
        }
    }
    draw_stack() {
        this.ctx.imageSmoothingEnabled = this.global_smoothing;
        this.ctx.save();
        this.ctx.translate(0.5, 0.5);
        this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        this.ctx.scale(this.scale, this.scale);
        this.debug_draw_rect(new (0, $6688e477b1ca86be$export$c79fc6492f3af13d)(0, 0, this.w - 1, this.h - 1), "canvas");
        if (this._root) this.draw_view(this._root);
        this.ctx.restore();
    }
    draw_view(view) {
        this.ctx.save();
        let pos = view.position();
        this.ctx.translate(pos.x, pos.y);
        // @ts-ignore
        // console.log("drawing",view.id,view.name())
        if (view.visible()) view.draw(this);
        // @ts-ignore
        if (view.is_parent_view && view.is_parent_view() && view.visible()) {
            let parent = view;
            if (parent.clip_children()) {
                this.ctx.beginPath();
                let size = view.size();
                this.ctx.rect(0, 0, size.w, size.h);
                this.ctx.clip();
            }
            parent.get_children().forEach((ch)=>{
                if (this.debug) this.ctx.save();
                this.draw_view(ch);
                if (this.debug) this.ctx.restore();
            });
        }
        let bds = $3d39ed200ad179f0$export$e8c1e4de1c401d98(view.position(), view.size());
        // @ts-ignore
        this.debug_draw_rect(bds, view.name());
        this.ctx.restore();
    }
    fill(rect, color) {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
    }
    stroke(rect, color) {
        this.ctx.lineWidth = 1 * this.scale;
        this.ctx.strokeStyle = color;
        this.ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
    }
    fillBackgroundSize(size, color) {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(0, 0, size.w, size.h);
    }
    strokeBackgroundSize(size, color) {
        this.ctx.strokeStyle = color;
        this.ctx.strokeRect(0, 0, size.w, size.h);
    }
    debug_draw_rect(bds, title) {
        if (!this.debug) return;
        this.ctx.strokeStyle = "black";
        this.ctx.lineWidth = 0.5;
        let cx = bds.x + bds.w / 2;
        let cy = bds.y + bds.h / 2;
        for(let i = 0; i < 3; i++){
            this.ctx.beginPath();
            this.ctx.strokeStyle = i % 2 === 1 ? "red" : "black";
            this.ctx.rect(bds.x + i, bds.y + i, bds.w - i * 2, bds.h - i * 2);
            this.ctx.stroke();
        }
        let str = `${title} (${bds.x.toFixed(1)},${bds.y.toFixed(1)}) (${bds.w.toFixed(1)}x${bds.h.toFixed(1)})`;
        for(let i1 = 0; i1 < 3; i1++){
            this.ctx.font = "10px sans-serif";
            this.ctx.fillStyle = "white";
            this.ctx.fillText(str, cx + 3 + i1, cy + 3 + i1);
        }
        for(let i2 = 0; i2 < 1; i2++){
            this.ctx.font = "10px sans-serif";
            this.ctx.fillStyle = "black";
            this.ctx.fillText(str, cx + 3 + i2 + 1, cy + 3 + i2 + 1);
        }
    }
    fillRect(x, y, w, h, color) {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x, y, w, h);
    }
    screen_to_local(evt) {
        let rect = this.canvas.getBoundingClientRect();
        let pt = new (0, $6688e477b1ca86be$export$baf26146a414f24a)(evt.x - rect.x, evt.y - rect.y);
        pt.x /= this.scale;
        pt.y /= this.scale;
        return pt;
    }
    propagateKeyboardEvent(evt, path) {
        if (!this._keyboard_focus) // if(this._input_callback) this._input_callback(evt)
        return;
        if (!path) {
            this.log("no path, can't propagate");
            return;
        }
        let stopped = false;
        path.forEach((view)=>{
            if (stopped) {
                this.log("bailing out early");
                return;
            }
            view.input(evt);
            if (evt.stopped) stopped = true;
        });
    // if(this._keyboard_focus) this._keyboard_focus.input(evt)
    // if(this._input_callback) this._input_callback(evt)
    }
    keyboard_focus() {
        return this._keyboard_focus;
    }
    set_keyboard_focus(view) {
        let old = this._keyboard_focus;
        this._keyboard_focus = view;
        this.keyboard.dispatch_keyboard_focus_change(old, this._keyboard_focus);
    }
    is_keyboard_focus(view) {
        return view === this._keyboard_focus;
    }
    release_keyboard_focus(view) {
        this._keyboard_focus = null;
    }
    on_input(cb) {
        this._input_callback = cb;
    }
    measureText(caption, font_name) {
        if (font_name && this.fonts.has(font_name)) {
            let font = this.fonts.get(font_name);
            if (font) return font.measureText(caption);
        }
        this.ctx.font = (0, $1385bbac798b6a24$export$9f53be77959c9e4);
        let metrics = this.ctx.measureText(caption);
        if ("fontBoundingBoxAscent" in metrics) return new (0, $6688e477b1ca86be$export$cb6da89c6af1a8ec)(metrics.width, metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent);
        return new (0, $6688e477b1ca86be$export$cb6da89c6af1a8ec)(metrics.width, 16);
    }
    fillStandardText(caption, x, y, font_name, scale) {
        if (!scale) scale = 1;
        if (font_name && this.fonts.has(font_name)) {
            let font = this.fonts.get(font_name);
            if (font) {
                font.fillText(this.ctx, caption, x, y - (0, $1385bbac798b6a24$export$63eec52eb5416473), scale);
                return;
            }
        }
        this.ctx.fillStyle = (0, $1385bbac798b6a24$export$9b5aefa8b8f9f54);
        this.ctx.font = (0, $1385bbac798b6a24$export$9f53be77959c9e4);
        this.ctx.fillText(caption, x, y);
    }
    draw_glyph(codepoint, x, y, font_name, fill, scale) {
        if (!scale) scale = 1;
        this.ctx.fillStyle = fill;
        if (font_name && this.fonts.has(font_name)) {
            let font = this.fonts.get(font_name);
            if (font) font.draw_glpyh(this.ctx, codepoint, x, y, scale);
        }
    }
    log(...args) {
        console.log("CANVAS: ", ...args);
    }
    load_jsonfont(basefont_data, name, ref_name) {
        let fnt = basefont_data.fonts.find((ft)=>ft.name === name);
        this.fonts.set(ref_name, new $3d39ed200ad179f0$var$CanvasFont(fnt));
    }
    draw_sprite(x, y, sprite, scale) {
        this.ctx.drawImage(sprite._img, x, y, sprite._img.width * scale, sprite._img.height * scale);
    }
    draw_tilemap(tilemap, sheet, x, y, scale) {
        tilemap.forEachPixel((val, i, j)=>{
            if (!val || val === 0) return;
            // let sheet = this.doc.get_selected_sheet()
            let tile = sheet.sprites.find((t)=>t.id === val);
            this.ctx.imageSmoothingEnabled = false;
            if (tile) this.ctx.drawImage(tile._img, x + i * scale, y + j * scale, scale, scale);
        });
    }
    find_by_name(name) {
        return this.find_by_name_view(this._root, name);
    }
    find_by_name_view(view, name) {
        if (view.name() === name) return view;
        // @ts-ignore
        if (view.is_parent_view && view.is_parent_view()) {
            let parent = view;
            // go in reverse order to the top drawn children are picked first
            for(let i = parent.get_children().length - 1; i >= 0; i--){
                let ch = parent.get_children()[i];
                let res = this.find_by_name_view(ch, name);
                if (res) return res;
            }
        }
        return null;
    }
    local_to_view(pt, view) {
        let trans = this.calculate_transform_to(this._root, view);
        let f = pt.subtract(trans);
        return f;
    }
    calculate_transform_to(root, view) {
        if (root === view) return root.position().clone();
        // @ts-ignore
        if (root.is_parent_view && root.is_parent_view()) {
            let parent = root;
            for(let i = 0; i < parent.get_children().length; i++){
                let ch = parent.get_children()[i];
                let ptx = this.calculate_transform_to(ch, view);
                if (ptx) return ptx.add(root.position());
            }
        }
        return null;
    }
    view_to_local(pt, view) {
        let trans = this.calculate_transform_to(this._root, view);
        return pt.add(trans);
    }
    _setup_mouse_input() {
        this.mouse = new $3d39ed200ad179f0$var$MouseInputService(this);
        this.canvas.addEventListener("contextmenu", (e)=>{
            e.preventDefault();
            return false;
        });
        this.canvas.addEventListener("mousedown", (domEvent)=>{
            let position = this.screen_to_local(domEvent);
            this.mouse.trigger_mouse_down(position, domEvent.button);
            if (this._input_callback) this._input_callback({});
            domEvent.preventDefault();
        });
        this.canvas.addEventListener("mousemove", (domEvent)=>{
            let position = this.screen_to_local(domEvent);
            this.mouse.trigger_mouse_move(position, domEvent.button);
            if (this._input_callback) this._input_callback({});
            domEvent.preventDefault();
        });
        this.canvas.addEventListener("mouseup", (domEvent)=>{
            let position = this.screen_to_local(domEvent);
            this.mouse.trigger_mouse_up(position, domEvent.button);
            if (this._input_callback) this._input_callback({});
            domEvent.preventDefault();
        });
        this.canvas.addEventListener("wheel", (domEvent)=>{
            let position = this.screen_to_local(domEvent);
            let delta = new (0, $6688e477b1ca86be$export$baf26146a414f24a)(domEvent.deltaX, domEvent.deltaY);
            this.mouse.trigger_scroll(position, delta);
            if (this._input_callback) this._input_callback({});
            domEvent.preventDefault();
        });
    }
    _setup_keyboard_input() {
        this.keyboard = new $3d39ed200ad179f0$var$KeyboardInputService(this);
        document.addEventListener("keydown", (e)=>{
            let modifiers = {
                alt: e.altKey,
                ctrl: e.ctrlKey,
                meta: e.metaKey,
                shift: e.shiftKey
            };
            this.keyboard.trigger_key_down(e.key, e.code, modifiers);
            if (!e.altKey && !e.metaKey) e.preventDefault();
        });
        document.addEventListener("keyup", (e)=>{
            let modifiers = {
                alt: e.altKey,
                ctrl: e.ctrlKey,
                meta: e.metaKey,
                shift: e.shiftKey
            };
            this.keyboard.trigger_key_up(e.key, e.code, modifiers);
            if (!e.altKey && !e.metaKey) e.preventDefault();
        });
    }
    start() {
        this.addToPage();
        this._setup_mouse_input();
        this._setup_keyboard_input();
        this.repaint();
    }
}
class $3d39ed200ad179f0$var$CanvasFont {
    scale = 2;
    constructor(data){
        this.data = data;
        this.metas = new Map();
        this.data.glyphs.forEach((gl)=>{
            this.generate_image(gl);
            this.metas.set(gl.meta.codepoint, gl);
        });
    }
    measureText(text) {
        let xoff = 0;
        let h = 0;
        for(let i = 0; i < text.length; i++){
            let cp = text.codePointAt(i);
            if (this.metas.has(cp)) {
                let glyph = this.metas.get(cp);
                let sw = glyph.w - glyph.meta.left - glyph.meta.right;
                xoff += sw + 1;
                h = Math.max(h, glyph.h);
            } else {
                xoff += 10;
                h = Math.max(h, 10);
            }
        }
        return new (0, $6688e477b1ca86be$export$cb6da89c6af1a8ec)(xoff * this.scale, h * this.scale);
    }
    fillText(ctx, text, x, y, scale) {
        if (!scale) scale = 1;
        ctx.fillStyle = "red";
        let size = this.measureText(text);
        let xoff = 0;
        let yoff = 2;
        // ctx.fillRect(x+xoff, y+yoff, size.w, size.h)
        for(let i = 0; i < text.length; i++){
            let cp = text.codePointAt(i);
            let dx = x + xoff * this.scale * scale;
            if (this.metas.has(cp)) {
                let glyph = this.metas.get(cp);
                ctx.imageSmoothingEnabled = false;
                //@ts-ignore
                let img = glyph.img;
                let sx = glyph.meta.left;
                let sy = 0;
                let sw = glyph.w - glyph.meta.left - glyph.meta.right;
                let sh = glyph.h //- glyph.meta.baseline
                ;
                let dy = y + (yoff + glyph.meta.baseline - 1) * this.scale * scale;
                let dw = sw * this.scale * scale;
                let dh = sh * this.scale * scale;
                ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
                xoff += sw + 1;
            } else {
                //missing the glyph
                let ew = 8;
                let dy = y + yoff * this.scale * scale;
                ctx.strokeRect(dx, dy, ew * this.scale * scale, ew * this.scale * scale);
                xoff += ew + 1;
            }
        }
    }
    draw_glpyh(ctx, cp, x, y, scale) {
        let xoff = 0;
        let yoff = 2;
        if (this.metas.has(cp)) {
            let glyph = this.metas.get(cp);
            ctx.imageSmoothingEnabled = false;
            //@ts-ignore
            let img = glyph.img;
            let sx = glyph.meta.left;
            let sy = 0;
            let sw = glyph.w - glyph.meta.left - glyph.meta.right;
            let sh = glyph.h //- glyph.meta.baseline
            ;
            let dx = x + xoff * this.scale * scale;
            let dy = y + (yoff + glyph.meta.baseline - 1) * this.scale * scale;
            let dw = sw * this.scale * scale;
            let dh = sh * this.scale * scale;
            ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
        }
    }
    generate_image(gl) {
        gl.img = document.createElement("canvas");
        gl.img.width = gl.w;
        gl.img.height = gl.h;
        let c = gl.img.getContext("2d");
        c.fillStyle = "green";
        c.fillRect(0, 0, gl.img.width, gl.img.height);
        for(let j = 0; j < gl.h; j++)for(let i = 0; i < gl.w; i++){
            let n = j * gl.w + i;
            let v = gl.data[n];
            if (v % 2 === 0) {
                c.fillStyle = "white";
                // c.fillRect(i, j, 1, 1)
                c.clearRect(i, j, 1, 1);
            }
            if (v % 2 === 1) {
                c.fillStyle = "black";
                c.fillRect(i, j, 1, 1);
            }
        }
    }
}


console.log("starting the library");


//# sourceMappingURL=index.js.map
