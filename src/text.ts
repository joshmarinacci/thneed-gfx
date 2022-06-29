import {
    BaseView,
    CoolEvent,
    FOCUS_CATEGORY,
    gen_id,
    KEYBOARD_DOWN,
    KeyboardEvent,
    Point,
    POINTER_DOWN,
    Rect,
    Size
} from "./core";
import {SurfaceContext} from "./canvas";
import {LOGICAL_KEYBOARD_CODE} from "./generated";
import {HBox} from "./containers";
import {IconButton} from "./components";

export class TextLine extends BaseView {
    text: string;
    private cursor: number;
    pref_width: number;

    constructor() {
        super(gen_id("text-line"));
        this._name = '@text-line'
        this.text = "abc"
        this.pref_width = 100
        this.cursor = this.text.length
    }

    draw(g: SurfaceContext): void {
        let bg = '#dddddd'
        if (g.is_keyboard_focus(this)) bg = 'white'
        g.fillBackgroundSize(this.size(), bg)
        g.strokeBackgroundSize(this.size(), 'black')
        if (g.is_keyboard_focus(this)) {
            // g.ctx.fillStyle = TextColor
            // g.ctx.font = StandardTextStyle
            let parts = this._parts()
            let bx = 5
            let ax = bx + g.measureText(parts.before, 'base').w
            g.fillStandardText(parts.before, bx, 20, 'base')
            g.fillStandardText(parts.after, ax, 20, 'base')
            // g.ctx.fillStyle = 'black'
            g.fill(new Rect(ax, 2, 2, 20), '#000000')
            // g.ctx.fillRect(ax, 2, 2, 20)
            // console.log("cursor at",ax)
        } else {
            g.fillStandardText(this.text, 5, 20, 'base');
        }
    }

    input(event: CoolEvent) {
        if (event.category === FOCUS_CATEGORY) {
            // this.log("got keyboard focus change",event.category)
        }
        if (event.type === POINTER_DOWN) {
            event.ctx.set_keyboard_focus(this)
        }
        if (event.type === KEYBOARD_DOWN) {
            let e = event as KeyboardEvent
            this.log("keyboard code", e.code)
            this.log("keyboard key", e.key)
            if (e.code === LOGICAL_KEYBOARD_CODE.DELETE ||
                (e.code === LOGICAL_KEYBOARD_CODE.KEY_D && e.modifiers.ctrl)) return this.delete_right()
            if (e.code === LOGICAL_KEYBOARD_CODE.BACKSPACE) return this.delete_left()
            if (e.code === LOGICAL_KEYBOARD_CODE.ARROW_LEFT) return this.cursor_left()
            if (e.code === LOGICAL_KEYBOARD_CODE.ARROW_RIGHT) return this.cursor_right()
            if (e.code === LOGICAL_KEYBOARD_CODE.ENTER) {
                event.ctx.release_keyboard_focus(this)
                this.fire('action', this.text)
                return
            }
            if (e.key && e.key.length === 1) this.insert(e.key)
        }
    }

    layout(g: SurfaceContext, available: Size): Size {
        this.set_size(new Size(this.pref_width, 26))
        if (this._hflex) {
            this.size().w = available.w
        }
        return this.size()
    }

    private insert(key: string) {
        let parts = this._parts()
        this.text = `${parts.before}${key}${parts.after}`
        this.cursor_right()
        this.fire('change', this.text)
    }

    private delete_left() {
        let parts = this._parts()
        this.text = `${parts.before.slice(0, parts.before.length - 1)}${parts.after}`
        this.cursor_left()
        this.fire('change', this.text)
    }

    private delete_right() {
        let parts = this._parts()
        this.text = `${parts.before}${parts.after.slice(1)}`
        this.fire('change', this.text)
    }

    private cursor_left() {
        this.cursor -= 1
        if (this.cursor < 0) this.cursor = 0
    }

    private cursor_right() {
        this.cursor += 1
        if (this.cursor > this.text.length) this.cursor = this.text.length
    }

    private _parts() {
        return {
            before: this.text.slice(0, this.cursor),
            after: this.text.slice(this.cursor),
        }
    }

    set_text(name: string) {
        this.text = name
        this.cursor = this.text.length
        this.fire('change', this.text)
    }

    set_pref_width(w: number) {
        this.pref_width = w
    }
}

type IndexPosition = {
    count:number
}
type RCPosition = {
    block:number,
    inset:number,
}
class DocModel {
    _full_text: string;
    blocks:string[];
    cursor:IndexPosition
    constructor() {
        this.cursor = {
            count: 0
        }
    }
    set_text(text: string) {
        this._full_text = text;
        this._split_newlines()
    }

    private _split_newlines() {
        this.blocks = this._full_text.split("\n")
    }

    index_to_rc(index:IndexPosition):RCPosition {
        if(index.count < 0) return {
            block:0,
            inset:0,
        }
        let n = index.count
        for(let i = 0; i< this.blocks.length; i++) {
            let blk = this.blocks[i]
            if(n-blk.length < 0) {
                return {
                    block:i,
                    inset:n,
                }
            }
            n = n-blk.length
        }
        return {
            block:this.blocks.length-1,
            inset: this.blocks[this.blocks.length-1].length-1
        }
    }
    rc_to_index(rc: RCPosition):IndexPosition {
        let n = 0
        if(rc.block <0) return { count:0 }
        for(let i=0; i<rc.block; i++) {
            n += this.blocks[i].length
        }
        return { count: n + rc.inset }
    }
    char_at_index(n: IndexPosition) {
        return this._full_text[n.count]
    }
    char_at_rc(rc: RCPosition) {
        return this.blocks[rc.block][rc.inset]
    }
    add_rc(rc: RCPosition, count: number):RCPosition {
        let ind = this.rc_to_index(rc)
        ind.count += count
        return this.index_to_rc(ind)
    }
    subtract_rc(rc: RCPosition, count: number):RCPosition {
        let ind = this.rc_to_index(rc)
        ind.count -= count
        return this.index_to_rc(ind)
    }

    insert(key) {
        let rc = this.index_to_rc(this.cursor)
        let line = this.blocks[rc.block]
        let before = line.substring(0,rc.inset)
        let after = line.substring(rc.inset)
        line = before + key + after
        this.blocks[rc.block] = line
        this.cursor_right(1)
    }
    delete_right(count: number) {
        let rc = this.index_to_rc(this.cursor)
        let line = this.blocks[rc.block]
        let before = line.substring(0,rc.inset)
        let after = line.substring(rc.inset+1)
        line = before + after
        this.blocks[rc.block] = line
    }
    delete_left(count: number) {
        let rc = this.index_to_rc(this.cursor)
        let line = this.blocks[rc.block]
        let before = line.substring(0,rc.inset-1)
        let after = line.substring(rc.inset)
        line = before + after
        this.blocks[rc.block] = line
        this.cursor_left(1)
    }

    cursor_left(count:number) {
        if(this.cursor.count > count-1) {
            this.cursor.count -= count
        }
    }
    cursor_right(count:number) {
        let rc = this.index_to_rc(this.cursor)
        rc = this.add_rc(rc,count)
        this.cursor = this.rc_to_index(rc)
    }
    cursor_up(count: number) {
        let rc = this.index_to_rc(this.cursor)
        rc.block -= count
        if(rc.block >= 0) {
            this.cursor = this.rc_to_index(rc)
        }
    }
    cursor_down(count: number) {
        let rc = this.index_to_rc(this.cursor)
        rc.block += count
        if(rc.block < this.blocks.length) {
            this.cursor = this.rc_to_index(rc)
        }
    }

    cursor_line_start() {
        let rc = this.index_to_rc(this.cursor)
        rc.inset = 0
        this.cursor = this.rc_to_index(rc)
    }
    cursor_line_end() {
        let rc = this.index_to_rc(this.cursor)
        let blk = this.blocks[rc.block]
        rc.inset = blk.length-1
        this.cursor = this.rc_to_index(rc)
    }

    split_block(rc: RCPosition) {
        console.log("breaking at",rc)
        let blk = this.blocks[rc.block]
        console.log("block is",blk)
        console.log("before is",this.blocks)
        // console.log("cursor is",this.cursor)
        let blk_before = blk.substring(0,rc.inset)
        let blk_after = blk.substring(rc.inset)
        console.log(`parts: '${blk_before}' - '${blk_after}' `)
        this.blocks.splice(rc.block,1,blk_before,blk_after)
        console.log("after is",this.blocks)
        // this.cursor = this.rc_to_index(this.add_rc(this.index_to_rc(this.cursor),1))
        // console.log("cursor is",this.cursor)
    }
}
class DocLayout {
    model: DocModel;
    blocks: any[];
    constructor(doc: DocModel) {
        this.model = doc
    }

    size:Size;
}

type ItRes = {
    value: any,
    done: boolean,
}

class WhitespaceIterator {
    n: number
    private text: string;
    private done: boolean;

    constructor(text: string) {
        this.n = 0;
        this.text = text;
        this.done = false
    }

    next(): ItRes {
        if (this.done) return {value: null, done: true}
        let chunk = ""
        while (true) {
            let ch = this.text[this.n]
            this.n++
            if (this.n > this.text.length) {
                this.done = true
                return {
                    value: chunk,
                    done: false
                }
            }
            if (ch === ' ') {
                return {
                    value: chunk,
                    done: false
                }
            } else {
                chunk += ch
            }
        }
    }

}

function do_layout(doc: DocModel, size: Size, g: SurfaceContext, line_height: number):DocLayout {

    let dc = new DocLayout(doc)
    dc.size = size
    // console.log("laying out against",size)

    dc.blocks = []
    doc.blocks.forEach((blk,i) => {
        let chunks = new WhitespaceIterator(blk)
        // console.log(`laying out '${blk}'`)
        let res = chunks.next()
        let font = 'base'

        let curr_pos = new Point(0,0)
        let curr_w = 0
        let avail_w = size.w
        let curr_text = ""
        let block = []
        while (res.done === false) {
            let m = g.measureText(res.value, font)
            if (curr_pos.x + curr_w + m.w < avail_w) {
                curr_text += res.value + " "
                curr_w += m.w + g.measureText(" ", font).w
            } else {
                // let line = make_line_box(curr_text, curr_w, line_height, curr_pos, run.style)
                let line = curr_text
                block.push(line)
                curr_text = res.value
                curr_w = m.w
                curr_pos.x = 0//para.style.padding_width
                curr_pos.y += line_height
            }
            res = chunks.next()
        }
        block.push(curr_text)
        dc.blocks.push(block)
    })

    return dc
}

function do_render(tree: DocLayout, g: SurfaceContext, selected_box: any, line_height: number) {
    let ind = tree.model.cursor
    let rc = tree.model.index_to_rc(ind)
    let pos = new Point(0,0)
    pos.x = 5
    tree.blocks.forEach((blk,i) => {
        blk.forEach((line)=>{
            pos.y += line_height
            g.fillStandardText(line,pos.x,pos.y,'base')
        })
        if(rc.block === i) {
            let before = blk[0].substring(0,rc.inset)
            let metrics = g.measureText(before,'base')
            let letter = blk[0].substring(rc.inset,rc.inset+1)
            let pt = pos.add(new Point(metrics.w,0))
            g.fill(new Rect(pt.x, pt.y-20,1,25),'#ff0000')
            let lm = g.measureText(letter,'base')
            g.stroke(new Rect(pt.x,pt.y-lm.h,lm.w,lm.h),'#00ff00')
        }
    })

    g.fillText(`${ind.count} == ${rc.block}, ${rc.inset}`,new Point(5,200-10),'#000000')

}

function run_tests() {
    let doc = new DocModel()
    doc.set_text('abcdefghij\nklmno\n123')
    console.dir(doc)
    console.assert(doc.blocks.length ===3);

    {
        let n: IndexPosition = {count: 0}
        console.assert(n.count === 0)
        let rc: RCPosition = doc.index_to_rc(n);
        console.assert(rc.block === 0)
        console.assert(rc.inset === 0)
        console.assert(doc.char_at_index(n)==='a','char at 0 is a')
    }
    {
        let rc: RCPosition = doc.index_to_rc({count:9});
        console.assert(rc.block === 0)
        console.assert(rc.inset === 9)
    }
    {
        let rc: RCPosition = doc.index_to_rc({count:12});
        console.assert(rc.block === 1)
        console.assert(rc.inset === 2)
        console.assert(doc.char_at_rc(rc)==='m',`letter at index 12 is m !== ${doc.char_at_rc(rc)}`)
    }

    {
        //set move cursor from block zero to block one by moving to the right
        let rc:RCPosition = doc.index_to_rc({count:0})
        let rc2 = doc.add_rc(rc,1)
        console.assert(rc2.block===0 && rc2.inset===1)
        let rc3 = doc.add_rc(rc,12)
        console.assert(rc3.block===1 && rc3.inset===2)
        let rc4 = doc.add_rc(rc,15)
        console.assert(rc4.block===2 && rc4.inset===0)
        let rc5 = doc.add_rc(rc,30) //go off the end. should clamp to last index
        console.assert(rc5.block===2 && rc5.inset===2)
    }

    {
        // move from block 1 to block 0 by moving to the left
        let rc1:RCPosition = doc.index_to_rc({count:11})
        console.assert(rc1.block===1 && rc1.inset===1)
        console.assert(doc.char_at_rc(rc1)==='l',`letter at index 12 is l !== ${doc.char_at_rc(rc1)}`)
        let rc2 = doc.subtract_rc(rc1,5)
        console.assert(rc2.block===0 && rc2.inset===6)
        console.assert(doc.char_at_rc(rc2)==='g',`letter at index 12 is l !== ${doc.char_at_rc(rc2)}`)
    }

    {
        let rc1:RCPosition = doc.index_to_rc({count:3})
        console.assert(doc.char_at_rc({block:0, inset:3}) === 'd')
        doc.split_block(rc1)
        console.assert(doc.char_at_rc({block:1, inset:0}) === 'd')
    }




    /*
    console.assert(doc.cursor.count===0,'cursor at 0')
    //move the cursor from 0 one to the left, should still be 0
    doc.cursor_left(1)
    console.assert(doc.index_cursor===0,'cursor left')

    //move cursor right from 0 to 1
    doc.cursor_right(1)
    console.assert(doc.index_cursor===1,'cursor right 1')
    doc.cursor_right(3)
    console.assert(doc.index_cursor===4,'cursor right 3')

    doc.cursor_right(30)
    console.assert(doc.index_cursor===34,'cursor right 30')

    // doc.cursor_right()

     */
}

export class TextBox extends BaseView {
    private pref_height: number;
    _doc: DocModel;
    render_tree_root: DocLayout
    private selected_box: any;
    private _line_height: number;
    constructor() {
        super("text- box");
        this._line_height = 22
        this.pref_height = 100
        this._doc = new DocModel()
        // this._doc.set_text("This is some very nice and cool\nand wrapped text!");
        this._doc.set_text("This is some text\nand wrapped text!");
        this._hflex = true
        this._vflex = true
        run_tests()
    }
    set_pref_height(h:number) {
        this.pref_height = h;
    }
    draw(g: SurfaceContext): void {
        let bg = '#dddddd'
        if (g.is_keyboard_focus(this)) bg = '#ffffff'
        g.fillBackgroundSize(this.size(), bg)
        g.strokeBackgroundSize(this.size(), '#000000')
        do_render(this.render_tree_root, g, this.selected_box, this._line_height)
    }
    layout(g: SurfaceContext, available: Size): Size {
        this.set_size(available)
        this.render_tree_root = do_layout(this._doc, this.size(), g, this._line_height)
        return this.size()
    }
    input(event: CoolEvent) {
        if (event.category === FOCUS_CATEGORY) {
            // this.log("got keyboard focus change",event.category)
        }
        if (event.type === POINTER_DOWN) {
            event.ctx.set_keyboard_focus(this)
        }
        if (event.type === KEYBOARD_DOWN) {
            let e = event as KeyboardEvent
            this.log("keyboard code", e.code)
            this.log("keyboard key", e.key)
            if(e.modifiers.ctrl) {
                if(e.code === LOGICAL_KEYBOARD_CODE.KEY_D) return this._doc.delete_right(1)
                if(e.code === LOGICAL_KEYBOARD_CODE.KEY_A) return this._doc.cursor_line_start()
                if(e.code === LOGICAL_KEYBOARD_CODE.KEY_E) return this._doc.cursor_line_end()
                if(e.code === LOGICAL_KEYBOARD_CODE.KEY_F) return this._doc.cursor_right(1)
                if(e.code === LOGICAL_KEYBOARD_CODE.KEY_B) return this._doc.cursor_left(1)
                if(e.code === LOGICAL_KEYBOARD_CODE.KEY_P) return this._doc.cursor_up(1)
                if(e.code === LOGICAL_KEYBOARD_CODE.KEY_N) return this._doc.cursor_down(1)
            }
            if (e.code === LOGICAL_KEYBOARD_CODE.DELETE) return this._doc.delete_right(1)
            if (e.code === LOGICAL_KEYBOARD_CODE.BACKSPACE) return this._doc.delete_left(1)
            if (e.code === LOGICAL_KEYBOARD_CODE.ARROW_LEFT) return this._doc.cursor_left(1)
            if (e.code === LOGICAL_KEYBOARD_CODE.ARROW_RIGHT) return this._doc.cursor_right(1)
            if (e.code === LOGICAL_KEYBOARD_CODE.ARROW_UP) return this._doc.cursor_up(1)
            if (e.code === LOGICAL_KEYBOARD_CODE.ARROW_DOWN) return this._doc.cursor_down(1)
            if (e.code === LOGICAL_KEYBOARD_CODE.ENTER) return this._doc.split_block(this._doc.index_to_rc(this._doc.cursor))
            if (e.key && e.key.length === 1) this._doc.insert(e.key)
        }
    }

    set_text(text: string) {
        this._doc.set_text(text);
    }
}

export class NumberTextLine extends HBox {
    private _value: number
    private text_line: TextLine;
    private up_button: IconButton;
    private down_button: IconButton;

    constructor() {
        super()
        this.pad = 1
        this._value = 0
        this.text_line = new TextLine()
        this.add(this.text_line)
        this.text_line.on('change', () => {
            let v = parseInt(this.text_line.text, 10);
            if (Number.isInteger(v)) {
                this._value = v
            } else {
                this.log("invalid!")
            }
        })
        this.up_button = new IconButton()
        this.up_button.set_icon(8593)
        this.up_button.on('action', () => {
            this.set_value(this.value() + 1)
        })
        this.down_button = new IconButton()
        this.down_button.set_icon(8595)
        this.down_button.on('action', () => {
            this.set_value(this.value() - 1)
        })
        this.add(this.up_button)
        this.add(this.down_button)
    }

    override draw(g): void {
        super.draw(g)
        if (!this.is_valid()) {
            g.strokeBackgroundSize(this.size(), '#ff0000')
        }
    }

    public set_value(value: number) {
        this._value = value
        this.text_line.set_text('' + value)
    }

    private is_valid() {
        let v = parseInt(this.text_line.text)
        return Number.isInteger(v)
    }

    value(): number {
        return this._value
    }
}