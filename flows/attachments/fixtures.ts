import { System } from '@envisioning/common-core/components/system'
import { makeQueriableSchema } from '../../src/common-test/graphql'
import { ITestComponents, testComponentMap } from '../../src/system'
import { schema } from '../../src/graphql/schema'

export const CREATE_ATTACHMENT_QUERY = `mutation {
  createAttachment(data:{
    name:"atatchment 1 connected",
    description: "Attachment description",
    type:ARTICLE,
    kind:WEB,
    imageUrl:"http://www.imageUrl.com",
    url:"http://url.com",
  }) {
    id
    name
    description
    type
    kind
  }
}`

export const DELETE_ATTACHMENT_QUERY = `mutation deleteAttachment($id: ID!) {
  deleteAttachment(id:$id) {
    id
  }
}`

export const UPDATE_ATTACHMENT_QUERY = `mutation updateAttachment($id: ID!, $data: UpdateAttachment!) {
  updateAttachment(id: $id, data: $data) {
    id
    name
  }
}`

export const GET_ATTACHMENT_QUERY = `query getAttachment($id: ID!) {
  attachment(id: $id) {
    id
    name
    organizations {
      id
    }
    technologies {
      id
    }
    projects {
      id
    }
  }
}`

export const getTestEnv = async () => {
  const testSystem = new System<ITestComponents>(testComponentMap)
  const components = await testSystem.start()
  const execute = makeQueriableSchema(schema, components)
  return {
    execute,
    components,
  }
}
