import { IPush } from '../../components/git-server'
import { IHttpClient } from '../../components/http'
import { IConfig } from '../../system'
import { IConfigComponent } from '../../components/config'
import { getServiceNameFromRepo } from '../../logic/repo'
import { getStingerUrlForService, tellStingerToPull } from '../../diplomat/http'
import { SoilUnreachableError, SoilServiceNotFound, SoilInternalServerError, StingerUnreachableError, StingerInternalServerError } from '../../diplomat/errors'

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
  try {
    const serviceName = getServiceNameFromRepo(pushDescription.repo)
    const devspace = config.getRequiredValue(['devspace']) as string
    const stingerUrl = await getStingerUrlForService(devspace, serviceName, http)
    await tellStingerToPull(stingerUrl, pushDescription, http)
  } catch (err) {
    switch (err.name) {
      case SoilUnreachableError.id:
        console.log('Error: Soil is unreachable')
        console.log(`address: ${err.address}:${err.port}`)
        break
      case SoilServiceNotFound.id:
        const soilServiceNotFound: SoilServiceNotFound = err
        console.log('Error: Soil service Not Found')
        console.log(`address: ${soilServiceNotFound.address}:${soilServiceNotFound.port}`)
        console.log(`devspace/service: ${soilServiceNotFound.devspaceName}/${soilServiceNotFound.serviceName}`)
        break
      case SoilInternalServerError.id:
        console.log('Error: Soil internal server error')
        console.log(`address: ${soilServiceNotFound.address}:${soilServiceNotFound.port}`)
        console.log(err)
        break
      case StingerUnreachableError.id:
        console.log('Error: Stinger is unreachable')
        console.log(`address: ${err.address}:${err.port}`)
        break
      case StingerInternalServerError.id:
        console.log('stinger pull error!')
        console.log(`address: ${err.address}:${err.port}`)
        console.log(err)
        break
      default:
        throw err
    }
  }
}
