import { IComponents } from './../system'

export const newRepo = (repo: string, { git }: IComponents): Promise<void> => {
  return git.newRepo(repo)
}
