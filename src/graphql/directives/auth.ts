import { mapSchema, getDirective, MapperKind } from "@graphql-tools/utils";
import { defaultFieldResolver, GraphQLSchema, print } from "graphql";
import { gql, directiveImported } from 'graphql';

export const typeDefs = gql`

directive @auth(requires: Role = ADMIN) on OBJECT | FIELD_DEFINITION

enum Role {
    ADMIN
    REVIEWER
    USER
}

`

directiveImported(typeDefs)

export default function auth(schema: GraphQLSchema, directiveName: string) {
    return mapSchema(schema, {
        // @ts-ignore
        [MapperKind.OBJECT_FIELD]: (fieldConfig) => {
            const directive = getDirective(schema, fieldConfig, directiveName)?.[0];
            if (directive) {
                const { resolve = defaultFieldResolver } = fieldConfig
                fieldConfig.resolve = async function(source: any, args: any, context: any, info: any) {
                    const result = await resolve(source, args, context, info)
                    // do directive logic and maybe return something else instead
                    if (context.role == directive.requires) {
                        return result
                    }
                    return null
                }
            }
        }
    })
}