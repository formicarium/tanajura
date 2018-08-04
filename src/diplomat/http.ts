import { IHttpClient } from './../components/http'
import { IPush } from '../components/git-server'

export interface IServicesPushedResponse {
  ok: boolean
}

export const repoPushed = (pushDescription: IPush, http: IHttpClient): Promise<IServicesPushedResponse> => {
  return http.request<IServicesPushedResponse>({
    service: 'hive',
    url: `/services/${pushDescription.repo}/pushed`,
    method: 'POST',
    data: {
      branch: pushDescription.branch,
      commit: pushDescription.commit,
    },
  })
}
