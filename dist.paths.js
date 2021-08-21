// path resolution for dist folder

const { readFileSync } = require('fs')
const JSON5 = require('json5')
const tsConfig = JSON5.parse(readFileSync('./tsconfig.json', { encoding: 'utf8' }))
const tsConfigPaths = require('tsconfig-paths')

const { compilerOptions: { paths, outDir } } = tsConfig;

const baseUrl = outDir
tsConfigPaths.register({
    baseUrl,
    paths,
})