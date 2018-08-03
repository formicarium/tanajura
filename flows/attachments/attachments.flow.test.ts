import { IMessageAuthor } from '@envisioning/common-schemata/messages/message'
import { resetPrisma, seedPrisma, deployPrisma } from '../../src/common-test/prisma'
import { getTestEnv, CREATE_ATTACHMENT_QUERY, DELETE_ATTACHMENT_QUERY, UPDATE_ATTACHMENT_QUERY, GET_ATTACHMENT_QUERY } from './fixtures'
import { testUsers } from '../../src/common-test/fixtures'
import { attachmentsSeed } from './seed/seed'

jest.setTimeout(30000)

const expectError = (promise, expectedError) => {
  return expect(promise).rejects.toThrowError(expectedError)
}

beforeAll(async () => {
  await deployPrisma()
})

describe('Creates an attachment', () => {
  beforeAll(async () => {
    await resetPrisma()
  })
  it('should succeed if authenticated', async () => {
    const { components, execute } = await getTestEnv()

    // Mock clock response
    components.clock.setTimestamp(100)

    // Query against the schema
    await execute({
      query: CREATE_ATTACHMENT_QUERY,
      as: testUsers.viewer,
    })

    // Check if created message was produced
    expect(components.producer.getProduced()).toEqual([{
      topicName: 'entities',
      key: 'attachment.created',
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
          attachment: expect.objectContaining({
            id: expect.any(String),
            description: 'Attachment description',
            imageUrl: 'http://www.imageUrl.com',
            kind: 'WEB',
            name: 'atatchment 1 connected',
            type: 'ARTICLE',
            url: 'http://url.com',
            isPublic: true,
            allowACL: [],
            denyACL: [],
            updatedAt: expect.anything(),
            createdAt: expect.anything(),
          }),
        },
      },
    }])
  })

  it ('should fail if not authenticated', async () => {
    const { execute } = await getTestEnv()

    // Query against the schema
    await expectError(execute({
      query: CREATE_ATTACHMENT_QUERY,
    }), 'NotAuthenticated')
  })
})

describe('Deleting an attachment', async () => {
  beforeAll(async () => {
    await resetPrisma()
  })

  it('should fail if not authenticated or not authorized', async () => {
    const { components, execute } = await getTestEnv()
    seedPrisma(components.config.getConfig().prisma.endpoint, attachmentsSeed)
    // mockForDelete(components)

    const q = (as) => execute({
      query: DELETE_ATTACHMENT_QUERY,
      variables: {
        id: 'doest-not-matter',
      },
      as,
    })
    await expectError(q(testUsers.viewer), 'NotAuthorized')
    await expectError(q(testUsers.researcher), 'NotAuthorized')
    await expectError(q(testUsers.guest), 'NotAuthenticated')
  })

  it('should succeed if authorized and attachment exists', async () => {
    const { execute, components } = await getTestEnv()
    components.clock.setTimestamp(100)

    const response = await execute({
      query: CREATE_ATTACHMENT_QUERY,
      as: testUsers.viewer,
    })

    const id = response.data.createAttachment.id

    expect(await execute({
      query: DELETE_ATTACHMENT_QUERY,
      variables: {
        id,
      },
      as: testUsers.editor,
    })).toEqual({
      data: {
        deleteAttachment: {
          id,
        },
      },
    })

     // Check if delete message was produced
    expect(components.producer.getLastProduced()).toEqual({
      topicName: 'entities',
      key: 'attachment.deleted',
      data: {
        metadata: {
          timestamp: 100,
          author: { id: '1', name: 'author-name-todo' },
          operationId: 'op-id',
        },
        data: {
          attachment: expect.objectContaining({
            id,
            name: 'atatchment 1 connected',
          }),
        },
      },
    })
  })

  it('should return NotFound if attachment does not exist', async () => {
    const { execute } = await getTestEnv()

    await expectError(execute({
      query: DELETE_ATTACHMENT_QUERY,
      variables: {
        id: 'xxx',
      },
      as: testUsers.editor,
    }), 'NotFound')
  })
})

describe('updating an attachment', () => {
  beforeAll(async () => {
    await resetPrisma()
  })

  it('should fail if not authenticated or not authorized', async () => {
    const { execute } = await getTestEnv()

    const q = (as) => execute({
      query: UPDATE_ATTACHMENT_QUERY,
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

  it('should fail if not attachment does not exist', async () => {
    const { execute } = await getTestEnv()

    const q = (as) => execute({
      query: UPDATE_ATTACHMENT_QUERY,
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

  it ('should succeed if authorized and attachment exist', async () => {
    const { components, execute } = await getTestEnv()

    const response = await execute({
      query: CREATE_ATTACHMENT_QUERY,
      as: testUsers.viewer,
    })

    const id = response.data.createAttachment.id

    const q = (as) => execute({
      query: UPDATE_ATTACHMENT_QUERY,
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
        updateAttachment: {
          id,
          name: 'new',
        },
      },
    })

    expect(components.producer.getLastProduced()).toEqual({
      topicName: 'entities',
      key: 'attachment.updated',
      data: {
        metadata: {
          timestamp: 0,
          author: { id: '1', name: 'author-name-todo' },
          operationId: 'op-id',
        },
        data: {
         updated: {
           attachment: expect.objectContaining({
             id,
             name: 'new',
             description: 'new desc',
             type: 'ARTICLE',
             kind: 'WEB',
             imageUrl: 'http://www.imageUrl.com',
             url: 'http://url.com',
            }),
          },
         old: {
            attachment: expect.objectContaining({
              id,
              name: 'atatchment 1 connected',
              description: 'Attachment description',
              type: 'ARTICLE',
              kind: 'WEB',
              imageUrl: 'http://www.imageUrl.com',
              url: 'http://url.com',
            }),
          },
        },
      },
    })
  })
})

describe('Querying an attachmnet', () => {
  it('should fail if not authenticated', async () => {
    const { execute } = await getTestEnv()

    const q = (as) => execute({
      query: GET_ATTACHMENT_QUERY,
      as,
      variables: {
        id: 'does-not-matter',
      },
    })

    await expectError(q(testUsers.guest), 'NotAuthenticated')
  })

  it('should return null if attachment does not exist', async () => {
    const { execute } = await getTestEnv()

    const q = (as) => execute({
      query: GET_ATTACHMENT_QUERY,
      as,
      variables: {
        id: 'does-not-exist',
      },
    })

    expect(await q(testUsers.viewer)).toEqual({
      data: {
        attachment: null,
      },
    })
  })

  it('should succeed if authenticated and attachment exists', async () => {
    const { execute } = await getTestEnv()

    const response = await execute({
      query: CREATE_ATTACHMENT_QUERY,
      as: testUsers.viewer,
    })

    const id = response.data.createAttachment.id

    const q = (as) => execute({
      query: GET_ATTACHMENT_QUERY,
      as,
      variables: {
        id,
      },
    })

    expect(await q(testUsers.viewer)).toEqual({
      data: {
        attachment: expect.objectContaining({
          name: 'atatchment 1 connected',
          id,
        }),
      },
    })
  })
})
