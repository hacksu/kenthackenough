import { gql } from 'apollo-server-express'


export const ApolloServerConfig = {
    typeDefs: gql`
        type Query {
            hello: String
        }
    `,
    resolvers: {
        Query: {
            hello() {
                return 'why is this not updating'
            }
        }
    }
}