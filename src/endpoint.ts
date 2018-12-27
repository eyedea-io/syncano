import {Logger} from '../typings/syncano-core'
import {HttpError} from './http-error'

import Syncano, {SyncanoContext} from '@syncano/core'
// tslint:disable-next-line:no-var-requires
const Validator = require('@syncano/validate').default

export class Endpoint<Args = {
  [name: string]: any
}> {
  public ctx: SyncanoContext<Args>
  public user?: {
    id: number
    username: string
    user_key: string
  }
  public logger: Logger
  public syncano: Syncano

  constructor(ctx: SyncanoContext<Args>) {
    this.ctx = ctx
    this.user = ctx.meta.user
    this.syncano = new Syncano(ctx)
    this.logger = this.syncano.logger(this.ctx.meta.executor)
    this.execute()
  }

  public run?(core: Syncano, ctx: SyncanoContext<Args>): any

  public endpointDidCatch(err: Error) {
    console.warn(err)
  }

  private async execute(): Promise<any> {
    const validator = new Validator(this.ctx)

    try {
      if (typeof this.run === 'function') {
        try {
          this.ctx.meta = {
            ...this.ctx.meta,
            metadata: {
              ...this.ctx.meta.metadata,
              inputs: {
                ...(this.ctx.meta.metadata as any).inputs
              }
            } as any
          }
          await validator.validateRequest()
        } catch (err) {
          return this.syncano.response.json(err.messages, 400 as any)
        }

        const res = await this.run(this.syncano, this.ctx)
        const isResponse = res && res.mimetype && res.status

        if (res instanceof HttpError) {
          const {message, statusCode} = res

          this.syncano.response.json({message}, statusCode as any)
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
