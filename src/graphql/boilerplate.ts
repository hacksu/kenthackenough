export * from '../../node_modules/graphql'
import { gql as _gql } from 'apollo-server-express'
import { print } from 'graphql'

export let Directives = '';
export function directiveImported(typeDefs) {
    Directives += print(typeDefs)
}
export function gql(str: any) {
    str[0] = Directives + str[0];
    return _gql(str)
}


import { createApolloMiddleware } from "./apollo";
export default ((config) => (app) => {
    return createApolloMiddleware(app, config)
})