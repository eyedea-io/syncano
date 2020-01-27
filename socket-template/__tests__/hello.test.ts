import {run} from '@eyedea/syncano-test'

/**
 * @see https://github.com/eyedea-io/syncano-test
 */

describe('resource/create', () => {
  it('should fail without firstname', async () => {
    const meta = {user: undefined}
    const args = {}
    const result = await run('hello', {args, meta})

    expect(result).toHaveProperty('code', 400)
  })
  it('should pass with firstname and lastname', async () => {
    const meta = {user: undefined}
    const args = {firstname: 'John', lastname: 'Doe'}
    const result = await run('hello', {args, meta})

    expect(result).toHaveProperty('data.message', 'Hello John Doe')
    expect(result).toHaveProperty('code', 200)
  })
})
