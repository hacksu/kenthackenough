import { mergeTypeDefs } from "@graphql-tools/merge";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { ApolloServer } from "apollo-server-express";
import { GraphQLSchema } from "graphql";
import { DocumentNode } from "graphql";


export interface ApolloModule {
    typeDefs?: DocumentNode | string;
    query?: {
        [key: string]: any;
    };
    mutation?: {
        [key: string]: any;
    };
    [key: string]: any;
}

export interface ApolloDirective {
    (schema: GraphQLSchema, directiveName: string): GraphQLSchema;
    typeDefs?: DocumentNode | string;
    [key: string]: any;
}
export interface ApolloConfiguration {
    modules?: {
        [key: string]: ApolloModule;
    };
    directives?: {
        [key: string]: ApolloDirective;
    };
    playground?: boolean;
    [key: string]: any;
}


export async function createApolloServer(config: ApolloConfiguration) {
    const { modules, directives } = config;
    let typeDefs = Object.values(directives || []).map((o: any) => o.typeDefs); // preload typeDefs with directive schemas
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
    let config2: any = Object.assign({
        schema
    }, config)
    delete config2.directives;
    delete config2.modules;
    const apollo = new ApolloServer(config2)
    await apollo.start()
    return apollo
}

export async function createApolloMiddleware(app: any, config: ApolloConfiguration) {
    config = Object.assign({
        modules: {},
        directives: {},
    }, config)
    const apollo = await createApolloServer(config)
    apollo.applyMiddleware({ app })
    return apollo
}

export default createApolloMiddleware;