import { IComponents } from './system'
import { newRepo } from './git/controller'
import * as express from 'express'
import * as bodyParser from 'body-parser'
import * as cors from 'cors'

export interface IRequest extends express.Request {
  components: IComponents
}

export const routes = express.Router()

routes.use(bodyParser.json())
routes.use(cors())

routes.get('/health', (req, res) => {
  res.json({
    ok: 'ok',
  })
})

routes.post('/api/repo', async (req: IRequest, res, next) => {
  console.log(req.body)
  const {
    name,
  } = req.body
  try {
    await newRepo(name, req.components)
    res.json({
      name,
    })
  } catch (err) {
    next(err)
  }
})

routes.use((err, req, res, next) => {
  console.log(err)
  res.status(500).json({
    error: true,
  })
})
