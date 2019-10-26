const merge = require('lodash/merge')
import * as S from '@syncano/core'
import {SinonStub, stub} from 'sinon'
import {Context} from '.'

const {run}: SyncanoTestModule = require('@syncano/test')
const {Core} = S
let stubbed: SinonStub | null = null

export const createSyncanoCoreMock = (customMock: Partial<S.Core>) => {
  if (stubbed) {
    stubbed.restore()
  }

  stubbed = stub(S, 'Core' as any).callsFake((context: any) => {
    let syncano = new Core(context)

    syncano = merge(syncano, customMock)

    if (customMock.data) {
      // Overwrite syncano.data Proxy with object
      syncano.data = customMock.data
    }

    return syncano
  })

  return {'@syncano/core': stubbed}
}

export {run}

interface SyncanoTestModule {
  run: <T>(
    endpointName: string,
    ctx: Partial<Context<T>>,
    params?: {
      mocks?: any
      [key: string]: any
    },
    callType?: 'endpoint' | 'eventHandler'
  ) => Promise<any>
}
