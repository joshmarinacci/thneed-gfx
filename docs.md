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