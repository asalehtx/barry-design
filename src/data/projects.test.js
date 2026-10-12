import { describe, it, expect } from 'vitest'
import {
  ALL_PROJECTS,
  CATEGORIES,
  PROJECTS,
  filterByCategory,
  findCategoryBySlug,
  findProject,
  formatNum,
  hasPhotos,
  nextProject,
  slugify,
  splitByPhotos,
} from './projects'

describe('project data', () => {
  it('has nine projects with unique ids', () => {
    expect(PROJECTS).toHaveLength(9)
    expect(new Set(PROJECTS.map((p) => p.id)).size).toBe(9)
  })

  it('never references the placeholder image', () => {
    const paths = PROJECTS.flatMap((p) => [p.img, ...p.gallery])
    expect(paths.some((src) => String(src).includes('photos-coming-soon'))).toBe(false)
  })

  it('keeps img and gallery consistent', () => {
    for (const p of PROJECTS) {
      if (p.gallery.length === 0) expect(p.img).toBeNull()
      else expect(p.gallery).toContain(p.img)
    }
  })

  it('defaults procurement to false on every project', () => {
    expect(PROJECTS.every((p) => p.procurement === false)).toBe(true)
  })

  it('only uses known categories', () => {
    for (const p of PROJECTS) expect(CATEGORIES).toContain(p.category)
  })
})

describe('helpers', () => {
  it('slugify makes url-safe slugs', () => {
    expect(slugify('Restaurants & Bars')).toBe('restaurants-bars')
    expect(slugify('Health & Wellness')).toBe('health-wellness')
  })

  it('formatNum pads to two digits', () => {
    expect(formatNum(0)).toBe('01')
    expect(formatNum(9)).toBe('10')
  })

  it('hasPhotos reflects the gallery', () => {
    expect(hasPhotos(findProject('haii-keii'))).toBe(true)
    expect(hasPhotos(findProject('doubletree-by-hilton'))).toBe(false)
  })

  it('splitByPhotos keeps order within each group', () => {
    const { photographed, inProgress } = splitByPhotos(PROJECTS)
    expect(photographed.map((p) => p.id)).toEqual([
      'xo-juice-and-studio',
      'omg-burger',
      'cyclone-anayas',
      'haii-keii',
      'bauhaus-houston',
    ])
    expect(inProgress.map((p) => p.id)).toEqual([
      'greek-orthodox-cathedral',
      'flying-saucer-draught',
      'doubletree-by-hilton',
      'airport-retail-spaces',
    ])
  })

  it('filterByCategory returns everything for All Projects', () => {
    expect(filterByCategory(PROJECTS, ALL_PROJECTS)).toBe(PROJECTS)
    expect(filterByCategory(PROJECTS, 'Nightlife').map((p) => p.id)).toEqual(['bauhaus-houston'])
  })

  it('findCategoryBySlug round-trips every category and rejects unknown slugs', () => {
    for (const c of CATEGORIES) expect(findCategoryBySlug(slugify(c))).toBe(c)
    expect(findCategoryBySlug('not-a-category')).toBeNull()
  })

  it('findProject returns null for unknown ids', () => {
    expect(findProject('nope')).toBeNull()
  })

  it('nextProject wraps from last to first', () => {
    expect(nextProject(PROJECTS, 'xo-juice-and-studio').id).toBe('omg-burger')
    expect(nextProject(PROJECTS, 'airport-retail-spaces').id).toBe('xo-juice-and-studio')
  })

  it('nextProject returns null for unknown ids and single-item lists', () => {
    expect(nextProject(PROJECTS, 'nope')).toBeNull()
    expect(nextProject([PROJECTS[0]], PROJECTS[0].id)).toBeNull()
  })
})
