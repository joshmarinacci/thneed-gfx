import {ActionButton, CanvasSurface, DebugLayer, LayerView} from "../dist/";

export function start() {
    let surface = new CanvasSurface(640, 480);
    let root = new LayerView()
    root.add(new ActionButton())
    root.add(new DebugLayer())
    surface.set_root(root)
    surface.addToPage()
    surface.start()
    surface.repaint()
}
