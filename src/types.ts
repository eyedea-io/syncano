import * as S from '@syncano/core'
import Bluebird = require('bluebird')
export interface Logger {
  warn: (...messages: any[]) => void
  debug: (...messages: any[]) => void
  info: (...messages: any[]) => void
  error: (...messages: any[]) => void
  listen?: (callback: (event: any) => void) => void
}
export type SyncanoTestRun = <T extends {}>(
  endpointName: string,
  ctx: Partial<S.Context<T>>,
  params?: {
    mocks?: any
    [key: string]: any
  },
  callType?: 'endpoint' | 'eventHandler'
) => Bluebird<any>
