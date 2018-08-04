import * as fs from 'fs-extra'
import { compile } from 'handlebars'
import * as path from 'path'
import { ILifecycle } from './lifecycle'
import * as R from 'ramda'
import { ENV } from '../const'

export interface IConfigComponent<T> {
  getConfig(): T,
  getValue: (path: string[], defaultValue: any) => string | number | null,
  getRequiredValue: (path: string[]) => string | number
}

const getMatches = (str: string, regex: RegExp): string[] => {
  const matches = []
  let match = regex.exec(str)
  while (match) {
    matches.push(match[1])
    match = regex.exec(str)
  }
  return matches
}

export interface IDict<V> { [key: string]: V }

export class ConfigComponent<T extends object> implements IConfigComponent<T>, ILifecycle {
  public content: T | null = null
  private env: ENV
  private resourcesFolder?: string

  constructor(env: ENV, resourcesFolder?: string) {
    this.env = env
    this.resourcesFolder = resourcesFolder
  }
  public async start() {
    const configPath: string = this.getFilePath(this.env)
    this.content = this.renderConfigFile(await this.readConfigFile(configPath))
  }

  public getConfig(): T {
    return this.content as T
  }

  public getValue(pathArray: string[], defaultValue: any = null) {
    return R.pathOr(defaultValue, pathArray, this.getConfig())
  }

  public getRequiredValue(pathArray: string[]) {
    const value = R.path<string | number>(pathArray, this.getConfig())
    if (!value) {
      throw new Error(`Value not found at ${pathArray.join('.')}`)
    }

    return value
  }

  public stop() {
    // noop
  }

  private readConfigFile(filePath: string): Promise<string> {
    if (!fs.existsSync(filePath)) {
      throw new Error(`${filePath} was not found!`)
    }
    return fs.readFile(filePath).then((buffer) => buffer.toString())
  }

  private getTemplatePayload(): IDict<string> {
    return process.env as IDict<string>
  }

  private handleRenderError(error: Error, configString: string, payload: IDict<string>) {
    const message = error.message
    console.log('error message')
    console.log(message)

    console.log('missing vars object')
    console.log(this.getAppliedPayload(configString, payload))

    console.log('template')
    console.log(configString)

    console.log('paylaod')
    console.log(payload)
  }

  private getHandlebarsHelpers() {
    return {
      or: (a: string, b: string) => a || b,
    }
  }

  private getAppliedPayload(configString: string, payload: IDict<string>): IDict<string> {
    const regex = /{{(?!or)(.*?)}}/g

    return getMatches(configString, regex).reduce((acc, varName) => ({
      ...acc,
      [varName]: payload[varName],
    }), {})
  }
  private renderConfigFile(configString: string): T {
    const template = compile(configString, { strict: true })
    const payload = this.getTemplatePayload()
    const helpers = this.getHandlebarsHelpers()

    console.log(this.getAppliedPayload(configString, payload))

    try {
      return JSON.parse(template(payload, {
        helpers,
      })) as T
    } catch (err) {
      this.handleRenderError(err, configString, payload)
      throw new Error('Failed to render config file')
    }
  }

  private getFilePath(env: ENV): string {
    if (this.resourcesFolder) {
      return path.resolve(this.resourcesFolder, `${env}.json`)
    }
  }
}
