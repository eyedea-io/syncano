import * as S from '@eyedea/syncano'

interface Args {
  firstname?: string
  lastname?: string
}

class Endpoint extends S.Endpoint<Args> {
  async run({response}: S.Core, {args}: S.Context<Args>) {
    if (args.firstname && args.lastname) {
      return {
        message: `Hello ${args.firstname} ${args.lastname}!`
      }
    }

    response.json(
      {
        message: 'You have to send "firstname" and "lastname" arguments!'
      },
      400
    )
  }

  endpointDidCatch({message}: Error) {
    this.syncano.response.json({message}, 400)
  }
}

export default (ctx: S.Context<Args>) => new Endpoint(ctx)
