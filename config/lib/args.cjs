


// args parsing
const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')
const argv = yargs(hideBin(process.argv)).argv
exports.ENV = require('process').env;
exports.production = exports.ENV.NODE_ENV == 'production';
Object.assign(exports, argv);