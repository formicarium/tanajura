import { topoSort } from '@thunder-js/toposort'
import { ILifecycle } from './lifecycle'

export interface ISystem<T> {
  getStartedComponents(): T
}

export interface IComponentDescription {
  instance: ILifecycle,
  dependenciesList: string[],
}

export interface IComponentMap {
  [name: string]: IComponentDescription
}

const componentMapToGraph = (componentMap: IComponentMap) => Object.keys(componentMap).reduce((acc, componentId) => {
  const component = componentMap[componentId]
  return [
    ...acc, {
      id: componentId,
      edges: component.dependenciesList,
    },
  ]
}, [])

export class System<T> implements ISystem<T>, ILifecycle {
  private componentMap: IComponentMap
  private startedComponents: T

  constructor(componentMap: IComponentMap) {
    this.componentMap = componentMap
  }

  public async start(): Promise<T> {
    const graph = componentMapToGraph(this.componentMap)
    const sorted = topoSort(graph)

    let startedComponents = {}

    for (const componentName of sorted) {
      const component = this.componentMap[componentName]
      const instance = component.instance
      const dependencies = component.dependenciesList.reduce((depAcc, dependencyId) => ({
        ...depAcc,
        [dependencyId]: this.componentMap[dependencyId].instance,
      }), {})
      await instance.start(dependencies)
      startedComponents = {
        ...startedComponents,
        [componentName]: instance,
      }
    }

    this.startedComponents = startedComponents as T
    return this.startedComponents
  }

  public async stop() {
    const graph = componentMapToGraph(this.componentMap)
    const sorted = [...topoSort(graph)].reverse()
    const startedComponents = this.startedComponents as any
    for (const componentName of sorted) {
      const component: ILifecycle = startedComponents[componentName]
      if (component.stop) {
        await component.stop()
      }
    }
  }

  public getStartedComponents() {
    return this.startedComponents
  }
}
