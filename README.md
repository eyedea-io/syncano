# syncano
Custom wrapper for @syncano/core library.


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
