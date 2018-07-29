export class HttpError extends Error {
  public statusCode: number
  public response?: Response & {
    data: any
  }

  constructor(m: string, statusCode: number) {
    super(m)
    Object.setPrototypeOf(this, HttpError.prototype)
    this.statusCode = statusCode
  }
}
