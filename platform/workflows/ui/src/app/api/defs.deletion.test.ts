import { expect, it, vi } from 'vitest'
import { api } from '@wippy-fe/proxy'
import { deleteWorkflow } from './defs'

vi.mock('@wippy-fe/proxy', () => ({api: {delete: vi.fn()}}))

it.each([undefined, 'accepted-job'])('returns an accepted response with optional job handle %s', async job_id => {
  vi.mocked(api.delete).mockResolvedValue({data: {success: true, job_id}} as never)
  await expect(deleteWorkflow('selected')).resolves.toEqual({job_id})
})
