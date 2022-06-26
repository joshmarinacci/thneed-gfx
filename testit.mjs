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

await fs.outputFile('src/generated.ts',logical+dom)
