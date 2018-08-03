import { ILifecycle } from '@envisioning/common-core/components/lifecycle'

export interface IClockComponent {
  getTimestamp: () => number
  setTimestamp: (timestamp: number) => void
}

export class ClockComponent implements ILifecycle, IClockComponent {
  public getTimestamp() {
    return + new Date()
  }

  public setTimestamp(timestamp: number) {
    console.log('test only')
  }

  public start() {
    // noop
  }

  public stop() {
    // noop
  }
}
