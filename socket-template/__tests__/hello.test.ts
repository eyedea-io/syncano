import {run} from '@eyedea/syncano-test'

/**
 * @see https://github.com/eyedea-io/syncano-test
 */

describe('resource/create', () => {
  it('should fail without firstname', async () => {
    const meta = {user: undefined}
    const args = {id: 1}
    const result = await run('profile', {args, meta})

    expect(result).toHaveProperty('code', 400)
  })
})
