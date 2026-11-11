import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import server, { type Args, type ServerInstance } from '../src/server.js'

describe('server', () => {
  let dist: string
  let instance: ServerInstance | undefined

  beforeEach(async () => {
    dist = await mkdtemp(join(tmpdir(), 'passerve-test-'))
    await writeFile(join(dist, 'index.html'), '<h1>Home</h1>')
    vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  afterEach(async () => {
    if (instance) {
      await instance.close()
      instance = undefined
    }

    await rm(dist, { recursive: true, force: true })
    vi.restoreAllMocks()
  })

  async function startServer(options: Partial<Args> = {}): Promise<ServerInstance> {
    instance = await server({ port: 0, dist, ...options })
    return instance
  }

  function getUrl(serverInstance: ServerInstance, path: string): URL {
    if (!serverInstance.url) {
      throw new Error('Server did not provide a URL')
    }

    return new URL(path, serverInstance.url)
  }

  it('serves the index and static files from the dist directory', async () => {
    await mkdir(join(dist, 'assets'))
    await writeFile(join(dist, 'assets', 'app.js'), 'console.log("hello")')
    const runningServer = await startServer()

    const indexResponse = await fetch(getUrl(runningServer, '/'))
    expect(indexResponse.status).toBe(200)
    expect(await indexResponse.text()).toContain('<h1>Home</h1>')

    const assetResponse = await fetch(getUrl(runningServer, '/assets/app.js'))
    expect(assetResponse.status).toBe(200)
    expect(await assetResponse.text()).toBe('console.log("hello")')
  })

  it('adds the expected CORS and server headers to successful responses', async () => {
    const runningServer = await startServer()
    const response = await fetch(getUrl(runningServer, '/'))

    expect(response.headers.get('access-control-allow-origin')).toBe('*')
    expect(response.headers.get('access-control-allow-headers')).toBe('range, content-type')
    expect(response.headers.get('access-control-allow-methods')).toBe('GET, HEAD, OPTIONS')
    expect(response.headers.get('access-control-expose-headers')).toBe('Content-Length')
    expect(response.headers.get('access-control-max-age')).toBe('600')
    expect(response.headers.get('cache-control')).toBe('no-cache')
    expect(response.headers.get('x-served-static-by')).toBe('passerve')
  })

  it('answers a CORS preflight OPTIONS request with 204 and CORS headers', async () => {
    const runningServer = await startServer()
    const response = await fetch(getUrl(runningServer, '/'), {
      method: 'OPTIONS',
      headers: { 'Access-Control-Request-Method': 'GET' },
    })

    expect(response.status).toBe(204)
    expect(response.headers.get('access-control-allow-origin')).toBe('*')
    expect(response.headers.get('access-control-allow-methods')).toBe('GET, HEAD, OPTIONS')
  })

  it('keeps CORS headers on 404 error responses', async () => {
    const runningServer = await startServer()
    const response = await fetch(getUrl(runningServer, '/missing'))

    expect(response.status).toBe(404)
    expect(response.headers.get('access-control-allow-origin')).toBe('*')
    expect(response.headers.get('access-control-allow-headers')).toBe('range, content-type')
    expect(response.headers.get('access-control-allow-methods')).toBe('GET, HEAD, OPTIONS')
  })

  it('returns the built-in HTML page for missing files by default', async () => {
    const runningServer = await startServer()
    const response = await fetch(getUrl(runningServer, '/missing'))

    expect(response.status).toBe(404)
    expect(response.headers.get('content-type')).toContain('text/html')
    expect(await response.text()).toContain('Error 404')
  })

  it('serves the configured custom 404 page for missing files', async () => {
    await mkdir(join(dist, 'errors'))
    await writeFile(join(dist, 'errors', 'not-found.html'), '<h1>Custom not found</h1>')
    const runningServer = await startServer({ e404: 'errors/not-found.html' })
    const response = await fetch(getUrl(runningServer, '/missing'))

    expect(response.status).toBe(404)
    expect(await response.text()).toBe('<h1>Custom not found</h1>')
  })

  it('returns an empty body for HEAD requests to missing files', async () => {
    const runningServer = await startServer()
    const response = await fetch(getUrl(runningServer, '/missing'), { method: 'HEAD' })

    expect(response.status).toBe(404)
    expect(await response.text()).toBe('')
  })

  it.each([-1, 65536, 1.5, Number.NaN])('rejects invalid port %s', async (port) => {
    await expect(server({ port, dist })).rejects.toThrow(RangeError)
  })

  it('rejects a custom 404 file path outside the dist directory', async () => {
    const outsidePath = resolve(dist, '..', 'outside-404.html')

    await expect(server({ port: 0, dist, e404: outsidePath })).rejects.toThrow(
      'Custom "Error 404" file must be inside dist folder',
    )
  })
})
