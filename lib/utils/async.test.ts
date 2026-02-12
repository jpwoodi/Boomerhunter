import { describe, expect, it } from 'vitest'
import { mapWithConcurrency } from '@/lib/utils/async'

describe('mapWithConcurrency', () => {
  it('maps all items and preserves order', async () => {
    const values = [1, 2, 3, 4, 5]
    const result = await mapWithConcurrency(values, 2, async (value) => value * 2)

    expect(result).toEqual([2, 4, 6, 8, 10])
  })
})
