// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0

// Orders overlapping reads of one resource. Each read calls the returned function
// when it starts and receives a check that stays true only while no later read has
// started; the read applies its result, its error and its loading state only then.
export function latestRequest(): () => () => boolean {
  let generation = 0
  return () => {
    const started = ++generation
    return () => started === generation
  }
}
