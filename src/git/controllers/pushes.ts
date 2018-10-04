import { IPush } from '../../components/git-server'
import { IHttpClient } from '../../components/http'
import { IConfig } from '../../system'
import { IConfigComponent } from '../../components/config'
import { getServiceNameFromRepo } from '../../logic/repo'
import { getStingerUrlForService, tellStingerToPull } from '../../diplomat/http'
import { SoilUnreachableError, SoilServiceNotFound, SoilInternalServerError, StingerUnreachableError, StingerInternalServerError, CommitPollingMaxPolls } from '../../diplomat/errors'
import { checkIfCommitArrived, getLastCommitMessage } from '../../diplomat/git-process'
import * as path from 'path'
import { shouldSkipPull } from '../../logic/commit'

// A really silly method to check if the commit arrivied in our server
const MAX_POLLS = 10
const POLL_INTERVAL = 1000
const waitUntilCommitArrived = (expectedCommit: string, gitFolder: string) => {
  let count = 0
  let interval
  return new Promise((resolve, reject) => {
    const checkRoutine = async () => {
      count++
      if (count >= MAX_POLLS) {
        clearInterval(interval)
        reject(new CommitPollingMaxPolls())
      }

      const commitArrived = await checkIfCommitArrived(expectedCommit, gitFolder)
      if (commitArrived) {
        clearInterval(interval)
        resolve()
      }
    }
    interval = setInterval(checkRoutine, POLL_INTERVAL)
    checkRoutine()
  })
}

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
    console.log(`Received push in repository ${pushDescription.repo}`)
    console.log(`sha: ${pushDescription.commit}`)

    // Let's wait to be sure that the commit content is in the server repo
    const reposFolder = config.getRequiredValue(['git', 'folder']) as string
    const gitFolder = path.join(reposFolder, pushDescription.repo)
    await waitUntilCommitArrived(pushDescription.commit, gitFolder)

    // Check if we should skip this by looking at the commit message
    const message = await getLastCommitMessage(gitFolder)
    console.log(`message: ${message}`)
    const skip = shouldSkipPull(message)
    if (skip) {
      console.log(`Skipping. ${message}`)
      return
    }

    // Tell stinger to pull
    const serviceName = getServiceNameFromRepo(pushDescription.repo)
    const devspace = config.getRequiredValue(['devspace']) as string
    const stingerUrl = await getStingerUrlForService(devspace, serviceName, http)
    await tellStingerToPull(stingerUrl, pushDescription, http)
  } catch (err) {
    switch (err.name) {
      case CommitPollingMaxPolls.id:
        console.log(`Tried to poll local folder ${MAX_POLLS} times but commit did not arrive`)
        break
      case SoilUnreachableError.id:
        console.log(`Error: Soil is unreachable ${err.address}:${err.port}`)
        break
      case SoilServiceNotFound.id:
        const soilServiceNotFound: SoilServiceNotFound = err
        console.log(`Error: Soil service Not Found (${soilServiceNotFound.address}:${soilServiceNotFound.port}`)
        console.log(`devspace/service: ${soilServiceNotFound.devspaceName}/${soilServiceNotFound.serviceName}`)
        break
      case SoilInternalServerError.id:
        console.log(`Error: Soil internal server error (${soilServiceNotFound.address}:${soilServiceNotFound.port})`)
        console.log(err)
        break
      case StingerUnreachableError.id:
        console.log(`Error: Stinger is unreachable (${err.address}:${err.port})`)
        break
      case StingerInternalServerError.id:
        console.log(`stinger pull error! (${err.address}:${err.port})`)
        console.log(err)
        break
      default:
        throw err
    }
  }
}
