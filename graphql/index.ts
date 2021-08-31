import { gql, Config } from 'apollo-server-micro'
import { makeExecutableSchema } from '@graphql-tools/schema';
import { typeDefs as ScalarTypeDefs, resolvers as ScalarResolvers } from 'graphql-scalars';

// export const ApolloServerConfig: Config = {
//     typeDefs: gql`
//         type Query {
//             hello: String
//         }
//     `,
//     resolvers: {
//         Query: {
//             hello() {
//                 return 'hi there!'
//             }
//         }
//     }
// }

let phone = '+12261234567';

export const ApolloServerConfig: Config = {
    schema: makeExecutableSchema({
        typeDefs: [
            ...ScalarTypeDefs,
            gql`
                scalar PhoneNumber

                type Query {
                    hello: String
                    phone: PhoneNumber
                }

                type Mutation {
                    updatePhone(to: PhoneNumber): PhoneNumber
                }
            `,

        ],
        resolvers: {
            ...ScalarResolvers,
            Query: {
                hello() {
                    return "hi there!"
                },
                phone() {
                    return phone
                }
            },
            Mutation: {
                updatePhone(_, { to }) {
                    phone = to;
                    return phone;
                }
            }
        },
        parseOptions: {
            commentDescriptions: true,
        }
    })
}