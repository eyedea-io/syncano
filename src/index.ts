const Syncano = require('@syncano/core')
import {SyncanoContext} from '../typings/syncano-context'
import {Logger} from '../typings/syncano-core'

export class Endpoint {
  ctx: SyncanoContext
  syncano: any
  logger: Logger

  constructor(ctx: SyncanoContext) {
    this.ctx = ctx
    this.syncano = new Syncano(ctx)
    this.logger = this.syncano.logger(this.ctx.meta.executor)
    this.execute()
  }

  private async execute() {
    try {
      const res = await this.run()

      if (res !== undefined) {
        this.syncano.response(res)
      }
    } catch (err) {
      this.endpointDidCatch(err)
    }
  }

  private async run() {
    throw new Error("No `render` method found on the returned endpoint instance: you may have forgotten to define `render`.")
  }

  private endpointDidCatch(err: Error) {
    this.logger.error('Unhandled error', err)
    this.syncano.response('Unandled error', 500)
  }
}

Syncano.Endpoint = Endpoint

export default Syncano
