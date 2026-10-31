import assert from "node:assert/strict";
import test from "node:test";

import server from "../dist/server.js";

const FIXTURE = "app"; // demo static folder in the repo root

async function start(t, overrides = {}) {
  const srv = await server({ port: 0, dist: FIXTURE, ...overrides });
  t.after(() => {
    srv.closeAllConnections();
    srv.close();
  });
  const { port } = srv.address();
  return { srv, base: `http://127.0.0.1:${port}` };
}

test("serves static files from the dist folder", async (t) => {
  const { base } = await start(t);
  const res = await fetch(`${base}/`);
  assert.equal(res.status, 200);
  const body = await res.text();
  assert.match(body, /passerve/);
});

test("returns the built-in 404 page when no custom error file exists", async (t) => {
  const { base } = await start(t); // 'app/' has no '404.html'
  const res = await fetch(`${base}/missing-file`);
  assert.equal(res.status, 404);
  const body = await res.text();
  assert.match(body, /Error 404/);
});

test("serves a custom 404 page from the e404 option", async (t) => {
  const { base } = await start(t, { e404: "error.html" });
  const res = await fetch(`${base}/missing-file`);
  assert.equal(res.status, 404);
  const body = await res.text();
  assert.match(body, /tiny\.min\.css/); // marker of the custom app/error.html
});

test("adds the passerve header to every response", async (t) => {
  const { base } = await start(t);
  const res = await fetch(`${base}/`);
  assert.equal(res.headers.get("x-served-static-by"), "passerve");
});

test("rejects when the port is already in use", async (t) => {
  const { srv } = await start(t);
  const { port } = srv.address();
  await assert.rejects(server({ port, dist: FIXTURE }), (err) => err?.code === "EADDRINUSE");
});

test("rejects an invalid port number", async () => {
  await assert.rejects(server({ port: -1 }), RangeError);
  await assert.rejects(server({ port: 70000 }), RangeError);
});
