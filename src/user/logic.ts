import { User } from '../generated/prisma'

export const getHighPriorityIdentification = (user: Partial<User>): string | null => {
  if (user.firstName) {
    return [user.firstName, user.lastName].join(' ')
  }
  if (user.username) {
    return user.username
  }
  return null
}
