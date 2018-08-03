// import Technology from '../technologies/type-defs'
// import gql from 'graphql-tag'
// import ProjectTypeDefs from '../projects/type-defs'

// const UserTypeDefs = gql`
// type User{
// 	id: ID!
// 	username: String!
// 	firstName: String!
// 	lastName: String!
// 	email: String!
// 	projects: [Project!]!
// }

// input CreateUserInput {
// 	accountId: String!
// 	username: String!
// 	firstName: String!
// 	lastName: String!
// 	email: String!
// }

// type CreateUserPayload {
// 	user: User!
// }

// extend type Query {
// 	user (id: ID!): User
// 	viewer: User
// }

// extend type Mutation {
// 	createUser(input: CreateUserInput!): CreateUserPayload!
// }
// `

// export default () => [ProjectTypeDefs, UserTypeDefs]
