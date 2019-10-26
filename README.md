# @eyedea/syncano

Custom wrapper for @syncano/core library.

[![npm version](https://img.shields.io/npm/v/unswitch.svg)](https://www.npmjs.com/package/unswitch)
[![license](https://img.shields.io/github/license/eyedea-io/syncano.svg)](https://github.com/eyedea-io/syncano/blob/master/LICENSE)

## Install

```
$ npm install --save @eyedea/syncano
```

## Usage

```ts
import * as S from '@eyedea/syncano'

// Define arguments that endpoint will receive
interface Args {
  id: string
}

class Endpoint extends S.Endpoint<Args> {
  async run(
    {data, response /* users, endpoint etc. */}: S.Core, // Access to syncano
    {args, meta, config}: S.Context<Args> // Access to args, meta and config
  ) {
    if (!this.user) {
      // Errors thrown using S.HttpError are returned as response. In this case:
      // {message: 'Unauthorized!'} with status code 401
      throw new S.HttpError('Unauthorized!', 401)
    }

    // You can directly return syncano query ...
    return data.post.find(10)

    // ... or use response method
    response.json({posts}, 200)
  }

  // Any error thrown in `run` method can be handled using `endpointDidCatch` method
  endpointDidCatch({message}: Error) {
    this.syncano.response.json({message}, 400)
  }
}

export default ctx => new Endpoint(ctx)
```

## Tests

```tsx
/* syncano/resource/__tests__/get.test.js */
import {run, stub, createSyncanoCoreMock} from '@eyedea/syncano'

describe('resource/create', () => {
  it('should not fail', async () => {
    const meta = {
      user: undefined
    }
    const args = {
      id: 1
    }
    const mocks = createSyncanoCoreMock({
      endpoint: {
        get: stub().resolves({
          inOrganization: true
        })
      },
      data: {
        resource: {
          find: stub().resolves({
            id: args.id,
            organization: 20
          }),
          findOrFail: stub().resolves(args)
        }
      }
    })

    const result = await run('get', {args, meta}, {mocks})
    expect(result).toHaveProperty('code', 401)
  })
})
```

## License

MIT © <a href="https://eyedea.io">Eyedea AS</a>
