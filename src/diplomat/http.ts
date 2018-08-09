import { IHttpClient } from './../components/http'
import { IPush } from '../components/git-server'

export interface IServicesPushedResponse {
  ok: boolean
}

const getStingerUrlForService = (service: string) => `http://${service}-stinger`
const getServiceNameFromRepo = (repo: string) => repo.slice(0, -4)

export const repoPushed = (pushDescription: IPush, http: IHttpClient): Promise<IServicesPushedResponse> => {
  const serviceUrl = getStingerUrlForService(getServiceNameFromRepo(pushDescription.repo))
  return http.requestRaw<IServicesPushedResponse>({
    url: `${serviceUrl}/pull`,
    method: 'POST',
    data: {
      branch: pushDescription.branch,
      commit: pushDescription.commit,
    },
  })
}
