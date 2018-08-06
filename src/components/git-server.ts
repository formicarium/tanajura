import { ILifecycle } from './lifecycle'
import * as Server from 'node-git-server'
import { IConfigComponent } from './config'
import * as fs from 'fs-extra'
import * as path from 'path'

export interface IGitServerDependencies {
  config: IConfigComponent<any>
}

export interface IHttpDuplex {
  accept: () => void
  reject: () => void
}

export interface IPush extends IHttpDuplex {
  repo: string
  commit: string
  branch: string
}

export interface IEventMap<T> {
  push: (push: IPush, components: T) => Promise<void>
}

export interface IGitServer {
  newRepo: (name: string) => Promise<void>
  deleteRepo: (name: string) => Promise<void>
}
export class GitServer<T> implements ILifecycle {
  private server: any
  private eventMap: IEventMap<T>
  private reposFolder: string

  constructor(eventMap: IEventMap<T>) {
    this.eventMap = eventMap
  }

  private setupEventHandling = (components: T) => {
    this.server.on('push', async (push: IPush) => {
      try {
        await this.eventMap.push(push, components)
        push.accept()
      } catch (err) {
        push.reject()
      }
    })
  }

  public newRepo = (name: string) => {
    return new Promise((resolve, reject) => {
      this.server.create(name, (err) => {
        if (err) {
          reject(err)
          return
        }
        resolve(name)
      })
    })
  }

  public deleteRepo = (name: string): Promise<void> => {
    const gitFolder = path.join(this.reposFolder, `${name}.git`)
    console.log(`Deleting ${gitFolder}`)
    return fs.remove(gitFolder)
  }

  public start(components: IGitServerDependencies & T) {
    const config = components.config
    const folder = config.getRequiredValue(['git', 'folder']) as string
    const port = config.getRequiredValue(['git', 'port'])
    const type = config.getRequiredValue(['git', 'type'])

    this.reposFolder = folder

    this.server = new Server(folder, {
      autoCreate: true,
    })

    return new Promise((resolve, reject) => {
      this.server.listen(port, {
        type,
      }, (err) => {
        if (err) {
          reject(err)
          return
        }
        console.log(`Git is listening on http://localhost:${port}`)
        resolve()
      })
    })
    .then(() => this.setupEventHandling(components))
  }

  public stop() {
    this.server.close()
  }
}
