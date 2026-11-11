#!/usr/bin/env node
import process from "node:process";
import { styleText } from "node:util";
import { Command, InvalidArgumentError } from "commander";
import fs from "node:fs/promises";
import { isAbsolute, relative, resolve, sep } from "node:path";
import { H3, HTTPError, serve, serveStatic } from "h3";
// package.json
var version = "1.3.1";
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
const DEFAULTS = {
	port: 3e3,
	dist: "dist",
	e404: "404.html"
};
const CORS_HEADERS = {
	"Access-Control-Allow-Origin": "*",
	"Access-Control-Allow-Headers": "range, content-type",
	"Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
	"Access-Control-Expose-Headers": "Content-Length",
	"Access-Control-Max-Age": "600",
	"Cache-Control": "no-cache"
};
const STATIC_SERVER_NAME = "passerve";
function isValidPort(port) {
	return Number.isInteger(port) && port >= 0 && port <= 65535;
}
function isInside(root, path) {
	const rel = relative(root, path);
	return rel === "" || rel !== ".." && !rel.startsWith(`..${sep}`) && !isAbsolute(rel);
}
async function server(args = {}) {
	const port = args.port ?? DEFAULTS.port;
	const distAbs = resolve(args.dist ?? DEFAULTS.dist);
	const e404Path = resolve(distAbs, args.e404 ?? DEFAULTS.e404);
	if (!isValidPort(port)) throw new RangeError(`Invalid port ${port}: expected an integer from 0 to 65535.`);
	if (!isInside(distAbs, e404Path)) throw new Error("Custom \"Error 404\" file must be inside dist folder");
	const errorFilePath = (await fs.stat(e404Path).catch(() => null))?.isFile() ? e404Path : null;
	if (args.e404 && !errorFilePath) console.warn(styleText("yellow", `Warning:`), `Custom 404 file "${args.e404}" not found or is not a file. Using default.`);
	const app = new H3();
	app.use(async (event, next) => {
		for (const [k, v] of Object.entries(CORS_HEADERS)) {
			event.res.headers.set(k, v);
			event.res.errHeaders?.set(k, v);
		}
		event.res.headers.set("X-Served-Static-By", STATIC_SERVER_NAME);
		if (event.req.method === "OPTIONS" && event.req.headers.has("Access-Control-Request-Method")) return new Response(null, { status: 204 });
		return next();
	});
	app.all("/**", async (event) => {
		try {
			const response = await serveStatic(event, {
				indexNames: ["/index.html"],
				getContents: (id) => {
					const path = resolve(distAbs, `.${id.startsWith("/") ? id : `/${id}`}`);
					if (!isInside(distAbs, path)) return;
					return fs.readFile(path).catch((err) => {
						if (err?.code === "ENOENT") return;
						throw err;
					});
				},
				getMeta: async (id) => {
					const path = resolve(distAbs, `.${id.startsWith("/") ? id : `/${id}`}`);
					if (!isInside(distAbs, path)) return;
					const stat = await fs.stat(path).catch(() => null);
					if (!stat?.isFile()) return;
					return {
						size: stat.size,
						mtime: stat.mtimeMs
					};
				}
			});
			if (response) return response;
		} catch (error) {
			if (!HTTPError.isError(error) || error.status !== 404) throw error;
		}
		let body = String(content);
		if (errorFilePath) try {
			body = await fs.readFile(errorFilePath, "utf8");
		} catch {}
		return new Response(event.req.method === "HEAD" ? null : body, {
			status: 404,
			headers: { "Content-Type": "text/html; charset=utf-8" }
		});
	});
	const httpServer = serve(app, { port });
	await httpServer.ready();
	const serverUrlAdr = httpServer.url ?? `http://localhost:${port}`;
	console.log(styleText("green", "The server has been started successfully at:"), styleText("cyan", serverUrlAdr), styleText("magenta", "\nFolder for static files:"), styleText("gray", distAbs), styleText("magenta", "\nPage \"Error 404\":"), styleText("gray", errorFilePath ?? "Used default page, because file \"/404.html\" not found."));
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
function getErrorCode(error) {
	if (typeof error === "object" && error !== null && "code" in error && typeof error.code === "string") return error.code;
}
program.version(ver, "-v, --version", "output the current version");
program.option("-p, --port <port>", "server port number (default: 3000)", parsePort).option("-d, --dist <value>", "folder for serve files (default: dist)").option("-e, --e404 <value>", "filename for page \"Error 404\" (default: 404.html)");
const header = `
${styleText("magenta", `• passerve • ::.. version: ${ver}`) + styleText("gray", "\nSimple static server for local development by pasmurno from llcawc\n")}`;
program.addHelpText("before", header);
const example = `
${styleText("magenta", "Example call:\n") + styleText("cyan", "   $ passerve\n") + styleText("cyan", "   $ passerve -p 4200 -d build -e error.html\n") + styleText("cyan", "   $ npx passerve --port 8080 --dist './static'") + styleText("green", "  // local use")}`;
program.addHelpText("after", example);
const footer = `
${styleText("gray", "Copyright ©2026 llcawc, MIT License. Made with ") + styleText("red", "❤") + styleText("gray", "  to beautiful architecture. \nSource: https://github.com/llcawc/passerve")}
`;
program.addHelpText("afterAll", footer);
program.parse(process.argv);
const options = program.opts();
server(options).then((appServe) => {
	let shuttingDown = false;
	const shutdown = async (signal) => {
		if (shuttingDown) return;
		shuttingDown = true;
		console.log(`\n${styleText("yellow", `Received ${signal}. Shutting down...`)}`);
		try {
			await appServe.close();
			console.log(styleText("green", "Server stopped successfully."));
			process.exit(0);
		} catch (error) {
			console.error(styleText("red", "Failed to stop the server:"), error);
			process.exitCode = 1;
			process.exit(1);
		}
	};
	process.once("SIGINT", () => {
		shutdown("SIGINT");
	});
	process.once("SIGTERM", () => {
		shutdown("SIGTERM");
	});
}).catch((error) => {
	if (getErrorCode(error) === "EADDRINUSE") console.error(styleText("red", `Cannot start the server: port ${options.port ?? 3e3} is already in use.`));
	else if (error instanceof RangeError) console.error(styleText("red", error.message));
	else console.error(styleText("red", "Failed to start the server:"), error);
	process.exitCode = 1;
});
export {};
