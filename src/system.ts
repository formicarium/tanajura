import { GitServer, IPush, IGitServer } from './components/git-server'
import * as path from 'path'
import { routes } from './routes'
import { IComponentMap } from '@envisioning/common-core/components/system'
import { ConfigComponent, IConfigComponent } from '@envisioning/common-core/components/config'
import { IClockComponent, ClockComponent } from '@envisioning/common-core/components/clock'
import { ExpressService, IService } from './components/service'

enum ENV {
  dev = 'dev',
}

export interface IConfig {
  service: {
    port: number,
  },
}

export interface IComponents {
  config: IConfigComponent<IConfig>,
  service: IService,
  clock: IClockComponent,
  git: IGitServer
}

const eventMap = {
  push: async (push: IPush) => {
    console.log(push)
  },
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
    instance: new GitServer(eventMap),
    dependenciesList: ['config'],
  },
}
