import { exec, ExecOptions } from 'child_process'

export const execAsPromise = (cmd: string, options: ExecOptions): Promise<string> => {
  return new Promise((resolve, reject) => {
    exec(cmd, options, (err, stdout, stderr) => {
      if (err) {
        reject(err)
        return
      }
      resolve(stdout)
    })
  })
}
const clearString = (s) => s.replace(/\n|\r/g, '').trim()

export const getLastCommitMessage = (gitFolder: string): Promise<string> => {
  return execAsPromise('git log -n 1 -b tanajura --pretty=%B', {
    cwd: gitFolder,
  }).then(clearString)
}

export const getLastCommitSha = (gitFolder: string) => {
  return execAsPromise('git log -n 1 -b tanajura --pretty=%H', {
    cwd: gitFolder,
  }).then(clearString)
}

export interface ICommitInfo {
  sha: string,
  message: string
}

export const getLastCommitInfo = async (gitFolder: string): Promise<ICommitInfo> => {
  const [ sha, message ] = await Promise.all([getLastCommitSha(gitFolder), getLastCommitMessage(gitFolder)])
  return {
    sha,
    message,
  }
}

export const checkIfCommitArrived = async (expectedCommitSha: string, gitFolder: string): Promise<boolean> => {
  const lastCommitSha = await getLastCommitSha(gitFolder)
  return String(expectedCommitSha).valueOf() === String(lastCommitSha).valueOf()
}
