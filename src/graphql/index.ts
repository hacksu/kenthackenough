import { createApolloExpress } from './apollo';
import { compileSchema } from './schema';

const resolvers = {
    Query: {
        
    }
}

export const apollo = createApolloExpress({
    // @ts-ignore
    schema: compileSchema({ resolvers }),
})