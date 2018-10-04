import { IEventMap } from './../components/git-server'
import {  IComponents } from './../system'
import { IPush } from '../components/git-server'
import * as gitPushesController from '../git/controllers/pushes'

const handlePush = async (pushDescription: IPush, components: IComponents) => {
  try {
    await gitPushesController.pushReceived(pushDescription, components.http, components.config)
  } catch (err) {
    console.log('Unknown error')
    console.log(err)
  }
}

export const eventMap: IEventMap<IComponents> = {
  push: handlePush,
}
