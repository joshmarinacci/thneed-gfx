# Thneed-GFX

This is a GUI lib usable for small games and apps It contains a classic style GUI toolkit (not framework), in the style
of Swing, Cocoa, and Win32.  You have a tree of components, the components are drawn, inputs come in. It's designed
to be very clean and easy to understand, while still pretty fast.  Currently targets HTML canvas, but any raster 
destination should be possible (Linux framebuffer, SDL surface, memory buffer). Usable for apps and games.

# getting started

Create a canvas surface, init the inputs, add some components, then go.

Put this into `simple.js`

```typescript
import {CanvasSurface, LayerView, ActionButton} from "./node_modules/thneed-gfx/dist/index.js";

export function start() {
    let surface = new CanvasSurface(1200, 700);
    surface.addToPage()

    let button = new ActionButton()
    button.set_caption("this is a button")

    let root = new LayerView()
    root.add(button)
    surface.set_root(root)
    surface.start()
}
```

Create a simple html file referencing your `simple.js`

```html
<html>
<body>
<script type="module">
    import {start} from "./simple.js"
    start()
</script>
</body>
</html>
```

# use for simple games

If you want to use Thneed for games, create a view that draws the current state 
of your game on every frame. This example moves a rectangle around whenever you 
press an arrow key. On every refresh the game screen will
fill the background with cyan, then draw the ball in red.  Refresh
only happens on key events.

```javascript
class GameScreen extends BaseView {
    constructor(ball: Rect) {
        super("game-screen");
        this.ball = ball
    }
    draw(g: SurfaceContext): void {
        g.fillBackgroundSize(this.size(),'cyan')
        g.fill(this.ball, 'red')
    }

    layout(g: SurfaceContext, available: Size): Size {
        this.set_size(available)
        return this.size()
    }
}

export async function start2() {
    let surface = new CanvasSurface(1200, 700);

    let ball = new Rect(100,100,20,20)
    let screen = new GameScreen(ball)
    let root = new LayerView()
    root.add(screen)
    surface.set_root(root)
    surface.on_input((evt) => {
        if(evt.type === KEYBOARD_DOWN) {
            if(evt.key === 'ArrowLeft')  ball.x -= 10
            if(evt.key === 'ArrowRight') ball.x += 10
            if(evt.key === 'ArrowUp')  ball.y -= 10
            if(evt.key === 'ArrowDown') ball.y += 10
            surface.repaint()
        }
    })

    surface.addToPage()
    surface.start()
}
```

If you want the game to refresh 60 times a second instead of when
input events happen, you can make a simple event loop like this:

```javascript
    function game_update() {
        console.log('things to do on every tick')
    }
    function refresh() {
        game_update()
        surface.repaint()
        requestAnimationFrame(refresh)
    }
    requestAnimationFrame(refresh)

```

Instead of capturing each input event with the `on_input()` method,
you can check the current state of the keyboard like this:

```javascript
class KeyboardMonitor {
    key_map: Map<string, boolean>;
    constructor() {
        this.key_map = new Map<string,boolean>();
    }
    handle_input(evt:any) {
        if (evt.type === KEYBOARD_UP) {
            this.key_map.set(evt.code, false)
        }
        if (evt.type === KEYBOARD_DOWN) {
            this.key_map.set(evt.code, true)
        }
    }
    is_down(name: string):boolean {
        if(!this.key_map.has(name)) this.key_map.set(name,false)
        return this.key_map.get(name)
    }

    monitor(surface: CanvasSurface) {
        surface.on_input((e)=>this.handle_input(e))
    }
}
```

Register it like this:
```javascript
    let kbd = new KeyboardMonitor()
    kbd.monitor(surface)

```

And check it on every frame in the `game_update()` function

```javascript
    function game_update() {
        if(kbd.is_down('ArrowLeft'))  ball.x -= 1
        if(kbd.is_down('ArrowRight')) ball.x += 1
        if(kbd.is_down('ArrowUp'))    ball.y -= 1
        if(kbd.is_down('ArrowDown'))  ball.y += 1
    }
```


# working with sprites

TBD


# the rules of making custom Views

All Views must
* have a constructor that takes no arguments. the constructor should allocate all internal properties
* use `propname()` and `set_propname()` for property getters and setters, when applicable
* have an id and name field with `name()` and `set_name()`

In general you don't need to worry about these rules if you extend the BaseView or BaseParentView classes
since they take care of most of the work. 


The core principal is to have as little as possible in the widget tree. Most work doesn't need to be done
by the View classes. Instead it can be done by functions that operate on the tree. For example, Views don't
have a function to restore from JSON properties. Instead you can use the external `with_props()` function
to assign properties from JSON or in code.

Other features which are implemented by functions rather than in the View heirarchy include:
* setting properties with automation
* fetching theme values
* attaching custom event handlers
* picking views from within the rendered tree
* dispatching mouse, keyboard, and other events

This philosophy means Views themselves can be very lightweight with just the code they need to get
work done, and the class heirarchy is very shallow. It is very possible to implement your own view without
subclassing at all.  This also means the toolkit is easier to port to other languages.