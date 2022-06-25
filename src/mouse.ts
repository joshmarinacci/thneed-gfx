import {
    ParentView,
    Point,
    POINTER_DOWN,
    POINTER_DRAG,
    POINTER_MOVE,
    POINTER_UP,
    PointerEvent,
    SCROLL_EVENT,
    ScrollEvent,
    View
} from "./core";
import {rect_from_pos_size, SurfaceContext} from "./canvas";

export class MouseInputService {
    private surface: SurfaceContext;
    private down: boolean;
    private path: [];
    private last_point: Point;
    private target: never;
    public debug:boolean

    constructor(surface: SurfaceContext) {
        this.surface = surface
        this.down = false
        this.last_point = new Point(0, 0)
        this.debug = false
    }

    trigger_mouse_down(position: Point, button: number) {
        this.log("trigger_mouse_down")
        this.down = true;
        this.last_point = position
        this.path = this.scan_path(position)
        this.target = this.path[this.path.length - 1] // last
        let evt = new PointerEvent(this.surface, POINTER_DOWN, position, new Point(0, 0))
        evt.button = button
        evt.target = this.target
        this.log("event is", evt)
        this.log("path is", this.path)
        this.propagatePointerEvent(evt, this.path)
        // @ts-ignore
        if(this.surface._input_callback) this.surface._input_callback(evt)
    }

    trigger_mouse_move(position: Point, button: number) {
        let delta = position.subtract(this.last_point)
        this.last_point = position.clone()
        let evt
        if (this.down) {
            evt = new PointerEvent(this.surface, POINTER_DRAG, position, delta)
        } else {
            this.path = this.scan_path(position)
            evt = new PointerEvent(this.surface, POINTER_MOVE, position, delta)
        }
        evt.button = button
        evt.target = this.path[this.path.length - 1] // last
        this.propagatePointerEvent(evt, this.path)
        // @ts-ignore
        if(this.surface._input_callback) this.surface._input_callback(evt)
    }

    trigger_mouse_up(position: Point, button: number) {
        this.log("trigger_mouse_up")
        this.down = false
        let evt = new PointerEvent(this.surface, POINTER_UP, position, new Point(0, 0))
        evt.button = button
        evt.target = this.path[this.path.length - 1] // last
        this.log("event is", evt)
        this.log("path is", this.path)
        this.propagatePointerEvent(evt, this.path)
        // @ts-ignore
        if(this.surface._input_callback) this.surface._input_callback(evt)
    }

    trigger_scroll(position: Point, delta: Point) {
        this.path = this.scan_path(position)
        let evt = new ScrollEvent(this.surface, SCROLL_EVENT, position, delta)
        this.propagateScrollEvent(evt, this.path)
        // @ts-ignore
        if(this.surface._input_callback) this.surface._input_callback(evt)
    }

    private calculate_path_to_cursor(view: View, position: Point, path: View[]): boolean {
        this.log('searching for', position, 'on', view.name())
        if (!view) return false
        if (!view.visible()) return false
        let bounds = rect_from_pos_size(view.position(), view.size())
        this.log("bounds contains position?", bounds, position)
        if (bounds.contains(position)) {
            this.log("it doesssss")
            // @ts-ignore
            if (view.is_parent_view && view.is_parent_view()) {
                this.log("is parent")
                let parent = view as unknown as ParentView;
                // go in reverse order to the top drawn children are picked first
                for (let i = parent.get_children().length - 1; i >= 0; i--) {
                    let ch = parent.get_children()[i]
                    let pos = position.subtract(view.position())
                    let picked = this.calculate_path_to_cursor(ch, pos, path)
                    if (picked) {
                        path.unshift(ch)
                        return true
                    }
                }
                if (parent.can_receive_mouse()) {
                    return true
                }
            } else {
                this.log("is not paretn, returning true")
                return true
            }
        }
        return false
    }

    private log(...args) {
        if(this.debug) console.log('MouseService:', ...args)
    }

    private scan_path(position: Point) {
        let path: [] = []
        this.calculate_path_to_cursor(this.surface.root(), position, path)
        this.log("final path is", path)
        return path
    }

    private propagatePointerEvent(evt: PointerEvent, path: []) {
        let stopped = false
        let pt = evt.position

        path.forEach((view: View) => {
            if (stopped) {
                this.log("done")
                return
            }
            // this.log("down: view",view.name())
            evt.position = evt.position.subtract(view.position())
            view.input(evt)
            if (evt.stopped) {
                stopped = true
            }
        })
    }

    private propagateScrollEvent(evt: ScrollEvent, path: []) {
        let stopped = false
        let pt = evt.position.clone()
        evt.direction = "down"
        path.forEach((view: View) => {
            if (stopped) {
                return
            }
            evt.position = evt.position.subtract(view.position())
            view.input(evt)
            if (evt.stopped) {
                stopped = true
            }
        })
        if (stopped) return;
        path.reverse()
        evt.direction = "up"
        path.forEach((view: View) => {
            if (stopped) {
                // this.log("done")
                return
            }
            evt.position = evt.position.add(view.position())
            view.input(evt)
            if (evt.stopped) {
                stopped = true
            }
        })
    }

}