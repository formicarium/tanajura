import { IHttpClient } from './../components/http'
import { IPush } from '../components/git-server'
import { SoilServiceNotFound, SoilUnreachableError, StingerUnreachableError, StingerInternalServerError, SoilInternalServerError } from './errors'
import * as R from 'ramda'

interface IServiceResponse {
  name: string,
  devspace: string,
  links: {
    default: string,
    stinger: string,
    [name: string]: string,
  }
}

export const isConnectionRefused = R.equals('ECONNREFUSED')

/**
 * getStingerUrlForService
 * @param devspace string
 * @param service string
 * @param http IHttpClient
 *
 * @throws SoilUnreachableError
 * @throws SoilServiceNotFound
 * @throws SoilInternalServerError
 */
export const getStingerUrlsForService = (devspace: string, service: string, http: IHttpClient) => {
  return http.request<IServiceResponse>({
    service: 'soil',
    url: `/api/devspaces/${devspace}/services/${service}`,
    method: 'get',
  })
  .then((response) => response.map(app => app.links.stinger))
  .catch((error) => {
    throw R.cond([
      [isConnectionRefused, R.always(new SoilUnreachableError(error, error.address, error.port))],
      [R.equals(404), R.always(new SoilServiceNotFound(error, error.address, error.port, devspace, service))],
      [R.equals(500), R.always(new SoilInternalServerError(error, error.address, error.port))],
      [R.T, R.always(error)],
    ])(error.code)
  })
}

export interface IStingerPullResponse {
  ok: boolean
}

/**
 *
 * @param stingerUrls string[]
 * @param pushDescription IPush`
 * @param http IHttpClient
 *
 * @throws StingerUnreachableError
 * @throws StingerInternalServerError
 * @throws Error
 */
export const tellStingersToPull = (stingerUrls: string[], pushDescription: IPush, http: IHttpClient) => {
  return stingerUrls.map(stingerUrl => http.requestRaw<IStingerPullResponse>({
    url: `${stingerUrl}/pull`,
    method: 'POST',
    data: {
      branch: pushDescription.branch,
      commit: pushDescription.commit,
    },
  })
  .catch((error) => {
    throw R.cond([
      [isConnectionRefused, R.always(new StingerUnreachableError(error, error.address, error.port))],
      [R.equals(500), R.always(new StingerInternalServerError(error, error.address, error.port))],
      [R.T, R.always(error)],
    ])(error)
  }))
}
