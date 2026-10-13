import { describe, it, expect } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { REEL, REEL_FRAMES, REEL_SECONDS, segmentIndexAt } from './heroReel'
import { findProject } from './projects'

describe('hero reel timeline', () => {
  it('is three 5-second segments at 30 fps', () => {
    expect(REEL.fps).toBe(30)
    expect(REEL.segmentFrames).toBe(150)
    expect(REEL_FRAMES).toBe(450)
    expect(REEL_SECONDS).toBe(15)
  })

  it('runs XO, then OMG Burger, then Haii Keii', () => {
    expect(REEL.segments.map((s) => s.projectId)).toEqual(['xo-juice-and-studio', 'omg-burger', 'haii-keii'])
  })

  it('points at real projects and images', () => {
    for (const s of REEL.segments) {
      expect(findProject(s.projectId)).not.toBeNull()
      expect(existsSync(join(process.cwd(), 'public', s.image))).toBe(true)
    }
  })

  it('caps the OMG Burger push-in at 1.04 and the others at 1.06', () => {
    expect(REEL.segments.map((s) => s.maxScale)).toEqual([1.06, 1.04, 1.06])
  })
})

describe('segmentIndexAt', () => {
  it.each([
    [0, 0],
    [4.99, 0],
    [5, 1],
    [9.99, 1],
    [10, 2],
    [14.99, 2],
  ])('at %ss shows segment %i', (seconds, index) => {
    expect(segmentIndexAt(seconds)).toBe(index)
  })

  it('wraps at the loop point', () => {
    expect(segmentIndexAt(15)).toBe(0)
    expect(segmentIndexAt(20.5)).toBe(1)
  })

  it('treats negative times as wrapped', () => {
    expect(segmentIndexAt(-0.5)).toBe(2)
  })
})

describe('curated traces', () => {
  it.each(REEL.segments.flatMap((s) => Object.keys(REEL.formats).map((f) => [s.projectId, f])))(
    '%s %s exists, matches the composition size and has 30-70 lines',
    (projectId, format) => {
      const path = join(process.cwd(), 'reel', 'traces', `${projectId}-${format}.json`)
      expect(existsSync(path)).toBe(true)
      const trace = JSON.parse(readFileSync(path, 'utf8'))
      expect([trace.width, trace.height]).toEqual([REEL.formats[format].width, REEL.formats[format].height])
      expect(trace.lines.length).toBeGreaterThanOrEqual(30)
      expect(trace.lines.length).toBeLessThanOrEqual(70)
      for (const [x1, y1, x2, y2] of trace.lines) {
        for (const [v, max] of [[x1, trace.width], [y1, trace.height], [x2, trace.width], [y2, trace.height]]) {
          expect(v).toBeGreaterThanOrEqual(0)
          expect(v).toBeLessThanOrEqual(max)
        }
      }
    },
  )
})
