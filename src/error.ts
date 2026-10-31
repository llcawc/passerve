export const content: string = `<!DOCTYPE html>
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
`
