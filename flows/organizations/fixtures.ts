export const CREATE_ORGANIZATION_QUERY = `mutation {
  createOrganization(data:{
		name: "organization 1",
    description:"org desc",
    type:ACADEMIC,
  }) {
    id
    name
  }
}`

export const DELETE_ORGANIZATION_QUERY = `mutation deleteOrganization($id: ID!) {
  deleteOrganization(id:$id) {
    id
  }
}`

export const UPDATE_ORGANIZATION_QUERY = `mutation updateOrganization($id: ID!, $data: UpdateOrganization!) {
  updateOrganization(id: $id, data: $data) {
    id
    name
  }
}`

export const GET_ORGANIZATION_QUERY = `query getOrganization($id: ID!) {
  organization(id: $id) {
    id
    name
    description
    foundingYear
    headquarters
    type
    websiteUrl
    logoImageUrl
    createdAt
    updatedAt
    technologies {
      id
    }
    projects {
      id
    }
    attachments {
      id
    }
  }
}`
