import { IMessageAuthor } from '@envisioning/common-schemata/messages/message'
import { resetPrisma, deployPrisma } from '../../src/common-test/prisma'
import { testUsers } from '../../src/common-test/fixtures'
import { getTestEnv } from '../../src/common-test/graphql'
import { CREATE_ORGANIZATION_QUERY, DELETE_ORGANIZATION_QUERY, UPDATE_ORGANIZATION_QUERY, GET_ORGANIZATION_QUERY } from './fixtures'
import { testComponentMap, ITestComponents } from '../../src/system'
import { schema } from '../../src/graphql/schema'

jest.setTimeout(30000)

const expectError = (promise, expectedError) => {
  return expect(promise).rejects.toThrowError(expectedError)
}

beforeAll(async () => {
  await deployPrisma()
})

describe('Creates an organization', () => {
  beforeAll(async () => {
    await resetPrisma()
  })
  it('should succeed if authenticated', async () => {
    const { components, execute } = await getTestEnv<ITestComponents>(testComponentMap, schema)

    // Mock clock response
    components.clock.setTimestamp(100)

    // Query against the schema
    await execute({
      query: CREATE_ORGANIZATION_QUERY,
      as: testUsers.viewer,
    })

    console.log(components.producer.getProduced())

    // Check if created message was produced
    expect(components.producer.getProduced()).toEqual([{
      topicName: 'entities',
      key: 'organization.created',
      data: {
        metadata: {
          timestamp: 100,
          operationId: 'op-id',
          author: {
            id: testUsers.viewer.id,
            name: 'author-name-todo',
          } as IMessageAuthor,
        },
        data: {
          organization: expect.objectContaining({
            id: expect.any(String),
            name: 'organization 1',
            description: 'org desc',
            isPublic: true,
            allowACL: [],
            denyACL: [],
          }),
        },
      },
    }])
  })

  it ('should fail if not authenticated', async () => {
    const { execute } = await getTestEnv<ITestComponents>(testComponentMap, schema)

    // Query against the schema
    await expectError(execute({
      query: CREATE_ORGANIZATION_QUERY,
      as: testUsers.guest,
    }), 'NotAuthenticated')
  })
})

describe('Deleting an organization', async () => {
  beforeAll(async () => {
    await resetPrisma()
  })

  it('should fail if not authenticated or not authorized', async () => {
    const { execute } = await getTestEnv<ITestComponents>(testComponentMap, schema)
    // mockForDelete(components)

    const q = (as) => execute({
      query: DELETE_ORGANIZATION_QUERY,
      variables: {
        id: 'doest-not-matter',
      },
      as,
    })
    await expectError(q(testUsers.viewer), 'NotAuthorized')
    await expectError(q(testUsers.researcher), 'NotAuthorized')
    await expectError(q(testUsers.guest), 'NotAuthenticated')
  })

  it('should succeed if authorized and organization exists', async () => {
    const { execute, components } = await getTestEnv<ITestComponents>(testComponentMap, schema)
    components.clock.setTimestamp(100)

    const response = await execute({
      query: CREATE_ORGANIZATION_QUERY,
      as: testUsers.viewer,
    })

    const id = response.data.createOrganization.id

    expect(await execute({
      query: DELETE_ORGANIZATION_QUERY,
      variables: {
        id,
      },
      as: testUsers.editor,
    })).toEqual({
      data: {
        deleteOrganization: {
          id,
        },
      },
    })

     // Check if delete message was produced
    expect(components.producer.getLastProduced()).toEqual({
      topicName: 'entities',
      key: 'organization.deleted',
      data: {
        metadata: {
          timestamp: 100,
          author: { id: '1', name: 'author-name-todo' },
          operationId: 'op-id',
        },
        data: {
          organization: expect.objectContaining({
            id,
            name: 'organization 1',
          }),
        },
      },
    })
  })

  it('should return NotFound if organization does not exist', async () => {
    const { execute } = await getTestEnv<ITestComponents>(testComponentMap, schema)

    await expectError(execute({
      query: DELETE_ORGANIZATION_QUERY,
      variables: {
        id: 'xxx',
      },
      as: testUsers.editor,
    }), 'NotFound')
  })
})

describe('updating an organization', () => {
  beforeAll(async () => {
    await resetPrisma()
  })

  it('should fail if not authenticated or not authorized', async () => {
    const { execute } = await getTestEnv<ITestComponents>(testComponentMap, schema)

    const q = (as) => execute({
      query: UPDATE_ORGANIZATION_QUERY,
      variables: {
        id: 'does-not-matter',
        data: {
          name: 'new',
        },
      },
      as,
    })
    await expectError(q(testUsers.viewer), 'NotAuthorized')
    await expectError(q(testUsers.researcher), 'NotAuthorized')
    await expectError(q(testUsers.guest), 'NotAuthenticated')
  })

  it('should fail if not organization does not exist', async () => {
    const { execute } = await getTestEnv<ITestComponents>(testComponentMap, schema)

    const q = (as) => execute({
      query: UPDATE_ORGANIZATION_QUERY,
      variables: {
        id: 'xxx',
        data: {
          name: 'new',
        },
      },
      as,
    })
    await expectError(q(testUsers.editor), 'NotFound')
  })

  it ('should succeed if authorized and organization exist', async () => {
    const { execute, components } = await getTestEnv<ITestComponents>(testComponentMap, schema)

    const response = await execute({
      query: CREATE_ORGANIZATION_QUERY,
      as: testUsers.viewer,
    })

    const id = response.data.createOrganization.id

    const q = (as) => execute({
      query: UPDATE_ORGANIZATION_QUERY,
      variables: {
        id,
        data: {
          name: 'new',
          description: 'new desc',
        },
      },
      as,
    })

    expect(await q(testUsers.editor)).toEqual({
      data: {
        updateOrganization: {
          id,
          name: 'new',
        },
      },
    })

    expect(components.producer.getLastProduced()).toEqual({
      topicName: 'entities',
      key: 'organization.updated',
      data: {
        metadata: {
          timestamp: 0,
          author: { id: '1', name: 'author-name-todo' },
          operationId: 'op-id',
        },
        data: {
         updated: {
           organization: expect.objectContaining({
             id,
             name: 'new',
            }),
          },
         old: {
            organization: expect.objectContaining({
              id,
              description: 'org desc',
            }),
          },
        },
      },
    })
  })
})

describe('Querying an organization', () => {
  it('should fail if not authenticated', async () => {
    const { execute } = await getTestEnv<ITestComponents>(testComponentMap, schema)

    const q = (as) => execute({
      query: GET_ORGANIZATION_QUERY,
      as,
      variables: {
        id: 'does-not-matter',
      },
    })

    await expectError(q(testUsers.guest), 'NotAuthenticated')
  })

  it('should return null if organization does not exist', async () => {
    const { execute } = await getTestEnv<ITestComponents>(testComponentMap, schema)

    const q = (as) => execute({
      query: GET_ORGANIZATION_QUERY,
      as,
      variables: {
        id: 'does-not-exist',
      },
    })

    expect(await q(testUsers.viewer)).toEqual({
      data: {
        organization: null,
      },
    })
  })

  it('should succeed if authenticated and organization exists', async () => {
    const { execute } = await getTestEnv<ITestComponents>(testComponentMap, schema)

    const response = await execute({
      query: CREATE_ORGANIZATION_QUERY,
      as: testUsers.viewer,
    })

    const id = response.data.createOrganization.id

    const q = (as) => execute({
      query: GET_ORGANIZATION_QUERY,
      as,
      variables: {
        id,
      },
    })

    expect(await q(testUsers.viewer)).toEqual({
      data: {
        organization: expect.objectContaining({
          name: 'organization 1',
          id,
        }),
      },
    })
  })
})
