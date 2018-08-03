import { createApolloFetch } from 'apollo-fetch'
import { graphql } from 'graphql'
import { makeFormatError } from '@envisioning/common-graphql/errors/format-error'
import { IAccount } from '@envisioning/common-core/auth'
import { IContext } from '../graphql/schema'
import { System } from '@envisioning/common-core/components/system'

const extractFirstErrorCode = (errors: any) => errors && errors[0].code

type ThrowableApolloFetch = (params: {
  query: string,
  variables: object,
  dataExtractor: (data: any) => any,
}) => Promise<any>
export const createThrowableApolloFetch = ({ uri }): ThrowableApolloFetch => {
  const apolloFetch = createApolloFetch({ uri })
  return ({
    query,
    variables,
    dataExtractor,
  }) => apolloFetch({
    query,
    variables,
  }).then((response) => {
    if (response.errors) {
      const code = extractFirstErrorCode(response.errors)
      throw new Error(code)
    }
    return dataExtractor(response)
  })
}

export type QueryOnSchema = (opts: IQueryOnSchemaOptions) => any

export interface IQueryOnSchemaOptions {
  query: string,
  variables?: any,
  as?: IAccount,
  dataExtractor?: (response: any) => any,
}
export const makeQueriableSchema = (schema, components) => async ({
  query,
  variables,
  as,
  dataExtractor,
}: IQueryOnSchemaOptions) => {
  const formatError = makeFormatError()

  const ctx: IContext = {
    operationId: 'op-id',
    components,
    account: as,
  }
  const response = await graphql(schema, query, {}, ctx, variables)
  if (response.errors) {
    const formattedErrors = response.errors.map(formatError)
    const code = extractFirstErrorCode(formattedErrors)
    console.log(response.errors)
    throw new Error(code)
  }

  return dataExtractor ? dataExtractor(response) : response
}

export const getTestEnv = async <T>(componentMap, schema) => {
  const testSystem = new System<T>(componentMap)
  const components = await testSystem.start()
  const execute = makeQueriableSchema(schema, components)
  return {
    execute,
    components,
  }
}
