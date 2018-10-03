import { IHttpClient } from './../components/http'
import { IPush } from '../components/git-server'

interface IServiceResponse {
  name: string,
  devspace: string,
  links: {
    default: string,
    stinger: string,
    [name: string]: string,
  }
}

export const getStingerUrlForService = async (devspace: string, service: string, http: IHttpClient) => {
  const response = await http.request<IServiceResponse>({
    service: 'soil',
    url: `/api/devspaces/${devspace}/services/${service}`,
    method: 'get',
  })
  return response.links.stinger
}

export interface IStingerPullResponse {
  ok: boolean
}

export const tellStingerToPull = (stingerUrl: string, pushDescription: IPush, http: IHttpClient) => {
  return http.requestRaw<IStingerPullResponse>({
    url: `${stingerUrl}/pull`,
    method: 'POST',
    data: {
      branch: pushDescription.branch,
      commit: pushDescription.commit,
    },
  })
}
