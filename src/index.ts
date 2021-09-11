import express from 'express'

const app = express()

app.get('/api', (req, res) => res.send('hi there3'))

app.listen(process.env.NODE_ENV == 'production' ? 80 : 3079);