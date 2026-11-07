// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import { expect, it } from 'vitest'
import { latestRequest } from './latestRequest'

it('keeps only the most recently started read current', () => {
  const begin = latestRequest()
  const first = begin()
  expect(first()).toBe(true)
  const second = begin()
  expect(first()).toBe(false)
  expect(second()).toBe(true)
})

it('orders reads per resource', () => {
  const left = latestRequest()
  const right = latestRequest()
  const read = left()
  right()
  expect(read()).toBe(true)
})
