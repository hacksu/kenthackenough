import { gql } from 'apollo-server-micro'
import { Config } from 'apollo-server-micro'

export const ApolloServerConfig: Config = {
    typeDefs: gql`
        type Query {
            hello: String
        }
    `,
    resolvers: {
        Query: {
            hello() {
                return 'hi there!'
            }
        }
    }
}