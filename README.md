# thneed-gfx
A pure JS / Canvas Graphics and GUI lib, for simple apps and 2d games.


# getting started

create a new surface, add a single button, draw it

```javascript
import {COMMAND_ACTION, CanvasSurface, ActionButton} from "thneed-gfx"

let surface = new CanvasSurface(200,200, 1.0);
let button = new ActionButton()
button.set_caption('Greetings Earthling');
button.on(COMMAND_ACTION, () => {
    button.set_caption("you clicked on me")
})
let root = new LayerView()
root.add(button)
surface.set_root(root)
surface.start()
```

Use `surface.start()` to start with no repaint strategy.
Use `surface.start_input()` to start with repainting after every key board and mouse event
Use `surface.start_game()` to start with repainting at the default framerate (60fps for browser)

