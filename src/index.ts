import { IComponents, componentMap } from './system'
import { System } from './components/system'

const main = async () => {
  const system = new System<IComponents>(componentMap)
  const components: IComponents = await system.start()
  const { port } = components.config.getConfig().service
  console.log(`System is up: http://localhost:${port}/health`)
}

main()
  .catch((err) => {
    console.log(err)
  })
