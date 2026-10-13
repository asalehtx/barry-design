import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const read = (file) => readFileSync(join(process.cwd(), file), 'utf8')
// wrangler.jsonc allows // comments; strip whole-line ones before parsing.
const config = JSON.parse(read('wrangler.jsonc').replace(/^\s*\/\/.*$/gm, ''))

describe('Cloudflare deploy config', () => {
  it('serves the Vite build as static assets', () => {
    expect(config.assets.directory).toBe('./dist')
  })

  it('runs the range-serving Worker for the hero videos only, so iPhone Safari can play them', () => {
    expect(config.main).toBe('./worker/index.js')
    expect(config.assets.binding).toBe('ASSETS')
    expect(config.assets.run_worker_first).toEqual(['/video/*'])
  })

  it('keeps macOS .DS_Store files out of the upload', () => {
    expect(read('public/.assetsignore').split('\n')).toContain('.DS_Store')
  })

  it('answers every unknown path with index.html so deep links and ?category= links load the app', () => {
    expect(config.assets.not_found_handling).toBe('single-page-application')
  })

  it('builds before deploying', () => {
    expect(JSON.parse(read('package.json')).scripts.deploy).toBe('npm run build && wrangler deploy')
  })
})
