import {CanvasSurface} from "./canvas";
import {BaseParentView, BaseView, ParentView, View} from "./core";

class EventSource<Type, Payload> {
    private listeners: Map<Type, Set<(p: Payload) => void>>;

    constructor() {
        this.listeners = new Map()
    }

    on(type: Type, cb: (p: Payload) => void) {
        this.get_listener_set(type).add(cb)
    }

    off(type: Type, cb: (p: Payload) => void) {
        this.get_listener_set(type).delete(cb)
    }

    private get_listener_set(type: Type): Set<(p: Payload) => void> {
        if (!this.listeners.has(type)) this.listeners.set(type, new Set())
        // @ts-ignore
        return this.listeners.get(type)
    }

    fire(type: Type, payload: Payload) {
        this.get_listener_set(type).forEach(cb => {
            cb(payload)
        })
    }
}

type WSEventTypes = "message" | "connected"
type Command = {
    source: string,
    type: string,
    id: string,
    object?: string,
    prop?: string,
}
type CommandResponse = {
    source: string,
    id: string,
    type: string,
    payload: any,
}

function genid(message: string) {
    return message + Math.floor(Math.random() * 1000000)
}

class RemoteMOPDebuggerConnection extends EventSource<WSEventTypes, any> {
    private ws: WebSocket;
    private connected: boolean;
    private mop: ViewMop;

    constructor() {
        super()
    }

    connect(path: string) {
        this.ws = new WebSocket(path)
        this.ws.addEventListener('open', (e) => {
            // this.connected = true
            console.log("opened", e)
            this.fire("connected", {status:"connected"})
        })
        this.ws.addEventListener('close', (e) => {
            console.log("closed", e)
            this.connected = false
        })
        this.ws.addEventListener('error', (e) => {
            console.log("error", e)
        })
        this.ws.addEventListener('message', (e) => {
            let msg = JSON.parse(e.data)
            this.fire("message", msg)
        })

        this.on('connected', () => {
            console.log("connected")
            let cmd:Command = {
                source:"guitest",
                id: genid("register-type"),
                type: "register",
                prop: "guitest",
            }
            console.log("sending out", cmd)
            this.ws.send(JSON.stringify(cmd))
        })
        this.on("message", (cmd) => {
            console.log("IN:", cmd.type,cmd.object,cmd.prop)
            if(cmd.source === "router") {
                console.log("just from the router")
            } else {
                // console.log(`invoking ${cmd.type} ${cmd.object} ${cmd.prop}`)
                let resp: CommandResponse = {
                    source: "guitest",
                    id: cmd.id,
                    type: cmd.type,
                    payload: this.mop[cmd.type](cmd.object, cmd.prop)
                }
                console.log("responding", resp)
                this.ws.send(JSON.stringify(resp))
            }
        })
    }

    setMop(mop: ViewMop) {
        this.mop = mop
    }
}

const ROOT_NAME = "ROOT"

function get_view_properties(obj: View) {
    return ["name","size","position","visible"]
}

const VIEW_PROPS = ["name","size","position","visible"]
const PARENT_VIEW_PROPS = ["children",...VIEW_PROPS]

function isParent(obj: object) {
    return obj instanceof BaseParentView
}

function calculate_view_props(obj: BaseView) {
    if(obj instanceof BaseParentView) return PARENT_VIEW_PROPS
    if(obj instanceof BaseView) return VIEW_PROPS
}

function calculate_object_props(obj: object) {
    return Object.getOwnPropertyNames(obj)
}

function calculate_object_proptype(obj: object, prop: string) {
    if(obj.hasOwnProperty(prop)) {
        let v = obj[prop]
        if(typeof v === 'object') return v.constructor.name
        return typeof (obj[prop])
    }
    return "unknown"
}

class ViewMop {
    private surface: CanvasSurface;
    private forward_cache: Map<string, object>;
    private backward_cache: Map<object, string>;
    constructor(surface: CanvasSurface) {
        this.surface = surface
        this.forward_cache = new Map<string, View>()
        this.backward_cache = new Map<View, string>()
        this.forward_cache.set(ROOT_NAME, this.surface.root())
        this.backward_cache.set(this.surface.root(), ROOT_NAME)
    }

    getRoot() {
        return this.backward_cache.get(this.surface.root())
    }
    lookup_object(obj_id:string):object {
        return this.forward_cache.get(obj_id)
    }
    getObjectProperties(obj_id:string):string[] {
        let obj = this.lookup_object(obj_id)
        // @ts-ignore
        if(isParent(obj)) return calculate_view_props(obj as View)
        if(obj instanceof BaseView) return calculate_view_props(obj)
        return calculate_object_props(obj)
    }
    getPropertyType(obj_id:string, prop:string):string {
        let obj = this.lookup_object(obj_id)
        if(isParent(obj) && prop === 'children') return "Array"
        if(prop === "name") return "string"
        if(prop === "size") return "Size"
        if(prop === "position") return "Point"
        if(prop === "visible") return "boolean"
        if(prop === "caption") return "string"
        return calculate_object_proptype(obj,prop)
    }
    getPropertyValue(object: string, prop: string): any {
        let obj = this.forward_cache.get(object)
        console.log(`getting value of ${prop} from object ${object}`,obj)
        if(prop === "name") return obj[prop]()
        if(prop === "visible") return obj[prop]()
        let pv = undefined
        if(prop === "size") pv = obj[prop]()
        if(prop === "position") pv = obj[prop]()
        if(isParent(obj) && prop === "children") {
            pv = (obj as ParentView).get_children()
        }
        if(obj.hasOwnProperty(prop)) {
            pv = obj[prop]
        }
        if (typeof pv === 'object') {
            console.log("the prop is an object. need to do some sort of reference")
            return this.get_object_id(pv)
        } else {
            return pv
        }
    }
    private get_object_id(pv: object) {
        if (!this.backward_cache.has(pv)) {
            let id = genid("object_cache")
            this.backward_cache.set(pv, id)
            this.forward_cache.set(id, pv)
            console.log("put into cache",id,pv)
        }
        console.log("object is is now", this.backward_cache.get(pv))
        return this.backward_cache.get(pv)
    }
}

export function make_debugger_connection(surface: CanvasSurface, path: string) {
    let conn = new RemoteMOPDebuggerConnection()
    conn.setMop(new ViewMop(surface))
    conn.connect(path)
}
