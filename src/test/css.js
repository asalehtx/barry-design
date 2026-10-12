import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

// Vitest runs from the project root.
const STYLES_DIR = join(process.cwd(), 'src', 'styles')

// Every stylesheet under src/styles, keyed by file name.
export function readStyles() {
  return Object.fromEntries(
    readdirSync(STYLES_DIR)
      .filter((f) => f.endsWith('.css'))
      .map((f) => [f, readFileSync(join(STYLES_DIR, f), 'utf8')]),
  )
}

// Minimal CSS walker: returns every style rule as
// { selector, body, atRule } where atRule is the enclosing @media/@supports prelude or null.
// Good enough for this project's hand-written CSS (no nesting, no braces inside strings).
export function parseRules(css) {
  const text = css.replace(/\/\*[\s\S]*?\*\//g, '')
  const rules = []
  const stack = []
  let start = 0
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (ch === '{') {
      const prelude = text.slice(start, i).trim()
      stack.push({ prelude, bodyStart: i + 1 })
      start = i + 1
    } else if (ch === '}') {
      const open = stack.pop()
      if (!open) continue
      const parent = stack[stack.length - 1]
      if (!open.prelude.startsWith('@')) {
        rules.push({
          selector: open.prelude,
          body: text.slice(open.bodyStart, i).trim(),
          atRule: parent && parent.prelude.startsWith('@') ? parent.prelude : null,
        })
      }
      start = i + 1
    } else if (ch === ';' && stack.length === 0) {
      start = i + 1
    }
  }
  return rules
}

export function declarations(body) {
  return body
    .split(';')
    .map((d) => d.trim())
    .filter(Boolean)
    .map((d) => {
      const idx = d.indexOf(':')
      return { prop: d.slice(0, idx).trim(), value: d.slice(idx + 1).trim() }
    })
}

const ROOT_PX = 15

// Smallest size a font-size value can render at, in px. clamp() resolves to its minimum.
export function minFontPx(value) {
  const v = value.replace(/!important/, '').trim()
  const clamp = v.match(/^clamp\(\s*([^,]+),/)
  const first = clamp ? clamp[1].trim() : v
  const m = first.match(/^([\d.]+)(rem|px)$/)
  if (!m) return null
  return m[2] === 'rem' ? parseFloat(m[1]) * ROOT_PX : parseFloat(m[1])
}

const luminance = (hex) => {
  const c = [1, 3, 5]
    .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]
}

export function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

// Custom properties declared in the top-level :root rule.
export function rootTokens(css) {
  const root = parseRules(css).find((r) => r.selector === ':root' && r.atRule === null)
  if (!root) return {}
  return Object.fromEntries(
    declarations(root.body)
      .filter((d) => d.prop.startsWith('--'))
      .map((d) => [d.prop, d.value]),
  )
}
