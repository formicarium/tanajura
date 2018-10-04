export const SKIP_PULL_TOKEN = '[skip-pull]'

export const shouldSkipPull = (commitMessage: string): boolean => {
  return (commitMessage && commitMessage.indexOf(SKIP_PULL_TOKEN) > 0)
}
