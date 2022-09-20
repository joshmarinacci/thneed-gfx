export const StandardTextStyle  = '16px sans-serif'
export const StandardTextHeight = 20
export const StandardVerticalMargin = 10
export const StandardLeftPadding = 5

export const PanelBG = '#c4c2c2'
export const ControlBG = '#dcdcdc'
export const TextColor = '#4d4d4d'
export const SelectedColor = '#7bc50b'
export const SelectedTextColor = '#eceaea'


const background_light = '#ffffff'
const background_regular = '#dcdcdc'
const background_dark = '#bebebe'

const border_dark = '#595858'
const border_regular = '#8c8a8a'
const border_light = '#c5c4c4'
const text_regular = '#4d4d4d'

const background_selected = '#4acb9e'
const border_selected = '#595858'
const text_selected = '#4d4d4d'

const background_active = '#57f1bf'


export const STD_STYLE = {
    PADDING:{
        LEFT:5
    },
    CONTROL: {
        BACKGROUND: {
            COLOR:background_regular
        },
        BORDER: {
            COLOR: "#4d4d4d",
        },
        TEXT: {
            COLOR:'#4d4d4d'
        }
    },
    PANEL: {
        BACKGROUND: {
            COLOR:background_light
        },
        BORDER: {
            COLOR: "#4d4d4d",
        },
        TEXT: {
            COLOR:'#4d4d4d'
        }
    },
    ACTIVE: {
        BACKGROUND: {
            COLOR:'#acfc44'
        },
        TEXT: {
            COLOR:'#eceaea'
        }
    },
    SELECTED: {
        BACKGROUND: {
            COLOR:'#7bc50b'
        },
        TEXT: {
            COLOR:'#eceaea'
        }
    },
}
class Insets {
    left:number
    right:number
    top:number
    bottom:number
    constructor(top,right,bottom,left) {
        this.left = left
        this.top = top
        this.right = right
        this.bottom = bottom
    }
}
export type Style = {
    background_color:string,
    border_color:string,
    text_color:string,
    padding:Insets,
}
function extend_with(base: Style, extra:object):Style {
    let new_object = Object.create(base_button_style)
    Object.keys(extra).forEach(key => {
        new_object[key] = extra[key]
    })
    return new_object
}


export const name_styles = new Map<string,Style>()
export const selected_styles = new Map<string,Style>()
export const active_styles = new Map<string,Style>()
export const hover_styles = new Map<string,Style>()

const panel_style:Style = {
    background_color:background_regular,
    border_color: border_regular,
    text_color:text_regular,
    padding: {
        left:0,
        right:0,
        top:0,
        bottom:0,
    }
}

name_styles.set('scrollview', panel_style)
name_styles.set('scrollbar', panel_style)

// ========= labels ==========
name_styles.set('label',{
    background_color:background_light,
    border_color:'#ff0000',
    text_color:text_regular,
    padding: new Insets(5,5,5,5)
})

// =========== text ==========
name_styles.set('text-line',{
    background_color:background_light,
    border_color:border_light,
    text_color:text_regular,
    padding: new Insets(5,5,5,5)
})

// ========= buttons =========
const base_button_style = {
    background_color:background_regular,
    border_color: border_regular,
    text_color:text_regular,
    padding: {
        left:10,
        right:10,
        top:10,
        bottom:15,
    },
}
name_styles.set('base-button', base_button_style)
selected_styles.set('base-button',extend_with(base_button_style,{
    background_color:background_selected,
    text_color:'white',
}))
active_styles.set('base-button',extend_with(base_button_style,{
    background_color:background_selected,
    text_color:'white',
}))
name_styles.set('action-button', base_button_style)
active_styles.set('action-button',extend_with(base_button_style,{
    background_color:background_selected,
    text_color:'white',
}))
hover_styles.set('action-button',extend_with(base_button_style,{
    background_color:'#ff0000'
}))


// ============= containers
name_styles.set('header', {
    background_color: background_light,
    border_color: border_light,
    text_color: text_regular,
    padding: {
        left:0,
        right:0,
        top:20,
        bottom:20,
    }
})
name_styles.set('dialog-container', panel_style)
name_styles.set('popup-container', panel_style)
name_styles.set('select-list', panel_style)
selected_styles.set('select-list', extend_with(panel_style,{
    background_color:background_selected,
    text_color:'white',
}))
name_styles.set('scrollbar:thumb', extend_with(panel_style,{
    background_color:background_selected,
}))
name_styles.set('scrollbar:arrow',panel_style)


name_styles.set('window-resize-handle', extend_with(panel_style,{
    background_color:background_light,
}))
active_styles.set('window-resize-handle', extend_with(panel_style,{
    background_color:background_selected,
}))

export function calculate_style(name: string, selected: boolean, active?:boolean, enabled?:boolean,hover?:boolean):Style {
    if(hover) {
        if(hover_styles.has(name)) return hover_styles.get(name)
        console.warn("no hover style for",name)
    }
    if(active) {
        console.log("doing active for",name)
        if(active_styles.has(name)) return active_styles.get(name)
        console.warn("no active style for",name)
    }
    if(selected) {
        if(selected_styles.has(name)) return selected_styles.get(name)
        console.warn("no selected style for",name)
    }

    if(name_styles.has(name)) return name_styles.get(name)
    console.warn("missing style for",name)
    return {
        background_color: STD_STYLE.CONTROL.BACKGROUND.COLOR,
        border_color: STD_STYLE.CONTROL.BORDER.COLOR,
        text_color: STD_STYLE.CONTROL.TEXT.COLOR,
        padding: new Insets(0,0,0,0)
    }
}
