import { ApolloServer, Config, ExpressContext, ServerRegistration } from "apollo-server-express";

export type ApolloConfig = Config<ExpressContext> & ServerRegistration;

async function createApolloServer(config) {
    if (config.schema instanceof Promise) {
        config.schema = await config.schema;
    }
    const apollo = new ApolloServer(config)
    await apollo.start()
    return apollo
}

export async function createApolloMiddleware(app: any, config: ApolloConfig, config2: any = {}) {
    const apollo = await createApolloServer(config)
    apollo.applyMiddleware(Object.assign(config2, { app }))
    return apollo
}

export function createApolloExpress(config: ApolloConfig) {
    return function(app, config2={}) {
        return createApolloMiddleware(app, config, config2)
    }
}