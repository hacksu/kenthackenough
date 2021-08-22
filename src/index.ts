import express from 'express';
import apollo from './graphql';

const server = express();
apollo(server); // graphql

server.listen(4000, () => console.log(`listening on http://localhost:4000/`))