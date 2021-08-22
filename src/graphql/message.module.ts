import { gql } from 'graphql'

export let typeDefs = gql`

type Query {
    hello: String @auth(requires: ADMIN)
}

`;

export const query = {
    hello() {
        return 'hi there!'
    }
}