Object.assign(exports, require(__dirname + '/lib/args.cjs'));
Object.assign(exports, require(__dirname + '/lib/paths.cjs'));
try {
    Object.assign(exports, require(__dirname + '/secrets.cjs'));
} catch(e) {
    throw new Error(`Create secrets.cjs within config directory!`)
}

const path = require('path');
const __data = exports.ENV?.DATA_DIR || path.join(process.cwd(), 'docker/data/api');

exports.paths = {
    '/temp': path.join(__data, '/temp'),
    '/storage': path.join(__data, '/storage'),
    '/resumes': path.join(__data, '/storage', 'resumes'),
}

if (exports.ENV?.DATA_DIR) {
    exports.paths['/wat'] = path.join(__data, 'wat')
}

exports.mongodb = {
    url: exports.ENV.MONGODB_HOST || 'mongodb://localhost:27020',
    database: 'khe-20xx'
}

exports.redis = {
    url: exports.ENV.REDIS_HOST || 'redis://localhost:6379',
}