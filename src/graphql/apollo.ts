import { mergeTypeDefs } from "@graphql-tools/merge";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { ApolloServer } from "apollo-server-express";


export async function createApolloServer(config: any) {
    const { modules, directives } = config;
    let typeDefs = Object.values(directives).map((o: any) => o.typeDefs); // preload typeDefs with directive schemas
    let Query = {};
    let Mutation = {};
    for (const name in modules) {
        const module = modules[name]
        if ('typeDefs' in module) typeDefs.push(module.typeDefs); // add typeDefs to array
        if ('query' in module) Object.assign(Query, module.query); // import query resolvers
        if ('mutation' in module) Object.assign(Mutation, module.mutation); // import mutation resolvers
    }
    // @ts-ignore
    typeDefs = mergeTypeDefs(typeDefs) // merge all the typeDefs
    let resolvers = {
        Query,
    }
    if (Object.keys(Mutation).length > 0) Object.assign(resolvers, { Mutation });
    let schema = makeExecutableSchema({ // create executable schema so directives may be applied
        typeDefs,
        resolvers
    })
    for (const name in directives) {
        schema = directives[name](schema, name) // apply directive with the given name to the schema
        // directives are just functions, and one can alias them by giving them a name via the function's key
        // example directives: {
        //   upperCase: directiveToUpperCase
        //   upper: directiveToUpperCase
        // }
    }
    config = Object.assign({
        schema
    }, config)
    delete config.directives;
    delete config.modules;
    const apollo = new ApolloServer(config)
    await apollo.start()
    return apollo
}

export async function createApolloMiddleware(app: any, config) {
    config = Object.assign({
        modules: {},
        directives: {},
    }, config)
    const apollo = await createApolloServer(config)
    apollo.applyMiddleware({ app })
    return apollo
}

export default createApolloMiddleware;