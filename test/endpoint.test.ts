import * as S from '../src'

describe('Endpoint', () => {
  class HttpResponse {
    public status: number
    public content: string
    public mimetype: string
    constructor(status: number, content: string, mimetype: string) {
      this.content = content
      this.status = status
      this.mimetype = mimetype
    }
  }
  const ctx = {
    args: {},
    config: {} as any,
    meta: {} as any,
    HttpResponse
  }
  const construct = (res: any) => {
    return class extends S.Endpoint {
      public async run() {
        if (typeof res === 'function') {
          return res()
        }
        return res
      }
    }
  }
  let s: S.Endpoint

  beforeEach(() => {
    s = new S.Endpoint(ctx)
  })

  it('should run without error', () => {
    expect(s).toHaveProperty('ctx')
  })

  it('should initialize syncano/core', () => {
    expect(s).toHaveProperty('syncano')
    expect(s).toHaveProperty('syncano.user')
    expect(s).toHaveProperty('syncano.data')
  })

  it('should set response to returned object', done => {
    const Endpoint = construct({hello: 'world'})
    // tslint:disable-next-line:no-unused-expression
    new Endpoint({
      ...ctx,
      setResponse: (res: any) => {
        expect(res.content).toBe(JSON.stringify({hello: 'world'}))
        done()
      }
    } as any)
  })

  it('should set response to returned string', done => {
    const Endpoint = construct('Hello world')
    // tslint:disable-next-line:no-unused-expression
    new Endpoint({
      ...ctx,
      setResponse: (res: any) => {
        expect(res.content).toBe('Hello world')
        done()
      }
    } as any)
  })

  it('should handle returned response.json', done => {
    class Endpoint extends S.Endpoint {
      public async run({response}: S.Core) {
        return response.json({hello: 'world'})
      }
    }
    // tslint:disable-next-line:no-unused-expression
    new Endpoint({
      ...ctx,
      setResponse: (res: any) => {
        expect(res.content).toBe(JSON.stringify({hello: 'world'}))
        done()
      }
    } as any)
  })

  it('should handle returned response', done => {
    class Endpoint extends S.Endpoint {
      public async run({response}: S.Core) {
        return response('Hello world')
      }
    }
    // tslint:disable-next-line:no-unused-expression
    new Endpoint({
      ...ctx,
      setResponse: (res: any) => {
        expect(res.content).toBe('Hello world')
        done()
      }
    } as any)
  })

  it('should handle throw new S.HttpError', done => {
    class Endpoint extends S.Endpoint {
      public async run() {
        throw new S.HttpError('Unauthorized', 401)
      }
    }
    // tslint:disable-next-line:no-unused-expression
    new Endpoint({
      ...ctx,
      setResponse: (res: any) => {
        expect(res.content).toBe(JSON.stringify({message: 'Unauthorized'}))
        done()
      }
    } as any)
  })

  it('should handle return new S.HttpError', done => {
    class Endpoint extends S.Endpoint {
      public async run() {
        return new S.HttpError('Unauthorized', 401)
      }
      public endpointDidCatch(err: any) {
        expect(err.message).toEqual('Unauthorized')
        expect(err.statusCode).toEqual(401)
        done()
      }
    }
    // tslint:disable-next-line:no-unused-expression
    new Endpoint({
      ...ctx,
      setResponse: (res: any) => {
        expect(res.content).toBe(JSON.stringify({message: 'Unauthorized'}))
        done()
      }
    } as any)
  })

  it('should throw an error when validation fails', done => {
    class Endpoint extends S.Endpoint {
      public async run() {
        return 'Should fail'
      }
    }
    // tslint:disable-next-line:no-unused-expression
    new Endpoint({
      ...ctx,
      meta: {
        metadata: {
          inputs: {
            required: ['arg']
          }
        }
      },
      setResponse: (res: any) => {
        expect(res.content).toBe(
          JSON.stringify({'': ["Should have required property 'arg'"]})
        )
        done()
      }
    } as any)
  })

  it('should console.warn on error', done => {
    const warn = console.warn
    console.warn = () => {
      console.warn = warn
      done()
    }
    class Endpoint extends S.Endpoint {
      public async run() {
        throw new Error('An error')
      }
    }
    // tslint:disable-next-line:no-unused-expression
    new Endpoint(ctx)
  })
})
