import {ActionButton, CanvasSurface, DebugLayer, LayerView, SurfaceContext} from "../src";

class Blocker extends LayerView {
    override draw(g: SurfaceContext) {
        g.fillStandardText("I haz all your pointers!", 100,100)
    }
    override can_receive_mouse(): boolean {
        return true
    }
}
export function start() {
    let surface = new CanvasSurface(640, 480);
    let root = new LayerView()
    let button = new ActionButton()
    button.set_caption('can you click me?')
    root.add(button)
    root.add(new Blocker())
    surface.set_root(root)
    surface.addToPage()
    surface.start()
    surface.repaint()
}
