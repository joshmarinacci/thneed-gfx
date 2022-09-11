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
const VIEW_PROPS = ["name","size","position","visible"]
const PARENT_VIEW_PROPS = ["children",...VIEW_PROPS]

function isParent(obj: object) {
    return obj instanceof BaseParentView
}

export type MopObject = string
export type MopPropName = string
export type MopType = string
export type MopPropDef = {
    name: MopPropName,
    type: MopType,
    primitive: boolean,
    value: any,
}

export interface Mop {
    getRoot(): MopObject
    getObjectProperties(obj: MopObject): MopPropDef[]
}


class ViewMop implements Mop {
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
    _lookup_object(obj_id:string):object {
        return this.forward_cache.get(obj_id)
    }
    getRoot() {
        return this.backward_cache.get(this.surface.root())
    }
    getObjectProperties(obj_id:string):MopPropDef[] {
        let obj = this._lookup_object(obj_id)
        // @ts-ignore
        console.log("obj is",isParent(obj))
        if(isParent(obj)) return PARENT_VIEW_PROPS.map(name => {
            let parent = obj as BaseParentView
            if(name === "children") return {
                name:"children",
                type:"Array",
                primitive:false,
                value:this.get_object_id(parent.get_children())
            }
            return this._calculate_prop_def(name,obj[name]())
        })
        if(obj instanceof BaseView) return VIEW_PROPS.map(name => {
            return this._calculate_prop_def(name,obj[name]())
        })
        return this._calculate_object_props(obj)
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
    private _calculate_prop_def(name:string, value:any):MopPropDef {
        let prim = false
        if(typeof value === 'number') prim = true
        if(typeof value === 'boolean') prim = true
        if(typeof value === 'string') prim = true
        let type = typeof value
        if(type === 'object') {
            type = value.constructor.name
            value = this.get_object_id(value)
        }
        return {
            name: name,
            type: type,
            primitive: prim,
            value: value
        }
    }
    private _calculate_view_props(obj: View):MopPropDef[] {
        if(obj instanceof BaseView || obj instanceof BaseParentView) {
            return VIEW_PROPS.map(name => {
                let value:any = obj[name]()
                return this._calculate_prop_def(name,value)
            })
        }

    }

    private _calculate_object_props(obj: object):MopPropDef[] {
        return Object.getOwnPropertyNames(obj).map(name => this._calculate_prop_def(name,obj[name]))
    }
}

export function make_debugger_connection(surface: CanvasSurface, path: string) {
    let conn = new RemoteMOPDebuggerConnection()
    conn.setMop(new ViewMop(surface))
    conn.connect(path)
}
