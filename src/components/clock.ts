import { ILifecycle } from './lifecycle'

export interface IClockComponent {
  getTimestamp: () => number
  getTimestampSeconds: () => number
  setTimestamp: (timestamp: number) => void
}

export class ClockComponent implements ILifecycle, IClockComponent {
  public getTimestamp() {
    return + new Date()
  }

  public setTimestamp(timestamp: number) {
    console.log('test only')
  }

  public getTimestampSeconds() {
    return Math.floor(+new Date() / 1000)
  }
  public start() {
    // noop
  }

  public stop() {
    // noop
  }
}
