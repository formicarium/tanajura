import { exec } from 'child-process-promise'

import { request } from 'graphql-request'

export const deployPrisma = () => {
  console.log(process.env.NODE_ENV)
  console.log('Deploying prisma...')
  return exec('yarn prisma:deploy')
    .then(() => {
      console.log('Finished')
    })
    .catch((code) => {
      console.log('Exit with code ' + code)
      throw new Error('could not deploy prisma')
    })
}

export const resetPrisma = () => {
  console.log('Resetting prisma...')
  return exec('yarn prisma:reset')
    .then(() => {
      console.log('Finished')
    })
    .catch((code) => {
      console.log('Exit with code ' + code)
      throw new Error('could not reset prisma')
    })
}

export const seedPrisma = (endpoint, q) => {
  return request(endpoint, q)
}
