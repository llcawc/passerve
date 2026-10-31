# passerve

> simple static server for local development

## Getting started

Install the `passerve` as global package:

```bash
npm install -g passerve
```

or install local in project:

```bash
npm install --save-dev passerve
```

## Commands

Usage for global install:

```bash
$ passerve [options]
```

Usage for install in project:

```bash
$ npx passerve [options]
```

### Use in `package.json` scripts:

```json
  "scripts": {
    "serve": "passerve [options]"
  }
```

and start this:

```bash
$ npm run serve
```

## Options:

```
  -v, --version       output the current version
  -p, --port <n>      server port number (default: 3000)
  -d, --dist [value]  folder for serve files (default: dist)
  -e, --e404 [value]  filename for page "Error 404" (default: 404.html)
  -h, --help          display help for command
```

## Example call:

```bash
$ passerve -p 4200 -d build -e error.html
```

or

```bash
$ npx passerve --port 8080 --dist './static'
```

If no options are provided, defaults are used. If the 404.html file missing in the dist folder, a built-in error page is shown instead.

> Tip: --port 0 makes the OS pick any free port. The actual port is printed in the startup log.

## API / Gulp

You can start the server programmatically. The `server()` function returns a `Promise<http.Server>` that resolves **after** the server is listening and rejects if the port is invalid, already in use, or if `e404` points outside `dist`.

```js
// gulpfile.js

import { src, dest, series, parallel, watch } from "gulp";
import server from "passerve";

async function browse() {
  const httpServer = await server({
    port: 3000, // default: 3000; use 0 to get any free port
    dist: "dist", // default: "dist", resolved from process.cwd()
    e404: "404.html", // default: "404.html", must be inside `dist`
  });

  // Log the actual port — useful when `port: 0` was used
  const { port } = httpServer.address();
  console.log(`Server is running on http://localhost:${port}/`);

  // Optional: stop the server on Ctrl+C / process exit
  const shutdown = () => httpServer.close(() => process.exit(0));
  process.once("SIGINT", shutdown);
  process.once("SIGTERM", shutdown);

  // Keep the task alive until the server closes
  await new Promise((resolve) => httpServer.once("close", resolve));
}

function copy() {
  return src("src/**/*.*").pipe(dest("dist"));
}

function watcher() {
  watch("src/**/*.*", copy);
}

export const serve = parallel(watcher, browse);
export const dev = series(copy, serve);
```

## Closing the server

`server.close()` follows Node.js semantics: it stops accepting new connections and waits for the existing ones to finish.

```js
import server from "passerve";

const httpServer = await server({ port: 0, dist: "dist" });

// ... run tests against httpServer.address().port ...

await new Promise((resolve, reject) => httpServer.close((err) => (err ? reject(err) : resolve())));
```

---

## License

MIT ©2026 pasmurno by [llcawc](https://github.com/llcawc). Made with <span style="color: red;">❤</span> to beautiful architecture
