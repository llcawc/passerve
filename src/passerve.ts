#!/usr/bin/env node
import process from 'node:process'
import { styleText } from 'node:util'

import { Command, InvalidArgumentError } from 'commander'

import packageJson from '../package.json' with { type: 'json' }
import server, { type Args } from './server.js'

const program = new Command()

const ver = packageJson.version

function parsePort(value: string): number {
  const port = Number(value)

  if (!Number.isInteger(port) || port < 0 || port > 65535) {
    throw new InvalidArgumentError(`invalid port "${value}", expected an integer from 0 to 65535`)
  }

  return port
}

function getErrorCode(error: unknown): string | undefined {
  if (typeof error === 'object' && error !== null && 'code' in error && typeof error.code === 'string') {
    return error.code
  }

  return undefined
}

program.version(ver, '-v, --version', 'output the current version')

program
  .option('-p, --port <port>', 'server port number (default: 3000)', parsePort)
  .option('-d, --dist <value>', 'folder for serve files (default: dist)')
  .option('-e, --e404 <value>', 'filename for page "Error 404" (default: 404.html)')

const header = `
${styleText('magenta', `• passerve • ::.. version: ${ver}`) + styleText('gray', '\nSimple static server for local development by pasmurno from llcawc\n')}`

program.addHelpText('before', header)

const example = `
${
  styleText('magenta', 'Example call:\n') +
  styleText('cyan', '   $ passerve\n') +
  styleText('cyan', '   $ passerve -p 4200 -d build -e error.html\n') +
  styleText('cyan', "   $ npx passerve --port 8080 --dist './static'") +
  styleText('green', '  // local use')
}`

program.addHelpText('after', example)

const footer = `
${
  styleText('gray', 'Copyright ©2026 llcawc, MIT License. Made with ') +
  styleText('red', '❤') +
  styleText('gray', '  to beautiful architecture. \nSource: https://github.com/llcawc/passerve')
}
`

program.addHelpText('afterAll', footer)

program.parse(process.argv)

const options = program.opts<Partial<Args>>()

server(options)
  .then((appServe) => {
    let shuttingDown = false

    const shutdown = async (signal: NodeJS.Signals): Promise<void> => {
      if (shuttingDown) {
        return
      }

      shuttingDown = true

      console.log(`\n${styleText('yellow', `Received ${signal}. Shutting down...`)}`)

      try {
        await appServe.close()
        console.log(styleText('green', 'Server stopped successfully.'))
        process.exit(0)
      } catch (error) {
        console.error(styleText('red', 'Failed to stop the server:'), error)
        process.exitCode = 1
        process.exit(1)
      }
    }

    process.once('SIGINT', () => {
      void shutdown('SIGINT')
    })

    process.once('SIGTERM', () => {
      void shutdown('SIGTERM')
    })
  })
  .catch((error: unknown) => {
    if (getErrorCode(error) === 'EADDRINUSE') {
      console.error(styleText('red', `Cannot start the server: port ${options.port ?? 3000} is already in use.`))
    } else if (error instanceof RangeError) {
      console.error(styleText('red', error.message))
    } else {
      console.error(styleText('red', 'Failed to start the server:'), error)
    }

    process.exitCode = 1
  })
