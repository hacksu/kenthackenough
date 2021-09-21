// path resolution for dist folder

const { basename } = require('path');
const { readFileSync } = require('fs')
const JSON5 = require('json5')
const tsConfig = JSON5.parse(readFileSync('./tsconfig.json', { encoding: 'utf8' }))
const tsConfigPaths = require('tsconfig-paths')

let { compilerOptions: { paths, outDir, rootDir, baseUrl } } = tsConfig;

const root = basename(rootDir);
const out = basename(outDir);
for (const key in paths) {
    paths[key] = paths[key].map(o => o.split(root).join(out))
}

tsConfigPaths.register({
    baseUrl,
    paths,
})