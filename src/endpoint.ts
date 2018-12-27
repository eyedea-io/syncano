import {SyncanoContext, User} from '../typings/syncano-context'
import {Logger, SyncanoCore} from '../typings/syncano-core'
import { HttpError } from './http-error'

// tslint:disable-next-line:no-var-requires
const Syncano = require('@syncano/core')
// tslint:disable-next-line:no-var-requires
const Validator = require('@syncano/validate').default

export class Endpoint<Args = {
  [name: string]: any
}> {
  public ctx: SyncanoContext<Args>
  public user?: User
  public logger: Logger
  public syncano: any

  constructor(ctx: SyncanoContext<Args>) {
    this.ctx = ctx
    this.user = ctx.meta.user
    this.syncano = new Syncano(ctx)
    this.logger = this.syncano.logger(this.ctx.meta.executor)
    this.execute()
  }

  public run?(core: SyncanoCore, ctx: SyncanoContext<Args>): any

  public endpointDidCatch(err: Error) {
    console.warn(err)
  }

  private async execute() {
    const validator = new Validator(this.ctx)

    try {
      if (typeof this.run === 'function') {
        try {
          await validator.validateRequest()
        } catch (err) {
          return this.syncano.response.json(err.messages, 400)
        }

        const res = await this.run(this.syncano, this.ctx)
        const isResponse = res && res.mimetype && res._status

        if (res instanceof HttpError) {
          const {message, statusCode} = res

          this.syncano.response.json({message}, statusCode)
        } else if (res !== null && typeof res === 'object' && !isResponse) {
          this.syncano.response.json(res)
        }
      } else {
        this.syncano.response.json({
          message: 'No `run` method found on the returned endpoint instance: you may have forgotten to define `run`.'
        })
      }
    } catch (err) {
      this.endpointDidCatch(err)
    }
  }
}
