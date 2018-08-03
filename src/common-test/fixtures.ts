import { SCOPES } from '../acl/scopes'
import { IAccount } from '@envisioning/common-core/auth'
import { ID } from '../common/types'

interface ITestUsersMap {
  guest: undefined,
  viewer: IAccount,
  editor: IAccount
  admin: IAccount
  researcher: IAccount
}
export const testUsers: ITestUsersMap = {
  guest: undefined,
  viewer: {
    id: '1',
    holderId: '1',
    email: 'viewer@viewer.com',
    holderType: 'user',
    scopes: [SCOPES.viewer],
  } as IAccount,
  editor: {
    id: '1',
    email: 'editor@editor.com',
    holderId: '1',
    holderType: 'user',
    scopes: [SCOPES.editor],
  },
  admin: {
    id: '1',
    email: 'admin@admin.com',
    holderId: '1',
    holderType: 'user',
    scopes: [SCOPES.admin],
  },
  researcher: {
    id: '1',
    holderId: '1',
    email: 'researcher@researcher.com',
    holderType: 'user',
    scopes: [SCOPES.researcher],
  },
}

export const getViewer = (id: ID): IAccount => ({
  ...testUsers.viewer,
  id: id as string,
  holderId: id as string,
  holderType: 'user',
})
