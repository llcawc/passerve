import { constants } from 'fs'
import fs from 'node:fs/promises'
import http from 'node:http'
import { resolve, join } from 'node:path'

import colors from 'colors/safe.js'
import express from 'express'

import { content } from './error.js'

type Args = { port: number; dist: string; e404: string }

const __dirname = resolve()
const app = express()
const appServe = http.createServer(app)

/**
 * Creating a Static file server
 * @param args - Optional parameters: server port, source file folder and file name for error 404
 * @type type Args = { port: number; dist: string; e404: string }
 */
async function server(args: Args = { port: 3000, dist: join(__dirname, 'dist'), e404: '404.html' }): Promise<void> {
  const port = args.port ?? 3000
  const dist = args.dist ?? join(__dirname, 'dist')
  const e404 = args.e404 ?? '404.html'

  let isE404: boolean = false // file '404.html' is out in dist folder
  let nameErr: string = resolve(__dirname, dist, e404) // true name file Error404

  // Checking for the error's file in the dist folder
  try {
    await fs.access(nameErr, constants.F_OK)
    isE404 = true
  } catch {
    nameErr = `Used default page, because file "/404.html" not found.`
  }

  app.use((_req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Expose-Headers', 'Content-Length')
    res.header('Access-Control-Allow-Headers', 'range')
    res.header('X-Served-Static-By', 'passerve')
    next()
  })

  // Server static files
  app.use(express.static(dist))

  // All other send page Error 404
  app.use((_req, res) => {
    if (isE404) {
      res.status(404).sendFile(resolve(__dirname, dist, e404))
    } else {
      res.status(404).send(content)
    }
  })

  appServe.listen(port, () => {
    console.log(
      colors.green('The server has been started successfully at:'),
      colors.cyan(`http://localhost${port === 80 ? '' : `:${port}`}/`),
      colors.magenta(`\nFolder for static files:`),
      colors.gray(resolve(__dirname, dist)),
      colors.magenta('\nPage "Error 404":'),
      colors.gray(nameErr),
    )
  })
}

// export
export default server
export { type Args }
