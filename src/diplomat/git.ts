import { IEventMap } from './../components/git-server'
import {  IComponents } from './../system'
import { IPush } from '../components/git-server'

export const eventMap: IEventMap<IComponents> = {
  push: async (push: IPush, components) => {
    // await repoPushed(push, components)
  },
}
