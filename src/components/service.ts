import * as express from 'express'
import { Server } from 'http'
import { ILifecycle } from './lifecycle'

export interface IService {
  getServer(): Server
}
export class ExpressService implements IService, ILifecycle {
  private routes: express.Router
  private app: express.Application
  private server: Server
  private connections: { [key: string]: any }

  constructor(routes: express.Router) {
    this.routes = routes
    this.app = express()
    this.connections = {}
  }

  public start(deps: any) {
    return new Promise((resolve, reject) => {
      const port = deps.config.getConfig().service.port
      this.app.use((req: any, res, next) => {
        req.components = deps
        next()
      })
      this.app.use(this.routes)

      const server = this.app.listen(port, (err: any) => {
        if (err) {
          return reject(err)
        }

        this.server = server
        resolve()
      })

      server.on('connection', (conn) => {
        const key = conn.remoteAddress + ':' + conn.remotePort
        this.connections[key] = conn
        conn.on('close', () => {
          delete this.connections[key]
        })
      })
    })
  }

  public stop() {
    // TODO: Close server
    for (const key of Object.keys(this.connections)) {
      this.connections[key].destroy()
    }

    return new Promise((resolve, reject) => {
      this.server.close((err: any) => {
        if (err) {
          return reject(err)
        }
        resolve()
      })
    })
  }

  public getServer() {
    return this.server
  }
}
