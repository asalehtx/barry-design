import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const read = (file) => readFileSync(join(process.cwd(), file), 'utf8')
// wrangler.jsonc allows // comments; strip whole-line ones before parsing.
const config = JSON.parse(read('wrangler.jsonc').replace(/^\s*\/\/.*$/gm, ''))

describe('Cloudflare deploy config', () => {
  it('serves the Vite build as static assets, with no Worker script', () => {
    expect(config.assets.directory).toBe('./dist')
    expect(config.main).toBeUndefined()
  })

  it('answers every unknown path with index.html so deep links and ?category= links load the app', () => {
    expect(config.assets.not_found_handling).toBe('single-page-application')
  })

  it('builds before deploying', () => {
    expect(JSON.parse(read('package.json')).scripts.deploy).toBe('npm run build && wrangler deploy')
  })
})
