import { IHttpClient } from './../components/http'
import { IPush } from '../components/git-server'
import { IConfig } from '../system'

export interface IServicesPushedResponse {
  ok: boolean
}
const getServiceNameFromRepo = (repo: string) => repo.slice(0, -4)

interface IServiceResponse {
  name: string,
  devspace: string,
  links: {
    default: string,
    stinger: string,
    [name: string]: string,
  }
}

export const getStingerUrlForService = async (service: string, http: IHttpClient, config: IConfig) => {
  const response = await http.request<IServiceResponse>({
    service: 'soil',
    url: `/api/devspaces/${config.devspace}/services/${service}`,
    method: 'get',
  })
  return response.links.stinger
}

export const repoPushed = async (pushDescription: IPush, http: IHttpClient, config: IConfig): Promise<IServicesPushedResponse> => {
  const serviceUrl = await getStingerUrlForService(getServiceNameFromRepo(pushDescription.repo), http, config)
  return http.requestRaw<IServicesPushedResponse>({
    url: `${serviceUrl}/pull`,
    method: 'POST',
    data: {
      branch: pushDescription.branch,
      commit: pushDescription.commit,
    },
  })
}
