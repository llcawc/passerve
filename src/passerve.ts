#!/usr/bin/env node
import process from 'node:process'

import chalk from 'chalk'
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

program.version(ver, '-v, --version', 'output the current version')

program
  .option('-p, --port <port>', 'server port number (default: 3000)', parsePort)
  .option('-d, --dist <value>', 'folder for serve files (default: dist)')
  .option('-e, --e404 <value>', 'filename for page "Error 404" (default: 404.html)')

const header = `
${chalk.magenta(`• passerve • ::.. version: ${ver}`) + chalk.gray('\nSimple static server for local development by pasmurno from llcawc\n')}`
program.addHelpText('before', header)

const example = `
${
  chalk.magenta('Example call:\n') +
  chalk.cyan('   $ passerve\n') +
  chalk.cyan('   $ passerve -p 4200 -d build -e error.html\n') +
  chalk.cyan("   $ npx passerve --port 8080 --dist './static'") +
  chalk.green('  // local use')
}`
program.addHelpText('after', example)

const footer = `
${
  chalk.gray('Сopyright ©2026 llcawc, MIT License. Made with ') +
  chalk.red('❤') +
  chalk.gray('  to beautiful architecture. \nSource: https://github.com/llcawc/passerve')
}
`
program.addHelpText('afterAll', footer)

program.parse(process.argv)
const options = program.opts<Partial<Args>>()

server(options)
  .then((appServe) => {
    const shutdown = (signal: NodeJS.Signals): void => {
      console.log(`\n${chalk.yellow(`Received ${signal}. Shutting down...`)}`)
      appServe.close(() => process.exit(0))
    }
    process.once('SIGINT', () => shutdown('SIGINT'))
    process.once('SIGTERM', () => shutdown('SIGTERM'))
  })
  .catch((error: unknown) => {
    const err = error as NodeJS.ErrnoException
    if (err?.code === 'EADDRINUSE') {
      console.error(chalk.red(`Cannot start the server: port ${options.port ?? 3000} is already in use.`))
    } else if (error instanceof RangeError) {
      console.error(chalk.red(error.message))
    } else {
      console.error(chalk.red('Failed to start the server:'), error)
    }
    process.exit(1)
  })
