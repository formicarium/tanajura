export interface ILifecycle {
  start(dependencies: any): Promise<void> | void
  stop?(): Promise<void> | void
}
