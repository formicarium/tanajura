export class BaseError extends Error {
  public originalError: Error
  constructor(originalError: Error, message?: string) {
    super(message)
    this.originalError = originalError
  }
}

export class HttpError extends BaseError {
  public address: string
  public port: number

  constructor(originalError: Error, address: string, port: number) {
    super(originalError)
    this.address = address
    this.port = port
  }
}

export class SoilUnreachableError extends HttpError {
  public static id = 'SoilUnreachableError'

  constructor(originalError: Error, address: string, port: number) {
    super(originalError, address, port)
    this.name = SoilUnreachableError.id
  }
}

export class SoilServiceNotFound extends HttpError {
  public static id = 'SoilServiceNotFound'
  public devspaceName: string
  public serviceName: string

  constructor(originalError: Error, address: string, port: number, devspaceName: string, serviceName: string) {
    super(originalError, address, port)
    this.name = SoilServiceNotFound.id
    this.devspaceName = devspaceName
    this.serviceName = serviceName
  }
}

export class SoilInternalServerError extends HttpError {
  public static id = 'SoilInternalServerError'
  constructor(originalError: Error, address: string, port: number) {
    super(originalError, address, port)
    this.name = SoilInternalServerError.id
  }
}

export class StingerUnreachableError extends HttpError {
  public static id = 'StingerUnreachableError'
  constructor(originalError: Error, address: string, port: number) {
    super(originalError, address, port)
    this.name = StingerUnreachableError.id
  }
}

export class StingerInternalServerError extends HttpError {
  public static id = 'StingerInternalServerError'
  constructor(originalError: Error, address: string, port: number) {
    super(originalError, address, port)
    this.name = StingerInternalServerError.id
  }
}
