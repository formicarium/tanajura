import { IContext } from '../../graphql/schema'
import { combineResolvers } from 'graphql-resolvers'
import { authenticated } from '@envisioning/common-graphql/interceptors'

export default {
  user: combineResolvers(
    authenticated,
    (value, args, ctx: IContext, info) => {
      return ctx.components.prisma.db.query.user({
        where: {
          id: args.id,
        },
      }, info)
    },
  ),
}
