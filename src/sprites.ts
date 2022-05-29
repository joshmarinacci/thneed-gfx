import {gen_id} from "./core";

export interface Palette {
    get_color_palette(): string[];
}
export class Sprite {
    id: string
    name:string
    w: number
    h: number
    data: number[]
    _img: HTMLCanvasElement
    private palette: Palette;

    constructor(id:string, name:string, w:number, h:number, palette:Palette) {
        this.id = id || gen_id('unknown');
        this.name = name || 'unknown'
        this.w = w;
        this.h = h;
        this.data = []
        for (let i = 0; i < this.w * this.h; i++) {
            this.data[i] = 0;
        }
        this._img = document.createElement('canvas')
        this._img.width = this.w
        this._img.height = this.h
        this.palette = palette
    }

    forEachPixel(cb: (val: any, i: number, j: number) => void) {
        for (let j = 0; j < this.h; j++) {
            for (let i = 0; i < this.w; i++) {
                let n = j * this.w + i;
                let v = this.data[n];
                cb(v, i, j);
            }
        }
    }

    set_pixel(x: number, y: number, color: any) {
        let n = y * this.w + x;
        this.data[n] = color;
        this.sync()
    }
    sync() {
        // console.log("syncing a sprite")
        let c = this._img.getContext('2d')
        let pal = this.palette.get_color_palette()
        c.clearRect(0,0,this._img.width, this._img.height)
        this.forEachPixel((v,i,j)=>{
            c.fillStyle = pal[v]
            c.fillRect(i, j, 1, 1)
        })
    }

    get_pixel(x: number, y: number):any {
        let n = y * this.w + x;
        return this.data[n]
    }

    toJsonObj():object {
        return {
            clazz:'Sprite',
            id:this.id,
            name:this.name,
            w:this.w,
            h:this.h,
            data:this.data,
        }
    }
}
export class Sheet {
    sprites: Sprite[];
    private id: string;
    name: string;
    constructor(id:string, name:string) {
        this.id = id || gen_id('unknown');
        this.name = name || 'unknown'
        this.sprites = []
    }
    add(sprite: Sprite) {
        this.sprites.push(sprite)
    }

    toJsonObj() {
        return {
            clazz:'Sheet',
            id:this.id,
            name:this.name,
            sprites: this.sprites.map(sp => sp.toJsonObj())
        }
    }
}
export class Tilemap {
    id:string
    name: string
    w: number
    h: number
    data: number[];

    constructor(id, name, w, h) {
        this.id = id || gen_id('unknown');
        this.name = name || 'unknown'
        this.w = w;
        this.h = h;
        this.data = []
        for (let i = 0; i < this.w * this.h; i++) {
            this.data[i] = 0;
        }
    }

    forEachPixel(cb: (val: any, i: number, j: number) => void) {
        for (let j = 0; j < this.h; j++) {
            for (let i = 0; i < this.w; i++) {
                let n = j * this.w + i;
                let v = this.data[n];
                cb(v, i, j);
            }
        }
    }
    expand_width(number: number) {
        let new_tm = new Tilemap("temp","temp",this.w+number,this.h);
        this.forEachPixel((val, i, j) => {
            new_tm.set_pixel(i,j,val)
        })
        this.data = new_tm.data
        this.w = new_tm.w
        this.h = new_tm.h
    }

    set_pixel(x: number, y: number, color: any) {
        let n = y * this.w + x;
        this.data[n] = color;
    }
    get_pixel(x: number, y: number):any {
        let n = y * this.w + x;
        return this.data[n]
    }

    toJsonObj() {
        return {
            clazz:'Tilemap',
            id:this.id,
            name:this.name,
            w:this.w,
            h:this.h,
            data:this.data,
        }
    }


}
type GlyphMeta = {
    codepoint:number
    left:number,
    right:number,
    baseline:number,
}
export class SpriteGlyph extends Sprite {
    meta: GlyphMeta;
    constructor(id,name,w,h, palette) {
        super(id,name,w,h, palette)
        this.meta = {
            codepoint:300,
            left:0,
            right:0,
            baseline:0
        }
    }
    override sync() {
        // console.log("syncing SpriteGlyph")
        let c = this._img.getContext('2d')
        this.forEachPixel((v,i,j)=>{
            if(v %2 === 0) {
                c.fillStyle = 'white'
                c.fillRect(i, j, 1, 1)
            }
            if(v%2 === 1) {
                c.fillStyle = 'black'
                c.fillRect(i, j, 1, 1)
            }
        })
    }
    toJsonObj():object {
        let obj = super.toJsonObj()
        // @ts-ignore
        obj.clazz = 'Glyph'
        // @ts-ignore
        obj.meta = this.meta
        // @ts-ignore
        // console.log("saving out",obj.meta)
        return obj
    }
}
export class SpriteFont {
    glyphs:SpriteGlyph[]
    id: string;
    name: string;
    // private _selected_glyph_index: number;
    constructor(id,name) {
        this.id = id || gen_id('unknown');
        this.name = name || 'unknown'
        this.glyphs = []
        // this._selected_glyph_index = 0
    }
    toJsonObj() {
        return {
            clazz:'Font',
            id:this.id,
            name:this.name,
            glyphs: this.glyphs.map(sp => sp.toJsonObj())
        }
    }

    add(spriteGlyph: SpriteGlyph) {
        this.glyphs.push(spriteGlyph)
    }

    // set_selected_glyph_index(val: number) {
    //     this._selected_glyph_index = val
    // }
    // selected_glyph_index():number {
    //     return this._selected_glyph_index
    // }
    // get_selected_glyph():SpriteGlyph {
    //     return this.glyphs[this._selected_glyph_index]
    // }
    // set_selected_glyph(target: SpriteGlyph) {
    //     this._selected_glyph_index = this.glyphs.indexOf(target)
    // }
}
