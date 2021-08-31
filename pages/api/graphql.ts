import { ApolloServer } from 'apollo-server-micro';
import { ApolloServerConfig } from '../../graphql';

// Apollo Development Server

// This will not be accessible in production, as khe.io/api will be binded to the backend via NGINX routing

const apollo = new ApolloServer({
    ...ApolloServerConfig,
})

export const config = {
    api: {
        bodyParser: false
    }
}

const handler = apollo.start().then(() => apollo.createHandler({
    path: '/api/graphql'
}))

export default async function(req: any, res: any) {
    res.setHeader('Access-Control-Allow-Origin', 'https://studio.apollographql.com')
    res.setHeader('Access-Control-Allow-Headers', 'content-type')
    if (req.method == 'OPTIONS') {
        return res.send(200, 'ok')
    }
    return (await handler)(req, res)
}