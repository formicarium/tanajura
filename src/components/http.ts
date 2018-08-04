import { IConfigComponent } from '@envisioning/common-core/components/config'
import axios, { AxiosRequestConfig } from 'axios'

export interface IRequest extends AxiosRequestConfig {
  service: string
}
export interface IHttpClient {
  request<T>(options: IRequest): Promise<T>
}

export interface IServiceMap {
  [serviceName: string]: string
}
export interface IHttpClientDependencies {
  config: IConfigComponent<any>
}

export class HttpClient {
  private services: any

  public start({ config }: IHttpClientDependencies) {
    this.services = config.getRequiredValue(['services'])
  }

  public stop() {
    // noop
  }

  public request<T>({ service, ...other }: IRequest): Promise<T> {
    const serviceUrl = this.services[service]

    return axios.request<T>({
      baseURL: serviceUrl,
      ...other,
    })
    .then((response) => response.data)
  }
}
