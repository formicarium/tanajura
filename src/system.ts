import { IComponents } from './system'
import { IHttpClient, HttpClient } from './components/http'
import { GitServer, IGitServer } from './components/git-server'
import * as path from 'path'
import { routes } from './routes'
import { ExpressService, IService } from './components/service'
import { eventMap } from './diplomat/git'
import { IConfigComponent, ConfigComponent } from './components/config'
import { IClockComponent, ClockComponent } from './components/clock'
import { IComponentMap } from './components/system'
import { ENV } from './const'

export interface IConfig {
  service: {
    port: number,
  },
}

export interface IComponents {
  config: IConfigComponent<IConfig>,
  service: IService,
  clock: IClockComponent,
  http: IHttpClient,
  git: IGitServer
}

export const componentMap: IComponentMap = {
  config: {
    instance: new ConfigComponent<IConfig>(process.env.NODE_ENV as ENV || ENV.dev, path.join(__dirname, '../resources')),
    dependenciesList: [],
  },
  service: {
    instance: new ExpressService(routes),
    dependenciesList: ['config', 'clock', 'git'],
  },
  clock: {
    instance: new ClockComponent(),
    dependenciesList: [],
  },
  git: {
    instance: new GitServer<IComponents>(eventMap),
    dependenciesList: ['config', 'http'],
  },
  http: {
    instance: new HttpClient(),
    dependenciesList: ['config'],
  },
}
