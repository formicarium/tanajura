import { IConfigComponent } from '@envisioning/common-core/components/config'
import { ILifecycle } from './lifecycle'
import * as Server from 'node-git-server'

export interface IGitServerDependencies {
  config: IConfigComponent<any>
}

export interface IHttpDuplex {
  accept: () => void
}
export interface IPush extends IHttpDuplex {
  repo: string
  commit: string
  branch: string
}

export interface IEventMap {
  push: (push: IPush) => Promise<void>
}

export interface IGitServer {
  newRepo: (name: string) => Promise<void>
}
export class GitServer implements ILifecycle {
  private server: any
  private eventMap: IEventMap

  constructor(eventMap: IEventMap) {
    this.eventMap = eventMap
  }

  private setupEventHandling = () => {
    this.server.on('push', this.eventMap.push)
  }

  public newRepo = (name: string) => {
    return new Promise((resolve, reject) => {
      this.server.create(name, (err) => {
        console.log(err)
        if (err) {
          reject(err)
          return
        }
        resolve(name)
      })
    })
  }

  public start({ config }: IGitServerDependencies) {
    const folder = config.getRequiredValue(['git', 'folder'])
    const port = config.getRequiredValue(['git', 'port'])
    const type = config.getRequiredValue(['git', 'type'])

    this.server = new Server(folder, {
      autoCreate: false,
    })

    return new Promise((resolve, reject) => {
      this.server.listen(port, {
        type,
      }, (err) => {
        if (err) {
          reject(err)
          return
        }
        console.log(`Git is listening on ${port}`)
        resolve()
      })
    })
    .then(this.setupEventHandling)
  }

  public stop() {
    this.server.close()
  }
}
