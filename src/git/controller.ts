import { IComponents } from './../system'
import * as diplomat from '../diplomat/http'
import { IPush } from '../components/git-server'

export const newRepo = async (repo: string, { git }: IComponents): Promise<void> => {
  const exists = await git.repoExists(repo)
  if (exists) {
    throw new Error('repo already exists')
  }
  return git.newRepo(repo)
}

export const repoPushed = async (pushDescription: IPush, { http }: IComponents): Promise<diplomat.IServicesPushedResponse> => {
  return diplomat.repoPushed(pushDescription, http)
}

export const deleteRepo = (repo: string, { git }: IComponents): Promise<void> => {
  return git.deleteRepo(repo)
}
