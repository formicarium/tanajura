import { IContext } from '../../graphql/schema'

export default {
  createUser: async (value, args, ctx: IContext, info) => {
    return ctx.components.prisma.db.mutation.createUser(args, info)
  },
}
