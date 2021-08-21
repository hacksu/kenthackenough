import express from 'express';

const server = express();

server.listen(4000, () => console.log(`listening on http://localhost:4000/`))