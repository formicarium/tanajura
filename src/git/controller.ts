import { IComponents } from './../system'
import * as boom from 'boom'
import { IRepo } from './model'

/**
 * create a repo with name
 * @param repo string
 * @param components IComponents
 */
export const newRepo = async (repo: string, { git }: IComponents): Promise<void> => {
  const exists = await git.repoExists(repo)
  if (exists) {
    throw boom.conflict(`${repo} already exists.`)
  }
  return git.newRepo(repo)
}

/**
 * delete a repo by name
 * @param repo string
 * @param components IComponents
 */
export const deleteRepo = (repo: string, { git }: IComponents): Promise<void> => {
  return git.deleteRepo(repo)
}

/**
 * get info for repo by name
 * @param repo string
 * @param components IComponents
 */
export const getRepo = async (repo: string, { git }: IComponents): Promise<IRepo> => {
  if (!await git.repoExists(repo))  {
    throw boom.notFound(`${repo} not found`)
  }

  return {
    name: repo,
  }
}
