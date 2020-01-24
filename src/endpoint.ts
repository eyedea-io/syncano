import * as S from '@syncano/core'
import {NotFoundError} from '@syncano/core/lib/errors'
import {HttpError} from './http-error'
import {Logger} from './types'

// tslint:disable-next-line:no-var-requires
const Validator = require('@syncano/validate').default

export class Endpoint<
  Args = {
    [name: string]: any
  }
> {
  public ctx: S.Context<Args>
  public user?: {
    id: number
    username: string
    user_key: string
  }
  public logger: Logger
  public syncano: S.Core

  constructor(ctx: S.Context<Args>) {
    this.ctx = ctx
    this.user = ctx.meta.user
    this.syncano = new S.Core(ctx)
    this.logger = this.syncano.logger(this.ctx.meta.executor)
    this.execute()
  }

  public run?(core: S.Core, ctx: S.Context<Args>): any

  public endpointDidCatch(err: Error): void {
    console.warn(err)
  }

  private async execute(): Promise<any> {
    this.ctx.meta.metadata = {
      ...this.ctx.meta.metadata
    }
    const validator = new Validator(this.ctx)

    try {
      if (typeof this.run === 'function') {
        try {
          await validator.validateRequest()
        } catch (err) {
          return this.syncano.response.json(err.messages, 400 as any)
        }

        const res = await this.run(this.syncano, this.ctx)
        const isResponse = res && res.mimetype && res.status

        if (res instanceof HttpError) {
          const {message, statusCode} = res

          this.syncano.response.json({message}, statusCode as any)
        } else if (res instanceof NotFoundError) {
          const {message} = res

          this.syncano.response.json({message}, 404)
        } else if (res !== null && typeof res === 'object' && !isResponse) {
          this.syncano.response.json(res)
        } else if (typeof res === 'string') {
          this.syncano.response(res)
        }
      } else {
        this.syncano.response.json({
          message:
            'No `run` method found on the returned endpoint instance: you may have forgotten to define `run`.'
        })
      }
    } catch (err) {
      if (err instanceof HttpError) {
        const {message, statusCode} = err

        this.syncano.response.json({message}, statusCode as any)
      } else {
        this.endpointDidCatch(err)
      }
    }
  }
}
