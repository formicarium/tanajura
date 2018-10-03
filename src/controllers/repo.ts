import { getStingerUrlForService, tellStingerToPull } from '../diplomat/http'
import { IHttpClient } from '../components/http'
import { IConfigComponent } from '../components/config'
import { IPush } from '../components/git-server'
import { IConfig } from '../system'
import { getServiceNameFromRepo } from '../logic/repo'

/**
 * pushReceived
 * When we receive a push, we have the repo name
 * With the repo name, we discover the service name
 * With the service name and the devspace (from config) we ask soil for it's stingerUrl
 * with stingerUrl, we can request stinger to pull the new code
 * Stinger will automatically restart the service after pull
 * @param pushDescription IPush
 * @param http IHttpClient
 * @param config IConfigComponent<IConfig></IConfig>
 */
export const pushReceived = async (pushDescription: IPush, http: IHttpClient, config: IConfigComponent<IConfig>) => {
  const serviceName = getServiceNameFromRepo(pushDescription.repo)
  const devspace = config.getRequiredValue(['devspace']) as string
  const stingerUrl = await getStingerUrlForService(devspace, serviceName, http)
  await tellStingerToPull(stingerUrl, pushDescription, http)
}
