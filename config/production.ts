// Object.assign(exports, require(__dirname + '/default'))
import { mongodb } from './default';
export * from './default';

mongodb.url = `mongodb://localhost:27017`;

// exports.mongo.url = 'mongodb://localhost:27017';


