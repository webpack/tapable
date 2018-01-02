import * as path from "path"
import * as fs from "fs"

import { transpile } from './transpiler'

const TEMPLATE_PATH = path.resolve(__dirname, "./types.template.ts")
const OUTPUT_PATH = path.resolve(__dirname, "../types.build.d.ts")

const NUMBER_OF_LOOPS = 3

// Will print result information
const DEBUG: boolean = /^(1|true)$/.test(process.env["DEBUG"])

let result = fs.readFileSync(TEMPLATE_PATH, "utf8").replace(/\r/g, '')
result = transpile(result)

// Add header
result = `/** Generated from ${path.relative(path.dirname(OUTPUT_PATH), TEMPLATE_PATH)} */\n` + result

// for testing
console.log(result)
fs.writeFileSync(OUTPUT_PATH, result, "utf8")
