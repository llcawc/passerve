#!/usr/bin/env node
import process, { cwd } from "node:process";
import chalk from "chalk";
import { Command, InvalidArgumentError } from "commander";
import fs from "node:fs/promises";
import http from "node:http";
import { join, resolve, sep } from "node:path";
import express from "express";
// package.json
var version = "1.2.0";
// src/error.ts
const content = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Error 404</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    :root { color-scheme: light dark; }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      min-height: 100svh;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
      background-color: var(--bg);
      color: var(--fg);
    }
    @media (prefers-color-scheme: light) {
      :root { --bg: #ffffff; --fg: #1d1d1f; --accent: #0076d1; }
    }
    @media (prefers-color-scheme: dark) {
      :root { --bg: #1c1d21; --fg: #e5e5e7; --accent: #42adff; }
    }
    .box { display: flex; gap: 1.25rem; align-items: center; padding: 1.5rem; }
    .icon { width: 48px; height: 48px; flex-shrink: 0; }
    h1 { margin: 0 0 .35rem; font-size: 1.5rem; }
    p { margin: 0 0 1rem; opacity: .75; }
    .btn {
      display: inline-block;
      padding: .5rem 1.1rem;
      border-radius: .4rem;
      text-decoration: none;
      font-weight: 600;
      color: #ffffff;
      background-color: var(--accent);
    }
    .btn:hover { opacity: .85; }
  </style>
</head>
<body>
  <main class="box">
    <svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2M8 1.918l-.797.161A4 4 0 0 0 4 6c0 .628-.134 2.197-.459 3.742-.16.767-.376 1.566-.663 2.258h10.244c-.287-.692-.502-1.49-.663-2.258C12.134 8.197 12 6.628 12 6a4 4 0 0 0-3.203-3.92zM14.22 12c.223.447.481.801.78 1H1c.299-.199.557-.553.78-1C2.68 10.2 3 6.88 3 6c0-2.42 1.72-4.44 4.005-4.901a1 1 0 1 1 1.99 0A5 5 0 0 1 13 6c0 .88.32 4.2 1.22 6"/>
    </svg>
    <div>
      <h1>Error 404!</h1>
      <p>Page not found!</p>
      <a class="btn" href="/">home</a>
    </div>
  </main>
</body>
</html>
`;
// src/server.ts
const base = cwd();
const PORT_MIN = 0;
const PORT_MAX = 65535;
const STATIC_SERVER_NAME = "passerve";
const DEFAULTS = {
	port: 3e3,
	dist: join(base, "dist"),
	e404: "404.html"
};
function isValidPort(port) {
	return Number.isInteger(port) && port >= PORT_MIN && port <= PORT_MAX;
}
/**
* Creating a static file server
* @param args - Optional parameters: server port, source file folder and file name for error 404
* @type type Args = { port: number; dist: string; e404: string }
* @returns The HTTP server instance; the promise resolves once the server is listening
*/
async function server(args = {}) {
	const port = args.port ?? DEFAULTS.port;
	const distAbs = resolve(args.dist ?? DEFAULTS.dist);
	const e404Name = args.e404 ?? DEFAULTS.e404;
	if (!isValidPort(port)) throw new RangeError(`Invalid port ${port}: expected an integer from 0 to 65535.`);
	let errorFilePath = resolve(distAbs, e404Name);
	if (!errorFilePath.startsWith(distAbs + sep)) throw new Error("Custom \"Error 404\" file must be inside dist folder");
	let hasE404 = false;
	try {
		hasE404 = (await fs.stat(errorFilePath)).isFile();
	} catch {
		errorFilePath = null;
	}
	const app = express();
	app.use((_req, res, next) => {
		res.header("Access-Control-Allow-Origin", "*");
		res.header("Access-Control-Expose-Headers", "Content-Length");
		res.header("Access-Control-Allow-Headers", "range");
		res.header("X-Served-Static-By", STATIC_SERVER_NAME);
		next();
	});
	app.use(express.static(distAbs));
	app.use((_req, res) => {
		if (hasE404 && errorFilePath) res.status(404).sendFile(errorFilePath, (err) => {
			if (err) {
				console.error("404 file error:", err);
				res.status(500).send("Error loading 404 page");
			}
		});
		else res.status(404).type("html").send(String(content));
	});
	const httpServer = http.createServer(app);
	await new Promise((ok, fail) => {
		const onError = (err) => {
			httpServer.off("listening", onListening);
			fail(err);
		};
		const onListening = () => {
			httpServer.off("error", onError);
			ok();
		};
		httpServer.once("error", onError);
		httpServer.once("listening", onListening);
		httpServer.listen(port);
	});
	const addr = httpServer.address();
	const actualPort = typeof addr === "object" && addr ? addr.port : port;
	const url = `http://localhost${actualPort === 80 ? "" : `:${actualPort}`}/`;
	console.log(chalk.green("The server has been started successfully at:"), chalk.cyan(url), chalk.magenta(`\nFolder for static files:`), chalk.gray(distAbs), chalk.magenta("\nPage \"Error 404\":"), chalk.gray(hasE404 ? errorFilePath : "Used default page, because file \"/404.html\" not found."));
	return httpServer;
}
// src/passerve.ts
const program = new Command();
const ver = version;
function parsePort(value) {
	const port = Number(value);
	if (!Number.isInteger(port) || port < 0 || port > 65535) throw new InvalidArgumentError(`invalid port "${value}", expected an integer from 0 to 65535`);
	return port;
}
program.version(ver, "-v, --version", "output the current version");
program.option("-p, --port <port>", "server port number (default: 3000)", parsePort).option("-d, --dist <value>", "folder for serve files (default: dist)").option("-e, --e404 <value>", "filename for page \"Error 404\" (default: 404.html)");
const header = `
${chalk.magenta(`• passerve • ::.. version: ${ver}`) + chalk.gray("\nSimple static server for local development by pasmurno from llcawc\n")}`;
program.addHelpText("before", header);
const example = `
${chalk.magenta("Example call:\n") + chalk.cyan("   $ passerve\n") + chalk.cyan("   $ passerve -p 4200 -d build -e error.html\n") + chalk.cyan("   $ npx passerve --port 8080 --dist './static'") + chalk.green("  // local use")}`;
program.addHelpText("after", example);
const footer = `
${chalk.gray("Сopyright ©2026 llcawc, MIT License. Made with ") + chalk.red("❤") + chalk.gray("  to beautiful architecture. \nSource: https://github.com/llcawc/passerve")}
`;
program.addHelpText("afterAll", footer);
program.parse(process.argv);
const options = program.opts();
server(options).then((appServe) => {
	const shutdown = (signal) => {
		console.log(`\n${chalk.yellow(`Received ${signal}. Shutting down...`)}`);
		appServe.close(() => process.exit(0));
	};
	process.once("SIGINT", () => shutdown("SIGINT"));
	process.once("SIGTERM", () => shutdown("SIGTERM"));
}).catch((error) => {
	if (error?.code === "EADDRINUSE") console.error(chalk.red(`Cannot start the server: port ${options.port ?? 3e3} is already in use.`));
	else if (error instanceof RangeError) console.error(chalk.red(error.message));
	else console.error(chalk.red("Failed to start the server:"), error);
	process.exit(1);
});
export {};
