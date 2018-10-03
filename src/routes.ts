import { IComponents } from './system'
import * as gitController from './git/controller'
import * as express from 'express'
import * as bodyParser from 'body-parser'
import * as cors from 'cors'
import { asyncHandler } from './common/async'
import { version } from './common/pkg'

export interface IRequest extends express.Request {
  components: IComponents
}

export const routes = express.Router()

routes.use(bodyParser.json())
routes.use(cors())

/**
 * GET /api/version
 */
routes.get('/api/version', (req, res) => {
  res.json({
    version,
  })
})

/**
 * Creates a repo
 * POST /api/repo
 */
routes.post('/api/repo', asyncHandler(async (req: IRequest, res, next) => {
  const {
    name,
  } = req.body
  await gitController.newRepo(name, req.components)

  res.json({
    name,
  })
}))

/**
 * Get repo info
 * GET /api/repo/:name
 */
routes.get('/api/repo/:name', asyncHandler(async (req: IRequest, res, next) => {
  const {
    name,
  } = req.params
  const repo = await gitController.getRepo(name, req.components)

  res.json(repo)
}))

/**
 * Deletes a repo
 * DELETE /api/repo/:name
 */
routes.delete('/api/repo/:name', asyncHandler(async (req: IRequest, res, next) => {
  const {
    name,
  } = req.params
  await gitController.deleteRepo(name, req.components)
  res.json({
    name,
  })
}))

routes.use((err, _, res, __) => {
  const status = err && err.output && err.output.statusCode || 500
  const payload = err && err.output && err.output.payload || {
    statusCode: status,
    error: 'Internal Server Error',
    message: err.toString(),
  }
  res.status(status).json(payload)
})
