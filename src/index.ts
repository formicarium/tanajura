import { IComponents, componentMap } from './system'
import { System } from './components/system'
import { eventMap } from './diplomat/git'

const main = async () => {
  const system = new System<IComponents>(componentMap)
  const components: IComponents = await system.start()
  const { port } = components.config.getConfig().service
  console.log(`System is up: http://localhost:${port}/api/version`)

  eventMap.push({repo: 'repo1.git', commit: 'bla'}, components)
}

main()
  .catch((err) => {
    console.log(err)
  })
