import { IEventMap } from './../components/git-server'
import {  IComponents } from './../system'
import { IPush } from '../components/git-server'
import { repoPushed } from './http'

export const eventMap: IEventMap<IComponents> = {
  push: async (push: IPush, components) => {
    console.log('Received push:')
    console.log(push)
    try {
      await repoPushed(push, components.http, components.config.getConfig())
    } catch (err) {
      console.log(`Error pushing:`)
      console.log(err.toString())
    }
  },
}
