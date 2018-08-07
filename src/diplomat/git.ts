import { IEventMap } from './../components/git-server'
import {  IComponents } from './../system'
import { IPush } from '../components/git-server'
import { repoPushed } from './http'

export const eventMap: IEventMap<IComponents> = {
  push: async (push: IPush, components) => {
    try {
      await repoPushed(push, components.http)
    } catch (err) {
      console.log(err)
    }
  },
}
