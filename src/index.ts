import express from 'express';
import { apollo } from '@graphql';

const server = express()
apollo(server, {
    path: '/api/graphql'
})

server.get('/api', (req, res) => res.send('hi there3'))

server.listen(process.env?.NODE_ENV == 'production' ? 80 : 3080);

import './components/email';