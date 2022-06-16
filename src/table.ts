import {BaseParentView, BaseView, gen_id, Point, Rect, Size, View} from "./core";
import {CanvasSurface, SurfaceContext} from "./canvas";
import {ScrollView} from "./containers";

class TableHeaderView extends BaseView {
    private table: TableView;

    constructor(table: TableView) {
        super(gen_id('table-header-view'));
        this.table = table
        this._name = 'table-header-view'
    }

    draw(g: SurfaceContext): void {
        g.fillBackgroundSize(this.size(), '#f0f0f0')
        // this.log("drawing",this.size())
        let x = 0
        let y = 20
        this.table.columns_keys.forEach((key, k) => {
            let tx = x + 0
            g.fill(new Rect(tx,0, 1, 20),'black')
            g.fillStandardText(key, tx + 5, y, 'base')
            x += this.table.columns_widths[k]
        })
    }

    layout(g: CanvasSurface, available: Size): Size {
        this.set_size(new Size(available.w, 20))
        return this.size()
    }
}

class TableGridView extends BaseView {
    private table: TableView;

    constructor(table: TableView) {
        super(gen_id('table-grid-view'));
        this._name = 'table-grid-view'
        this.table = table
    }

    draw(g: SurfaceContext): void {
        let h = 20
        let gw = this.size().w
        for (let i = 0; i < this.table.data.length; i++) {
            let row = this.table.data[i]
            let y = i * h
            let x = 0
            this.table.columns_keys.forEach((key, k) => {
                let col_width = this.table.columns_widths[k]
                let tx = x
                g.fill(new Rect(tx,y,1,20),'#000000')
                g.fill(new Rect(tx, y, gw, 1), '#000000')
                let txt = row[key]
                let m = g.measureText(txt, 'base')
                if (m.w > col_width) {
                    g.fill(new Rect(tx, y, col_width, 20), '#ff0000')
                }
                g.fillStandardText(txt, tx + 5, y + 20, 'base')
                x += col_width
            })
        }
    }

    layout(g: CanvasSurface, available: Size): Size {
        this.set_size(new Size(available.w, this.table.data.length * 20))
        return this.size()
    }

}

export class TableView extends BaseParentView {
    data: any[];
    private header: View;
    private scroll: ScrollView;
    private grid: TableGridView;
    columns_keys: string[];
    columns_widths: number[];


    constructor(songs: any[], columns_keys: string[], columns_widths: number[]) {
        super(gen_id('table-view'))
        this.data = songs
        this.columns_keys = columns_keys
        this.columns_widths = columns_widths
        this.header = new TableHeaderView(this)
        this.add(this.header)
        this.scroll = new ScrollView()
        this.scroll.set_hflex(true)
        this.scroll.set_vflex(true)
        this.add(this.scroll)
        this.grid = new TableGridView(this)
        this.scroll.set_content(this.grid)
        this.set_hflex(true)
        this.set_vflex(true)
    }

    override draw(g: CanvasSurface) {
        super.draw(g);
    }

    layout(g: CanvasSurface, available: Size): Size {
        // this.log('layout. avail',available)
        if (this.hflex && this.vflex) {
            this.set_size(available)
        } else {
            this.set_size(new Size(200, 200))
        }
        // layout header
        this.header.layout(g, this.size())
        let s2 = new Size(this.size().w, this.size().h - 20)
        this.scroll.layout(g, s2)
        this.scroll.set_position(new Point(0, 20))
        // layout scroll view
        // layout the grid?
        return this.size()
    }
}