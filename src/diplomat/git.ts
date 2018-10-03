import { IEventMap } from './../components/git-server'
import {  IComponents } from './../system'
import { IPush } from '../components/git-server'
import * as controllers from '../controllers/repo'

const handlePush = async (pushDescription: IPush, components: IComponents) => {
  console.log(`Received push in repository ${pushDescription.repo}`)
  try {
    await controllers.pushReceived(pushDescription, components.http, components.config)
  } catch (err) {
    console.log('Failed to handle push')
    console.log(err)
  }
}

export const eventMap: IEventMap<IComponents> = {
  push: handlePush,
}
