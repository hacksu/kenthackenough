import { makeExecutableSchema, mergeSchemas } from '@graphql-tools/schema';
import * as typescriptPlugin from '@graphql-codegen/typescript';
import { loadFiles } from '@graphql-tools/load-files';
import { mergeTypeDefs } from '@graphql-tools/merge';
import { print, printSchema, parse } from 'graphql';
import { codegen } from '@graphql-codegen/core';
import { promises as fsp } from 'fs';
import { mergeWith } from 'lodash/object';

/** GraphQL Schema Importer
 * Imports all .graphql files and creates typescript type definitions.
 * 
 * compileSchema({ ...graphql-tools makeExecutableSchema options }) can be passed in to
 * provide resolvers and additional configuration.
 * 
 * This file is meant to be able to run on its own via `npm run gql` to compile
 * graphql into typescript type definitions, thus why it doesn't import anything that
 * isnt absolutely necessary to convert graphql to typescript types.
 * 
 * Types are exported to "types.ts" within this file's directory.
 * 
 * Additionally, `GraphQLSchema` is exported from this file.
 * This export is auto-populated with a promise that resolves the
 * merged GraphQL schema (so it could be injected into, for example, apollo server)
 * 
 */


let schemaReady;
export let GraphQLSchema = new Promise(function(resolve) { schemaReady = resolve; });



interface CompileSchemaParams {
    resolvers?: any;
}

export async function compileSchema(cfg: CompileSchemaParams = {}) {
    let resolvers = cfg?.resolvers;
    if (resolvers && resolvers instanceof Promise) resolvers = await resolvers;
    const typeDefs = mergeTypeDefs(
        await loadFiles(__dirname + '/../**/*.graphql'), { commentDescriptions: true }
    );
    if (!typeDefs) return;
    const typeFile = __dirname + '/types.ts';
    const schema = makeExecutableSchema(mergeWith({
        typeDefs,
        parseOptions: {
            commentDescriptions: true,
        },
        resolverValidationOptions: {
            requireResolversToMatchSchema: ('resolvers' in cfg ? 'error' : 'ignore'),
        }
    }, cfg));
    if (__filename.includes('.ts')) {
        const interfaces = await codegen({
            documents: [],
            config: {
    
            },
            filename: typeFile,
            schema: parse(printSchema(schema)),
            plugins: [{ typescript: {} }],
            pluginMap: {
                typescript: typescriptPlugin,
            }
        })
        await fsp.writeFile(typeFile, `// THIS FILE IS AUTO-GENERATED, DO NOT MODIFY\n` + interfaces);
    }
    GraphQLSchema = new Promise(resolve => {
        resolve(schema);
    })
    if (schemaReady) {
        schemaReady(schema);
        schemaReady = false;
    }
    return schema;
}


// compile types by running `npm run gql`
if (process.argv[1].includes('src/graphql/schema')) compileSchema();


