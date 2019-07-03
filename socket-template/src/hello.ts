import * as S from '@eyedea/syncano'

interface Args {
  id: string
}

class Endpoint extends S.Endpoint<Args> {
  async run({}: S.Core, {}: S.Context<Args>) {
    if (!this.user) {
      throw new S.HttpError('Unauthorized!', 401)
    }

    return {
      message: 'Hello World'
    }
  }

  endpointDidCatch({message}: Error) {
    this.syncano.response.json({message}, 400)
  }
}

export default (ctx: S.Context<Args>) => new Endpoint(ctx)
