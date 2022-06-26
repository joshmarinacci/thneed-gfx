#!/usr/bin/env zx
import 'zx/globals'
import fs from 'fs-extra'

console.log("doing stuff here")

let LETTERS = ['A', 'B', 'C', 'D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z']
const DIGITS = ['0','1','2','3','4','5','6','7','8','9']
let COMMANDS = ['BACKSPACE','ARROW_LEFT','ARROW_RIGHT','ENTER',]
const PUNC = {
    'PERIOD':'.',
    'COMMA':',',
    'SEMICOLON':';',
    'QUOTE':'\\\'',
    'EXCLAMATION_POINT':'!',
    'bracket_left':'[',
    'bracket_right':']',
}

const to_up = s => s.toUpperCase()
const logical = `
export const LOGICAL_KEYBOARD_CODE = {
${LETTERS.map(l => `   KEY_${l}:'KEY_${l}',`).join("\n")}
${DIGITS.map(l => `   DIGIT_${l}:'DIGIT_${l}',`).join("\n")}
${COMMANDS.map(c => `   ${c}:'${c}',`).join("\n")}
${Object.keys(PUNC).map(p =>     `   ${to_up(p)}:'${to_up(p)}',`).join("\n")}
}
`

function to_DomCase(p) {
    return p.split("_").map(s => {
        return s.substring(0,1).toUpperCase() + s.substring(1).toLowerCase()
    }).join("")
}

const dom = `
export const DOM_KEYBOARD_CODE_TO_LOGICAL_CODE = {
${LETTERS.map(l => `'Key${l}':LOGICAL_KEYBOARD_CODE.KEY_${l},`).join("\n")}
${DIGITS.map(l => `'Digit${l}':LOGICAL_KEYBOARD_CODE.DIGIT_${l},`).join("\n")}
${COMMANDS.map(p =>  `   '${to_DomCase(p)}':LOGICAL_KEYBOARD_CODE.${p},`).join("\n")}
${Object.keys(PUNC).map(p =>      `   '${to_DomCase(p)}':LOGICAL_KEYBOARD_CODE.${to_up(p)},`).join("\n")}
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
