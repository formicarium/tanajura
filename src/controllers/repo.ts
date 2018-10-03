import { getStingerUrlForService, tellStingerToPull } from '../diplomat/http'
import { IHttpClient } from '../components/http'
import { IConfigComponent } from '../components/config'
import { IPush } from '../components/git-server'
import { IConfig } from '../system'
import { getServiceNameFromRepo } from '../logic/repo'

export const pushReceived = async (pushDescription: IPush, http: IHttpClient, config: IConfigComponent<IConfig>) => {
  const serviceName = getServiceNameFromRepo(pushDescription.repo)
  const devspace = config.getRequiredValue(['devspace']) as string
  const stingerUrl = await getStingerUrlForService(devspace, serviceName, http)
  await tellStingerToPull(stingerUrl, pushDescription, http)
}
