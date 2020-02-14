# @eyedea/syncano

Custom wrapper for @syncano/core library.

[![npm version](https://img.shields.io/npm/v/@eyedea/syncano)](https://npmjs.com/package/@eyedea/syncano)
[![license](https://img.shields.io/npm/l/@eyedea/syncano)](https://github.com/eyedea-io/syncano/blob/master/LICENSE)

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

export default async (ctx: S.Context) => S.init(MyEndpoint, ctx)
```

## Tests

View [@eyedea/syncano-test](https://github.com/eyedea-io/syncano-test)

## License

MIT © <a href="https://eyedea.io">Eyedea AS</a>
