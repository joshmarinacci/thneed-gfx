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

const GRAYSCALE_PALETTE = [
    '#ff00ff',
    '#f0f0f0',
    '#d0d0d0',
    '#909090',
    '#404040',
];


function obj_to_class(sh, doc:AssetsDoc) {
    if(sh.clazz === 'Sprite') {
        console.log("making a sprite",sh.id,sh.name)
        let sprite = new Sprite(sh.id, sh.name, sh.w, sh.h, doc)
        sprite.data = sh.data
        sprite.sync()
        console.log("called sync")
        return sprite
    }
    if(sh.clazz === 'Tilemap') {
        let tilemap = new Tilemap(sh.id, sh.name, sh.w, sh.h)
        tilemap.data = sh.data
        return tilemap
    }
    if(sh.clazz === 'Sheet') {
        console.log("making a sheet",sh.id,sh.name)
        let sheet = new Sheet(sh.id,sh.name)
        sheet.sprites = sh.sprites.map(sp => obj_to_class(sp, doc))
        return sheet
    }
    if(sh.clazz === 'Font') {
        let font = new SpriteFont(sh.id,sh.name)
        font.glyphs = sh.glyphs.map(g => obj_to_class(g, doc))
        return font
    }
    if(sh.clazz === 'Glyph') {
        let glyph = new SpriteGlyph(sh.id,sh.name,sh.w,sh.h, doc)
        glyph.data = sh.data
        glyph.meta = sh.meta
        if(!glyph.meta.left) glyph.meta.left = 0
        if(!glyph.meta.right) glyph.meta.right = 0
        if(!glyph.meta.baseline) glyph.meta.baseline = 0
        glyph.sync()
        return glyph
    }
    throw new Error(`don't know how to deserialize ${sh.clazz}`)
}

export interface AssetsDoc extends Palette {
    find_sheet(name:String):Sheet
    find_sprite(sheet_name:String, sprite_name:String):Sprite
}

class AssetsDocImpl implements AssetsDoc {
    _color_palette: string[]
    sheets: Sheet[]
    fonts: SpriteFont[]
    maps:Tilemap[]

    constructor() {
        this.sheets = []
        this.fonts = []
        this.maps = []
    }
    get_color_palette(): string[] {
        return this._color_palette
    }

    find_sheet(name: String): Sheet {
        return this.sheets.find(sh => sh.name === name)
    }

    find_sprite(sheet_name: String, sprite_name: String): Sprite {
        let sheet = this.find_sheet(sheet_name)
        return sheet.sprites.find(sp => sp.name === sprite_name)
    }
}

export function load_assets_from_json(data:any):AssetsDoc {
    if(data.version === 1) {
        if(data.fonts && data.fonts.length > 0) {
            console.log("pretending to upgrade the document")
            data.version = 2
        } else {
            console.log("really upgrade")
            data.maps.forEach(mp => {
                console.log("converting",mp)
                mp.clazz = 'Tilemap'
                if(!mp.id) mp.id = gen_id("tilemap")
                if(!mp.name) mp.name = gen_id("unknown")
                return mp
            })
            data.version = 2
        }
    }
    if(data.version === 2) {
        data.color_palette = GRAYSCALE_PALETTE
        data.version = 3
    }
    if(data.version !== 3) throw new Error("we can only parse version 3 json")
    if(data.name) this._name = data.name
    let obj = new AssetsDocImpl()
    obj._color_palette = data.color_palette
    obj.sheets = data.sheets.map(sh => obj_to_class(sh,obj))
    obj.fonts = data.fonts.map(fnt => obj_to_class(fnt, obj))
    obj.maps = data.maps.map(mp => obj_to_class(mp, obj))
    return obj
}
