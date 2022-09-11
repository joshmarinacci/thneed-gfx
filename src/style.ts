export const StandardTextStyle  = '16px sans-serif'
export const StandardTextHeight = 20
export const StandardVerticalMargin = 10
export const StandardLeftPadding = 5

export const PanelBG = '#c4c2c2'
export const ControlBG = '#dcdcdc'
export const TextColor = '#4d4d4d'
export const SelectedColor = '#7bc50b'
export const SelectedTextColor = '#eceaea'


export const STD_STYLE = {
    PADDING:{
        LEFT:5
    },
    CONTROL: {
        BACKGROUND: {
            COLOR:'#dcdcdc'
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
            COLOR:'#b6b5b5'
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
export function calculate_style(name: string, selected: boolean, active?:boolean, enabled?:boolean):Style {
    if(name === 'scrollview') {
        return {
            background_color: '#f0f0f0',
            border_color: STD_STYLE.PANEL.BORDER.COLOR,
            text_color: STD_STYLE.PANEL.TEXT.COLOR
        }
    }
    if(name === 'scrollbar') {
        return {
            background_color: STD_STYLE.PANEL.BACKGROUND.COLOR,
            border_color: STD_STYLE.PANEL.BORDER.COLOR,
            text_color: STD_STYLE.PANEL.TEXT.COLOR
        }
    }
    if(name === 'scrollbar:thumb') {
        if(!enabled) {
            return {
                background_color: STD_STYLE.CONTROL.BACKGROUND.COLOR,
                border_color: STD_STYLE.CONTROL.BACKGROUND.COLOR,
                text_color: STD_STYLE.CONTROL.BACKGROUND.COLOR
            }
        }
        return {
            background_color: STD_STYLE.SELECTED.BACKGROUND.COLOR,
            border_color: STD_STYLE.PANEL.BORDER.COLOR,
            text_color: STD_STYLE.PANEL.TEXT.COLOR
        }
    }
    if(name === 'scrollbar:arrow') {
        if(!enabled) {
            return {
                background_color: STD_STYLE.CONTROL.BACKGROUND.COLOR,
                border_color: STD_STYLE.CONTROL.BACKGROUND.COLOR,
                text_color: STD_STYLE.CONTROL.BACKGROUND.COLOR
            }
        }
        return {
            background_color: active?STD_STYLE.SELECTED.BACKGROUND.COLOR:STD_STYLE.PANEL.BACKGROUND.COLOR,
            border_color: STD_STYLE.PANEL.BORDER.COLOR,
            text_color: STD_STYLE.PANEL.TEXT.COLOR
        }
    }
    if(selected) {
        return {
            background_color: STD_STYLE.SELECTED.BACKGROUND.COLOR,
            border_color: STD_STYLE.CONTROL.BORDER.COLOR,
            text_color: STD_STYLE.SELECTED.TEXT.COLOR,
        }
    }
    if(active) {
        return {
            background_color: STD_STYLE.ACTIVE.BACKGROUND.COLOR,
            border_color: STD_STYLE.CONTROL.BORDER.COLOR,
            text_color: STD_STYLE.SELECTED.TEXT.COLOR,
        }
    }
    return {
        background_color: STD_STYLE.CONTROL.BACKGROUND.COLOR,
        border_color: STD_STYLE.CONTROL.BORDER.COLOR,
        text_color: STD_STYLE.CONTROL.TEXT.COLOR
    }
}
