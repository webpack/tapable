
const NUMBER_OF_LOOPS = 5
const REMOVE_MULTI_LINE_COMMENTS = true
const GENERIC_LETTERS = "ABCDEFGHIJKLMNOPQRSUVWXYZ".split('')

// Create new array of length
const arr = (len, fillValue = null) => (new Array(len).fill(fillValue))

const OPS: {[type: string]: (content: string, params?: any) => string} = {
    // Example:
    // src: `new <T = any, A = any>(args?: [string]): HookAsync1<T, A>`
    // return `new <T = any>(): HookAsync0<T>` + '\n'
    //      + `new <T = any, A = any>(args?: [string]): HookAsync1<T, A>` + '\n'
    //      + `new <T = any, A = any, B = any>(args?: [string, string]): HookAsync2<T, A, B>` + '\n'
    //      + `new <T = any, A = any, B = any, C = any>(args?: [string, string, string]): HookAsync3<T, A, B, C>` + '\n'
    "loopHookConstructor": (src, n = NUMBER_OF_LOOPS) => {
        return arr(n)
        .map((_, idx) => {
            const letters = GENERIC_LETTERS.slice(0, idx)
            return src
                // this produces left over commas
                .replace(
                    /A(| *= *\w+)\>/g,
                    `${letters.reduce((prev, curr) => prev + curr + '$1, ', '')}>`
                )
                // Replace numerals
                .replace(/1/g, `${idx}`)
                // replace typed constructor arguments
                .replace(/\: *\[string\]/g, `: [${arr(idx, 'string').join(', ')}]`)
                // clean up left-over commas followed by terminator 
                .replace(/, *([\>\)\]])/g, '$1')
                // remove zero arg constructor
                .replace(/args: \[\]/, '')
        })
        .join('')
    },
    "loopTapGenerics": (src, n = NUMBER_OF_LOOPS) => {
        return arr(n)
        .map((_, idx) => {
            const letters = GENERIC_LETTERS.slice(0, idx)
            return src
                // this produces left over commas
                .replace(
                    /A(| *= *\w+)\>/g,
                    `${letters.reduce((prev, curr) => prev + curr + '$1, ', '')}>`
                )
                // Replace numerals
                .replace(/1/g, `${idx}`)
                // named arguments
                .replace(
                    /\ba: A(| *= *\w+)(, *)?/g,
                    letters.reduce((prev, curr) => prev + curr.toLowerCase() + ': ' + curr + '$1, ', '')
                )
                // clean up left-over commas followed by terminator 
                .replace(/, *([\>\)\]])/g, '$1')
                // clean up left over generic brackets
                .replace(/\<\s*\>/g, '')
        })
        .join("\n")
    },
    "loopLetter": (src, n = NUMBER_OF_LOOPS) => {
        // n - 1 to account for no generics letter
        return arr(n - 1)
        .map((_, idx) => {
            const letter = GENERIC_LETTERS[idx]
            return src.replace(/\bA\b/g, letter)
        })
        .join("")
    },
    "replace": (src, from: string | RegExp, to: string = "") => src.replace(from, to),
    "removeAll": (src) => ""
}

// ex: "    // >>> macroName 1, 2"
// groups: macro name (ex: "macroName"), parameters (ex: "1, 2")
const MACRO_OPENING_RE = /(?:\n[ \t]+)?\/\/ *\>\>\> *(\w+)([^\n]+)?/.source
// groups: source code
const MACRO_CONTENT_RE = /(\n[\S\s]+?)/.source
// ex: "    // <<< macroName"
// note back-reference \1 for nestable macros
const MACRO_CLOSING_RE = /\n[\t ]*\/\/ *\<\<\< +\1/.source

// groups: macro name, parameters, source code
const MACRO_RE = new RegExp(MACRO_OPENING_RE + MACRO_CONTENT_RE + MACRO_CLOSING_RE, 'g')

export function transpile(content: string) {
    return content.replace(
        MACRO_RE,
        (match, type, parameters, content) => {
            let opArgs = [content]
            if (parameters) {
                try {
                    // Put parameters in array brackets and evaluate
                    opArgs = opArgs.concat(eval(`[${parameters}]`))
                } catch (error) {
                    throw new Error(`parameters '${parameters}' not valid javascript`)
                }
            }
            if (!OPS[type]) {
                throw new Error(`Operation type '${type}' does not have definition!\nMatched:\n${match}`)
            }
            // Recursive for nested macros
            return transpile(OPS[type].apply(OPS, opArgs))
        }
    )
}

