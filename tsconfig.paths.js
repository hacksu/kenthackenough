// path resolution for dist folder

const { readFileSync } = require('fs')
const JSON5 = require('json5')
const tsConfig = JSON5.parse(readFileSync('./tsconfig.json', { encoding: 'utf8' }))
const tsConfigPaths = require('tsconfig-paths')

let { compilerOptions: { paths, outDir, rootDir, baseUrl } } = tsConfig;

for (const key in paths) {
    paths[key] = paths[key].map(o => o.split(rootDir).join(outDir))
}

tsConfigPaths.register({
    baseUrl,
    paths,
})