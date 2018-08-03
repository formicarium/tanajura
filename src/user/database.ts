import { ID } from '../common/types'
import { Prisma, User } from '../generated/prisma'
import { PrismaComponent } from '../components/prisma'

export const getUserIdentifications = async (userId: ID, prisma: PrismaComponent<Prisma>): Promise<Partial<User> | null> => {
  const user = await prisma.db.query.user({
    where: {
      id: userId,
    },
  }, `
    {
      firstName
      lastName
      username
      email
    }
  `)
  if (!user) {
    return null
  }
  return user
}
