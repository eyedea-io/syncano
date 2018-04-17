// tslint:disable-next-line:no-var-requires
const Syncano = require('@syncano/core')
import {SyncanoContext, User} from '../typings/syncano-context'
import {Logger} from '../typings/syncano-core'

export class Endpoint {
  public ctx: SyncanoContext
  public user?: User
  public logger: Logger
  public syncano: any

  constructor(ctx: SyncanoContext) {
    this.ctx = ctx
    this.user = ctx.meta.user
    this.syncano = new Syncano(ctx)
    this.logger = this.syncano.logger(this.ctx.meta.executor)
    this.execute()
  }

  public run?(): any

  public endpointDidCatch(err: Error) {
    console.log(err)
  }

  private async execute() {
    try {
      if (typeof this.run === 'function') {
        await this.run()
      } else {
        throw new Error(
          'No `render` method found on the returned endpoint instance: you may have forgotten to define `render`.'
        )
      }
    } catch (err) {
      this.endpointDidCatch(err)
    }
  }
}
