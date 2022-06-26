#!/usr/bin/env zx
import 'zx/globals'
import fs from 'fs-extra'

console.log("doing stuff here")

let KEYS = [
    'A',
    'B',
    'C'
]


let outp = KEYS.map((m)=> `KEY_${m}`).join("\n")

await $`pwd`
await fs.outputFile('somefile.txt',outp)