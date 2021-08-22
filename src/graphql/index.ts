export * from './boilerplate'

// Import directives
import auth from './directives/auth'

const directives = {
    auth,
}


// Import Modules
import * as Message from './message.module'

const modules = {
    Message
}


// Export Apollo Server
import createApollo from './boilerplate'
export default createApollo({
    modules,
    directives,
    playground: true // apollo GUI when visiting /graphql
})