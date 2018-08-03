import { ILifecycle } from '@envisioning/common-core/components/lifecycle'
import { IClockComponent } from '../clock'

export class ClockComponentMock implements ILifecycle, IClockComponent {
  private timestamp: number = 0

  public getTimestamp() {
    return this.timestamp
  }

  public setTimestamp(timestamp: number) {
    this.timestamp = timestamp
  }

  public start() {
    this.timestamp = 0
    // noop
  }

  public stop() {
    this.timestamp = 0
    // noop
  }
}
