# passerve

> Simple static server for local development.

`passerve` is a lightweight static file server powered by [H3 v2](https://h3.dev/).

It serves files from a specified directory, supports custom 404 pages, and provides a built-in fallback error page.

## Requirements

- Node.js >= 20.19.0

## Getting started

Install `passerve` globally:

```bash
npm install -g passerve
```

Or install it locally in your project:

```bash
npm install --save-dev passerve
```

## CLI

Usage with a global installation:

```bash
passerve [options]
```

Usage with a local installation:

```bash
npx passerve [options]
```

### Use in `package.json` scripts

```json
{
  "scripts": {
    "serve": "passerve"
  }
}
```

Start the server:

```bash
npm run serve
```

### Options

| Option               | Description                                         |
| -------------------- | --------------------------------------------------- |
| `-v, --version`      | Output the current version                          |
| `-p, --port <port>`  | Server port number (default: `3000`)                |
| `-d, --dist <value>` | Directory containing static files (default: `dist`) |
| `-e, --e404 <value>` | Custom 404 page filename (default: `404.html`)      |
| `-h, --help`         | Display help for command                            |

### Examples

```bash
passerve -p 4200 -d build -e error.html
```

Or:

```bash
npx passerve --port 8080 --dist ./static
```

If no options are provided, the default values are used.

The `dist` directory is resolved relative to the current working directory (`process.cwd()`).

### Port selection

Use `--port 0` to let the operating system select an available port:

```bash
passerve --port 0
```

The actual server URL is printed in the startup log.

## Error 404 page

By default, `passerve` looks for `404.html` inside the static directory.

You can specify a different filename:

```bash
passerve --dist build --e404 error.html
```

The custom 404 file must be located inside the `dist` directory.

If the custom 404 file does not exist or cannot be read, `passerve` displays its built-in HTML error page instead.

## API

You can start the server programmatically:

```js
import server from "passerve";

const appServer = await server({
  port: 3000, // default: 3000; use 0 for an available port
  dist: "dist", // default: './dist', resolved from process.cwd()
  e404: "404.html", // default: '404.html', must be inside dist
});

console.log(`Server is running at ${appServer.url}`);

// Stop the server when it is no longer needed
await appServer.close();
```

### Server options

| Option | Type     | Default                   | Description                                             |
| ------ | -------- | ------------------------- | ------------------------------------------------------- |
| `port` | `number` | `3000`                    | Port to listen on. Use `0` to select an available port. |
| `dist` | `string` | `process.cwd() + '/dist'` | Directory containing static files.                      |
| `e404` | `string` | `404.html`                | Custom 404 page filename, relative to `dist`.           |

### Return value

`server()` returns a `Promise<ServerInstance>`.

The promise resolves after the server has started listening.

The returned server instance provides:

| Property / method | Description                                               |
| ----------------- | --------------------------------------------------------- |
| `url`             | Actual URL of the running server.                         |
| `ready()`         | Promise that resolves when the server is ready.           |
| `close()`         | Stops the server and waits for active requests to finish. |
| `close(true)`     | Stops the server and terminates active connections.       |

The returned instance is provided by `srvx` through H3. It is **not** a Node.js `http.Server`.

### Example: using with Gulp

```js
// gulpfile.js
import process from "node:process";
import { src, dest, parallel, series, watch } from "gulp";
import server from "passerve";

// shutdownSignal — a single Promise that resolves upon Ctrl+C
const shutdownSignal = new Promise((resolve) => {
  process.once("SIGINT", resolve);
  process.once("SIGTERM", resolve);
});

// browse() waits for a signal and then shuts down the server via close(true) in order to forcibly terminate active connections.
async function browse() {
  const appServer = await server({
    port: 3000,
    dist: "build",
    e404: "error.html",
  });

  console.log(`Server is running at ${appServer.url}`);

  await shutdownSignal;
  await appServer.close(true);
}

function copy() {
  return src("app/**/*.*", { encoding: false }).pipe(dest("build"));
}

// watcher() also waits for a signal, after which it calls fileWatcher.close()
async function watcher() {
  const fileWatcher = watch("app/**/*.*", copy);

  await shutdownSignal;
  fileWatcher.close();
}

export const serve = parallel(watcher, browse);
export const dev = series(copy, serve);
```

## Closing the server

Use `await appServer.close()` to stop accepting new connections and wait for active requests to finish.

```js
import server from "passerve";

const appServer = await server({
  port: 0,
  dist: "build",
});

try {
  console.log(`Server URL: ${appServer.url}`);

  // Run tests against the server...
} finally {
  await appServer.close();
}
```

## Features

- Lightweight static file server powered by H3 v2.
- Custom static directory.
- Custom 404 page with a built-in HTML fallback.
- Automatic port selection with `port: 0`.
- CORS headers enabled.
- Support for `GET` and `HEAD` static requests.
- Graceful server shutdown.

---

## License

MIT © 2026 pasmurno by [llcawc](https://github.com/llcawc/passerve). Made with ❤️ for beautiful architecture.
