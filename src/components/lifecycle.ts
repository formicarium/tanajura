export interface ILifecycle {
  start(dependencies: any): Promise<any> | any
  stop?(): any
}
