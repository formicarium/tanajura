import { System } from '@envisioning/common-core/components/system'
import { IComponents, componentMap } from './system'

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
