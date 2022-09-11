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

const background_selected = '#57f1bf'
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
export type Style = {
    background_color:string,
    border_color:string,
    text_color:string,
}

export const name_styles = new Map<string,Style>()
export const selected_styles = new Map<string,Style>()
export const active_styles = new Map<string,Style>()

name_styles.set('scrollview', {
    background_color:background_light,
    border_color: border_regular,
    text_color:text_regular,
})
name_styles.set('scrollbar', {
    background_color:background_light,
    border_color: border_light,
    text_color:text_regular,
})
name_styles.set('header', {
    background_color:background_light,
    border_color: border_dark,
    text_color:text_regular,
})
name_styles.set('dialog-container', {
    background_color:background_regular,
    border_color: border_regular,
    text_color:text_regular,
})


name_styles.set('base-button', {
    background_color:background_regular,
    border_color: border_regular,
    text_color:text_regular,
})
selected_styles.set('base-button', {
    background_color:background_selected,
    border_color: border_selected,
    text_color:text_selected,
})


name_styles.set('action-button', {
    background_color:background_regular,
    border_color: border_regular,
    text_color:text_regular,
})
active_styles.set('action-button',{
    background_color:background_selected,
    border_color: border_regular,
    text_color:text_regular,
})

name_styles.set('select-list', {
    background_color:background_regular,
    border_color: border_regular,
    text_color:text_regular,
})
selected_styles.set('select-list', {
    background_color:background_selected,
    border_color: border_regular,
    text_color:text_regular,
})


name_styles.set('scrollbar:thumb', {
    background_color:background_selected,
    border_color: border_regular,
    text_color:text_regular,
})
name_styles.set('scrollbar:arrow', {
    background_color:background_light,
    border_color: border_regular,
    text_color:text_regular,
})

export function calculate_style(name: string, selected: boolean, active?:boolean, enabled?:boolean):Style {
    if(active) {
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
        text_color: STD_STYLE.CONTROL.TEXT.COLOR
    }
}
