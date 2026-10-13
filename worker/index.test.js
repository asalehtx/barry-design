import { describe, it, expect } from 'vitest'
import worker, { parseRange, withRange } from './index.js'

const BYTES = Uint8Array.from({ length: 1000 }, (_, i) => i % 256)

// A stand-in for the static-assets binding: serves BYTES with the headers Cloudflare sends.
const assets = (status = 200) => ({
  fetch: async () =>
    new Response(status === 200 ? BYTES : null, {
      status,
      headers: { 'Content-Type': 'video/mp4', 'Content-Length': String(BYTES.length), ETag: '"abc"' },
    }),
})

const get = (range) =>
  new Request('https://example.com/video/hero-16x9.mp4', range ? { headers: { Range: range } } : {})

describe('parseRange', () => {
  it.each([
    ['bytes=0-99', [0, 99]],
    ['bytes=0-1', [0, 1]],
    ['bytes=900-', [900, 999]],
    ['bytes=-100', [900, 999]],
    ['bytes=950-5000', [950, 999]],
    ['bytes=-5000', [0, 999]],
  ])('%s of 1000 bytes is %j', (header, expected) => {
    expect(parseRange(header, 1000)).toEqual(expected)
  })

  it.each(['bytes=1000-', 'bytes=1000-1001', 'bytes=-0', 'bytes=50-10'])('%s cannot be satisfied', (header) => {
    expect(parseRange(header, 1000)).toBeNull()
  })

  it.each(['items=0-10', 'bytes=0-10,20-30', 'bytes=abc', 'bytes=-'])('ignores %s (serve the whole file)', (header) => {
    expect(parseRange(header, 1000)).toBeUndefined()
  })
})

describe('withRange', () => {
  it('answers a range with 206 and exactly the requested bytes', async () => {
    const res = await withRange(get('bytes=10-19'), await assets().fetch())
    expect(res.status).toBe(206)
    expect(res.headers.get('Content-Range')).toBe('bytes 10-19/1000')
    expect(res.headers.get('Content-Length')).toBe('10')
    expect(res.headers.get('Content-Type')).toBe('video/mp4')
    expect(res.headers.get('ETag')).toBe('"abc"')
    expect([...new Uint8Array(await res.arrayBuffer())]).toEqual([...BYTES.slice(10, 20)])
  })

  it("answers Safari's first probe (bytes=0-1) with two bytes", async () => {
    const res = await withRange(get('bytes=0-1'), await assets().fetch())
    expect(res.status).toBe(206)
    expect((await res.arrayBuffer()).byteLength).toBe(2)
  })

  it('answers an unsatisfiable range with 416 and the full size', async () => {
    const res = await withRange(get('bytes=5000-'), await assets().fetch())
    expect(res.status).toBe(416)
    expect(res.headers.get('Content-Range')).toBe('bytes */1000')
  })

  it('serves the whole file, advertising ranges, when no range is asked for', async () => {
    const res = await withRange(get(), await assets().fetch())
    expect(res.status).toBe(200)
    expect(res.headers.get('Accept-Ranges')).toBe('bytes')
    expect((await res.arrayBuffer()).byteLength).toBe(1000)
  })

  it('answers HEAD with the full headers, advertising ranges (its body is empty, so nothing to slice)', async () => {
    const head = new Request('https://example.com/video/hero-16x9.mp4', { method: 'HEAD', headers: { Range: 'bytes=0-1' } })
    const asset = new Response(null, { status: 200, headers: { 'Content-Length': '1000', 'Content-Type': 'video/mp4' } })
    const res = await withRange(head, asset)
    expect(res.status).toBe(200)
    expect(res.headers.get('Accept-Ranges')).toBe('bytes')
    expect(res.headers.get('Content-Length')).toBe('1000')
  })

  it('passes non-200 responses (404, 304) through untouched', async () => {
    for (const status of [404, 304]) {
      const res = await withRange(get('bytes=0-1'), await assets(status).fetch())
      expect(res.status).toBe(status)
    }
  })
})

describe('worker', () => {
  it('answers a missing video with 404, not the app page the SPA fallback returns', async () => {
    const spaFallback = {
      fetch: async () => new Response('<!doctype html>', { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } }),
    }
    const res = await worker.fetch(get('bytes=0-1'), { ASSETS: spaFallback })
    expect(res.status).toBe(404)
  })

  it('serves /video/* from the assets binding with range support', async () => {
    const res = await worker.fetch(get('bytes=0-99'), { ASSETS: assets() })
    expect(res.status).toBe(206)
    expect(res.headers.get('Content-Range')).toBe('bytes 0-99/1000')
  })
})
