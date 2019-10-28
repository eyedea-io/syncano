const merge = require('lodash/merge')
import * as S from '@syncano/core'
import * as SyncanoTest from '@syncano/test'
import {SinonStub, stub} from 'sinon'
import {SyncanoTestRun} from './types'
const {Core} = S
let stubbed: SinonStub | null = null
const run = SyncanoTest.run as SyncanoTestRun

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
