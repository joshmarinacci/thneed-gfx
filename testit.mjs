#!/usr/bin/env zx
import 'zx/globals'
import fs from 'fs-extra'

console.log("doing stuff here")

const LETTERS = 'abcdefghijklmnopqrstuvwxyz'.split("")
const DIGITS = "0123456789".split("")
let COMMANDS = [
    'arrow_left','arrow_right','arrow_up','arrow_down',
    'shift_left','shift_right',
    'control_left','control_right',
    'alt_left','alt_right',
    'meta_left','meta_right',
    'backspace','delete',
    'enter','escape','tab',
]
const PUNC = {
    'period':'.',
    'comma':',',
    'semicolon':';',
    'quote':'\\\'',
    'backquote':'\\\`',
    'EXCLAMATION_POINT':'!',
    'bracket_left':'[',
    'bracket_right':']',
    'slash':'/',
    'backslash':'\\\\',
    'minus':'-',
    'equal':'=',
}

const up = s => s.toUpperCase()
function to_DomCase(p) {
    return p.split("_").map(s => {
        return s.substring(0,1).toUpperCase() + s.substring(1).toLowerCase()
    }).join("")
}
const LOG_TO_SDL = {
    'arrow_left':'Left',
    'arrow_right':'Right',
    'arrow_up':'Up',
    'arrow_down':'Down',
    'escape':'Escape',
    'shift_left':'LShift', 'shift_right':'RShift',
    'control_left':'LCtrl', 'control_right':'RCtrl',
    'alt_left':'LAlt', 'alt_right':'RAlt',
    'meta_left':'LGui', 'meta_right':'RGui',
    'enter':'Return',
}

function to_SDL(p) {
    console.log("generating to SDL",p)
    if(LOG_TO_SDL[p]) return LOG_TO_SDL[p]
    return to_DomCase(p)
}

const logical = `
export const LOGICAL_KEYBOARD_CODE = {
${LETTERS.map(l =>  `   KEY_${up(l)}:'KEY_${up(l)}',`).join("\n")}
${DIGITS.map(l =>   `   DIGIT_${up(l)}:'DIGIT_${up(l)}',`).join("\n")}
${COMMANDS.map(c => `   ${up(c)}:'${up(c)}',`).join("\n")}
${Object.keys(PUNC).map(p =>     `   ${up(p)}:'${up(p)}',`).join("\n")}
}
`


const dom = `
export const DOM_KEYBOARD_CODE_TO_LOGICAL_CODE = {
${LETTERS.map(l => `'Key${up(l)}':LOGICAL_KEYBOARD_CODE.KEY_${up(l)},`).join("\n")}
${DIGITS.map(l => `'Digit${up(l)}':LOGICAL_KEYBOARD_CODE.DIGIT_${up(l)},`).join("\n")}
${COMMANDS.map(c =>  `   '${to_DomCase(c)}':LOGICAL_KEYBOARD_CODE.${up(c)},`).join("\n")}
${Object.keys(PUNC).map(p =>      `   '${to_DomCase(p)}':LOGICAL_KEYBOARD_CODE.${up(p)},`).join("\n")}
}

export const DOM_KEYBOARD_KEY_TO_LOGICAL_KEY = {
${LETTERS.map(l => `'${l.toLowerCase()}':'${l.toLowerCase()}',`).join("\n")}
${DIGITS.map(d => `'${d}':'${d}',`).join("\n")}
${Object.entries(PUNC).map(([n,k]) => `'${k}':'${k}',`).join("\n")}
}
`

// console.log("Dom");
// console.log(dom)

//generate for dom to thneed
await fs.outputFile('src/generated.ts',logical+dom)

const idealos_out = `
import {LOGICAL_KEYBOARD_CODE} from "thneed-gfx";
//cool rad stuff here
export const IDEALOS_KEYBOARD_CODE = {
${LETTERS.map(l => `    'LETTER_${up(l)}':LOGICAL_KEYBOARD_CODE.KEY_${up(l)},`).join("\n")}   
${COMMANDS.map(l => `    '${up(l)}':LOGICAL_KEYBOARD_CODE.${up(l)},`).join("\n")}   
}
export const IDEALOS_KEYBOARD_KEY = {
${LETTERS.map(l => `    'KEY_${up(l)}':'${l.toLowerCase()}',`).join("\n")}   

}
`
//generate for idealos to thneed
await fs.outputFile('../clogwench/apps/common/src/generated.ts',idealos_out)

//generate idealos keyboard enum
const idealos_rust_out = `
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug, Clone)]
pub enum KeyCode {
    RESERVED,
    UNKNOWN,
    SPACE,

${LETTERS.map(l  => `    LETTER_${up(l)},`).join("\n")}   
${DIGITS.map(l   => `    DIGIT_${up(l)},`).join("\n")}   
${COMMANDS.map(l => `    ${up(l)},`).join("\n")}   

    MOUSE_PRIMARY,
}
`
await fs.outputFile('../clogwench/common/src/generated.rs',idealos_rust_out)


const sdl_to_idealos_rust_out = `
use sdl2::keyboard::Keycode;
use common::generated::KeyCode;

//hi. cool!
pub fn sdl_to_common(kc: Keycode) -> KeyCode {
    println!("converting SDL {}",kc);
    let code = match kc {
${LETTERS.map(l =>  `        Keycode::${up(l)} => KeyCode::LETTER_${up(l)},`).join("\n")}   
${DIGITS.map(l =>   `        Keycode::Num${up(l)} => KeyCode::DIGIT_${up(l)},`).join("\n")}   
${COMMANDS.map(l => `        Keycode::${to_SDL(l)} => KeyCode::${up(l)},`).join("\n")}   
        _ => {
            KeyCode::UNKNOWN
        }
    };
    println!("to code {:?}",code);
    return code
}
`
await fs.outputFile('../clogwench/plat/native-macos/src/sdl_to_common.rs',sdl_to_idealos_rust_out)
