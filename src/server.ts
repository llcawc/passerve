import fs from 'node:fs/promises'
import { isAbsolute, join, relative, resolve, sep } from 'node:path'
import { cwd } from 'node:process'
import { styleText } from 'node:util'

import { H3, HTTPError, serve, serveStatic } from 'h3'

import { content } from './error.js'

type Args = {
  port: number
  dist: string
  e404: string
}

type ServerInstance = ReturnType<typeof serve>

const DEFAULTS: Args = {
  port: 3000,
  dist: join(cwd(), 'dist'),
  e404: '404.html',
}

const STATIC_SERVER_NAME = 'passerve'

function isValidPort(port: number): boolean {
  return Number.isInteger(port) && port >= 0 && port <= 65535
}

function isInside(root: string, path: string): boolean {
  const rel = relative(root, path)

  return rel === '' || (rel !== '..' && !rel.startsWith(`..${sep}`) && !isAbsolute(rel))
}

async function server(args: Partial<Args> = {}): Promise<ServerInstance> {
  const port = args.port ?? DEFAULTS.port
  const distAbs = resolve(args.dist ?? DEFAULTS.dist)
  const e404Path = resolve(distAbs, args.e404 ?? DEFAULTS.e404)

  if (!isValidPort(port)) {
    throw new RangeError(`Invalid port ${port}: expected an integer from 0 to 65535.`)
  }

  if (!isInside(distAbs, e404Path)) {
    throw new Error('Custom "Error 404" file must be inside dist folder')
  }

  const errorFilePath = await fs
    .stat(e404Path)
    .then((stat) => (stat.isFile() ? e404Path : null))
    .catch(() => null)

  const app = new H3()

  app.use((event, next) => {
    event.res.headers.set('Access-Control-Allow-Origin', '*')
    event.res.headers.set('Access-Control-Expose-Headers', 'Content-Length')
    event.res.headers.set('Access-Control-Allow-Headers', 'range')
    event.res.headers.set('X-Served-Static-By', STATIC_SERVER_NAME)

    return next()
  })

  // app.all('/**', async (event) => {
  //   const response = await serveStatic(event, {
  //     indexNames: ['/index.html'],

  //     getContents: (id) => {
  //       const path = resolve(distAbs, `.${id.startsWith('/') ? id : `/${id}`}`)

  //       if (!isInside(distAbs, path)) {
  //         return undefined
  //       }

  //       return fs.readFile(path).catch(() => undefined)
  //     },

  //     getMeta: async (id) => {
  //       const path = resolve(distAbs, `.${id.startsWith('/') ? id : `/${id}`}`)

  //       if (!isInside(distAbs, path)) {
  //         return undefined
  //       }

  //       const stat = await fs.stat(path).catch(() => null)

  //       if (!stat?.isFile()) {
  //         return undefined
  //       }

  //       return {
  //         size: stat.size,
  //         mtime: stat.mtimeMs,
  //       }
  //     },
  //   })

  //   if (response) {
  //     return response
  //   }

  //   const body = errorFilePath ? await fs.readFile(errorFilePath).catch(() => String(content)) : String(content)

  //   return new Response(event.req.method === 'HEAD' ? null : body, {
  //     status: 404,
  //     headers: {
  //       'Content-Type': 'text/html; charset=utf-8',
  //     },
  //   })
  // })

  app.all('/**', async (event) => {
    try {
      const response = await serveStatic(event, {
        indexNames: ['/index.html'],

        getContents: (id) => {
          const path = resolve(distAbs, `.${id.startsWith('/') ? id : `/${id}`}`)

          if (!isInside(distAbs, path)) {
            return undefined
          }

          return fs.readFile(path).catch(() => undefined)
        },

        getMeta: async (id) => {
          const path = resolve(distAbs, `.${id.startsWith('/') ? id : `/${id}`}`)

          if (!isInside(distAbs, path)) {
            return undefined
          }

          const stat = await fs.stat(path).catch(() => null)

          if (!stat?.isFile()) {
            return undefined
          }

          return {
            size: stat.size,
            mtime: stat.mtimeMs,
          }
        },
      })

      if (response) {
        return response
      }
    } catch (error) {
      // Перехватываем только 404 от serveStatic.
      // Остальные ошибки должны обрабатываться H3.
      if (!HTTPError.isError(error) || error.status !== 404) {
        throw error
      }
    }

    let body: string | Buffer = String(content)

    if (errorFilePath) {
      try {
        body = await fs.readFile(errorFilePath, 'utf8')
      } catch {
        // Если пользовательская страница недоступна,
        // используем встроенную HTML-страницу.
      }
    }

    return new Response(event.req.method === 'HEAD' ? null : body, {
      status: 404,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    })
  })

  const httpServer = serve(app, { port })

  await httpServer.ready()

  const serverUrlAdr = httpServer.url ?? `http://localhost:${port}`

  console.log(
    styleText('green', 'The server has been started successfully at:'),
    styleText('cyan', serverUrlAdr),
    styleText('magenta', '\nFolder for static files:'),
    styleText('gray', distAbs),
    styleText('magenta', '\nPage "Error 404":'),
    styleText('gray', errorFilePath ?? 'Used default page, because file "/404.html" not found.'),
  )

  return httpServer
}

export default server
export { type Args, type ServerInstance }
