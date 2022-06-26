import {
    FOCUS_GAINED,
    FOCUS_LOST,
    FocusEvent,
    KEYBOARD_DOWN,
    KEYBOARD_UP,
    KeyboardEvent, KeyCode,
    Modifiers,
    ParentView,
    View
} from "./core";
import {SurfaceContext} from "./canvas";

//generate constants from
// KEY_A, KEY_B, KEY_C etc
// ARROW_LEFT, ARROW_RIGHT, etc.
// ENTER, BACKSPACE
// produces code like logical_keys.ts, and logical_keys.rst and json file
// hand code dom_keys.ts
// hand code sdl_keys.rst
// later add validation to the key generation step

// use plain JS for separate generator project which makes these files
// for now don't publish them, just copy them into the projects that need them.

// generate shared function code too
// fn sdl_to_common(kc: Keycode) -> KeyCode {
//     match kc {
//         Keycode::Escape => KeyCode::ESC,
//         Keycode::Left => KeyCode::ARROW_LEFT,
//         Keycode::Right => KeyCode::ARROW_RIGHT,
//         Keycode::Up => KeyCode::ARROW_UP,
//         Keycode::Down => KeyCode::ARROW_DOWN,
//         Keycode::P => KeyCode::LETTER_P,
//         Keycode::Q => KeyCode::LETTER_Q,
//         Keycode::A => KeyCode::LETTER_A,
//         _ => {
//             KeyCode::UNKNOWN
//         }
//     }
// }


export class KeyboardInputService {
    private surface: SurfaceContext;
    public debug:boolean

    private log(...args) {
        if(this.debug) console.log('KeyboardService:', ...args)
    }

    constructor(surface: SurfaceContext) {
        this.surface = surface
        this.debug = false
    }

    dispatch_keyboard_focus_change(old_focus: View, new_focus: View) {
        let e_old = new FocusEvent(this.surface, FOCUS_LOST)
        //send focus lost to old focus
        if (old_focus) old_focus.input(e_old)
        //send focus gained to new focus
        let e_new = new FocusEvent(this.surface, FOCUS_GAINED)
        if (new_focus) new_focus.input(e_new)
        //don't use a path, no one can intercept?
    }

    private calculate_path_to_keyboard_focus(root: View, target: View): View[] | boolean {
        if (!root) return false
        if (!root.visible()) return false
        if (root === target) return [root]
        // @ts-ignore
        if (root.is_parent_view && root.is_parent_view()) {
            let parent = root as unknown as ParentView;
            for (let i = parent.get_children().length - 1; i >= 0; i--) {
                let ch = parent.get_children()[i]
                // this.log('checking child',ch)
                let res = this.calculate_path_to_keyboard_focus(ch, target)
                if (res) {
                    (res as View[]).unshift(root)
                    return res as View[]
                }
            }
        }
    }

    propagateKeyboardEvent(evt: KeyboardEvent, path: View[]) {
        this.log("propagating keyboard event",evt,path)
        if (!this.surface.keyboard_focus()) {
            return
        }
        if (!path) {
            this.log("no path, can't propagate")
            return
        }
        let stopped = false
        path.forEach((view: View) => {
            if (stopped) {
                this.log("bailing out early")
                return
            }
            view.input(evt)
            if (evt.stopped) stopped = true
        })
    }


    trigger_key_down(key: string, code: string, modifiers: Modifiers) {
        let evt = new KeyboardEvent(this.surface, KEYBOARD_DOWN)
        evt.key = key
        evt.code = code
        evt.modifiers = modifiers
        let path = this.calculate_path_to_keyboard_focus(this.surface.root(), this.surface.keyboard_focus()) as View[]
        this.propagateKeyboardEvent(evt, path)
        // @ts-ignore
        if(this.surface._input_callback) this.surface._input_callback(evt)
    }

    trigger_key_up(key: string, code: string, modifiers: Modifiers) {
        let evt = new KeyboardEvent(this.surface, KEYBOARD_UP)
        evt.key = key
        evt.code = code
        evt.modifiers = modifiers
        let path = this.calculate_path_to_keyboard_focus(this.surface.root(), this.surface.keyboard_focus()) as View[]
        this.propagateKeyboardEvent(evt, path)
        // @ts-ignore
        if(this.surface._input_callback) this.surface._input_callback(evt)
    }
}