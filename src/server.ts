import fs from 'node:fs/promises'
import http from 'node:http'
import { resolve, join, sep } from 'node:path'
import { cwd } from 'node:process'

import chalk from 'chalk'
import express from 'express'

import { content } from './error.js'

type Args = { port: number; dist: string; e404: string }

const base = cwd()

const PORT_MIN = 0
const PORT_MAX = 65535

const STATIC_SERVER_NAME = 'passerve'

const DEFAULTS: Args = {
  port: 3000,
  dist: join(base, 'dist'),
  e404: '404.html',
}

function isValidPort(port: number): boolean {
  return Number.isInteger(port) && port >= PORT_MIN && port <= PORT_MAX
}

/**
 * Creating a static file server
 * @param args - Optional parameters: server port, source file folder and file name for error 404
 * @type type Args = { port: number; dist: string; e404: string }
 * @returns The HTTP server instance; the promise resolves once the server is listening
 */
async function server(args: Partial<Args> = {}): Promise<http.Server> {
  const port = args.port ?? DEFAULTS.port
  const distAbs = resolve(args.dist ?? DEFAULTS.dist)
  const e404Name = args.e404 ?? DEFAULTS.e404

  if (!isValidPort(port)) {
    throw new RangeError(`Invalid port ${port}: expected an integer from 0 to 65535.`)
  }

  let errorFilePath: string | null = resolve(distAbs, e404Name) // path of the custom "Error 404" file
  if (!errorFilePath.startsWith(distAbs + sep)) {
    throw new Error('Custom "Error 404" file must be inside dist folder')
  }

  // Checking for the error file in the dist folder
  let hasE404: boolean = false // file '404.html' exists in the dist folder
  try {
    const st = await fs.stat(errorFilePath)
    hasE404 = st.isFile()
  } catch {
    errorFilePath = null
  }

  const app = express()

  app.use((_req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Expose-Headers', 'Content-Length')
    res.header('Access-Control-Allow-Headers', 'range')
    res.header('X-Served-Static-By', STATIC_SERVER_NAME)
    next()
  })

  // Serve static files
  app.use(express.static(distAbs))

  // All other requests get the "Error 404" page
  app.use((_req, res) => {
    if (hasE404 && errorFilePath) {
      res.status(404).sendFile(errorFilePath, (err) => {
        if (err) {
          console.error('404 file error:', err)
          res.status(500).send('Error loading 404 page')
        }
      })
    } else {
      // content — html string
      res.status(404).type('html').send(String(content))
    }
  })

  const httpServer = http.createServer(app)

  await new Promise<void>((ok, fail) => {
    const onError = (err: Error) => {
      httpServer.off('listening', onListening)
      fail(err)
    }
    const onListening = () => {
      httpServer.off('error', onError)
      ok()
    }
    httpServer.once('error', onError)
    httpServer.once('listening', onListening)
    httpServer.listen(port)
  })

  const addr = httpServer.address()
  const actualPort = typeof addr === 'object' && addr ? addr.port : port
  const url = `http://localhost${actualPort === 80 ? '' : `:${actualPort}`}/`

  console.log(
    chalk.green('The server has been started successfully at:'),
    chalk.cyan(url),
    chalk.magenta(`\nFolder for static files:`),
    chalk.gray(distAbs),
    chalk.magenta('\nPage "Error 404":'),
    chalk.gray(hasE404 ? errorFilePath : 'Used default page, because file "/404.html" not found.'),
  )

  return httpServer
}

// export
export default server
export { type Args }
