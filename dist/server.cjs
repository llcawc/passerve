//#region \0rolldown/runtime.js
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
	if (from && typeof from === "object" || typeof from === "function") for (var keys = __getOwnPropNames(from), i = 0, n = keys.length, key; i < n; i++) {
		key = keys[i];
		if (!__hasOwnProp.call(to, key) && key !== except) __defProp(to, key, {
			get: ((k) => from[k]).bind(null, key),
			enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
		});
	}
	return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", {
	value: mod,
	enumerable: true
}) : target, mod));
//#endregion
let fs = require("fs");
let node_fs_promises = require("node:fs/promises");
node_fs_promises = __toESM(node_fs_promises);
let node_http = require("node:http");
node_http = __toESM(node_http);
let node_path = require("node:path");
let colors_safe_js = require("colors/safe.js");
colors_safe_js = __toESM(colors_safe_js);
let express = require("express");
express = __toESM(express);
//#region src/error.ts
const content = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Error 404</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="shortcut icon" href="https://unpkg.com/passerve@1.0.0/dist/favicon.ico" type="image/x-icon" />
  <style>@charset "UTF-8";:root{--background-body:#fff;--background:#efefef;--background-alt:#f7f7f7;--selection:#2080df;--text-selection:#f1f1f1;--text-main:#363636;--text-bright:#000;--text-muted:#70777f;--links:#0076d1;--focus:#0096bfab;--border:#dbdbdb;--code:#000;--button-base:#d0cfcf;--button-hover:#9c9c9c;--scrollbar-thumb:#ababab;--scrollbar-thumb-hover:var(--button-hover);--form-placeholder:#949494;--form-text:#1d1d1d;--variable:#39a33c;--highlight:#ff0;--animation-duration:150ms;--select-arrow:url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='%23161f27' viewBox='0 0 116.9 62.5'%3E%3Cpath d='M115.3 1.6c-1.6-1.6-4.2-1.6-5.8 0l-51 51.1L7.4 1.6C5.8 0 3.2 0 1.6 1.6S0 5.8 1.6 7.4l53.9 53.9c.8.8 1.8 1.2 2.9 1.2 1 0 2.1-.4 2.9-1.2l53.9-53.9c1.7-1.6 1.7-4.2.1-5.8'/%3E%3C/svg%3E")}@media (prefers-color-scheme:dark){:root{color-scheme:dark;--background-body:#1c1d21;--background:#232429;--background-alt:#16191d;--selection:rgba(32,128,223,.7);--text-selection:none;--text-main:#dbdbdb;--text-bright:#fff;--text-muted:#a9b1ba;--links:#42adff;--focus:rgba(0,136,204,.7);--border:#707b86;--code:#ffbe85;--button-base:#101418;--button-hover:#080a0c;--scrollbar-thumb:var(--button-hover);--scrollbar-thumb-hover:#245c89;--form-placeholder:#a9a9a9;--form-text:#fff;--variable:#d941e2;--highlight:#efdb43;--animation-duration:150ms;--select-arrow:url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='%23efefef' viewBox='0 0 116.9 62.5'%3E%3Cpath d='M115.3 1.6c-1.6-1.6-4.2-1.6-5.8 0l-51 51.1L7.4 1.6C5.8 0 3.2 0 1.6 1.6S0 5.8 1.6 7.4l53.9 53.9c.8.8 1.8 1.2 2.9 1.2 1 0 2.1-.4 2.9-1.2l53.9-53.9c1.7-1.6 1.7-4.2.1-5.8'/%3E%3C/svg%3E")}}@media (prefers-reduced-motion:no-preference){:root{scroll-behavior:smooth}}html{scrollbar-color:var(--scrollbar-thumb) var(--background-body);scrollbar-width:thin}body{font-family:Inter,system-ui,-apple-system,Segoe UI Emoji,Apple Color Emoji,Noto Color Emoji,sans-serif;line-height:1.5;margin:20px auto;max-width:800px;padding:0 10px;word-wrap:break-word;background:var(--background-body);color:var(--text-main);text-rendering:optimizelegibility;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}button,input,textarea{transition:background-color var(--animation-duration) linear,border-color var(--animation-duration) linear,color var(--animation-duration) linear,box-shadow var(--animation-duration) linear,transform var(--animation-duration) ease}h1{font-size:2.2em;margin-top:0}h1,h2,h3,h4,h5,h6{margin-bottom:12px;margin-top:24px}h1,h2,h3,h4,h5,h6,strong{color:var(--text-bright)}b,h1,h2,h3,h4,h5,h6,strong,th{font-weight:600}q:after,q:before{content:none}blockquote,q{border-left:4px solid var(--focus);font-style:italic;margin:1.5em 0;padding:.5em 1em}blockquote>footer{border:0;font-style:normal}address,blockquote cite{font-style:normal}a[href^="mailto:"]:before{content:"✉ "}a[href^="tel:"]:before{content:"☎ "}a[href^="sms:"]:before{content:"🗨 "}mark{background-color:var(--highlight);border-radius:2px;color:#000;padding:0 2px}a>code,a>strong{color:inherit}button,input[type=button],input[type=checkbox],input[type=radio],input[type=range],input[type=reset],input[type=submit],select{cursor:pointer}input,select{display:block}[type=checkbox],[type=radio]{display:initial}button,input,select,textarea{background-color:var(--background);border:none;border-radius:6px;color:var(--form-text);font-family:inherit;font-size:inherit;margin-bottom:6px;margin-right:6px;outline:none;padding:10px}button,input[type=button],input[type=reset],input[type=submit]{background-color:var(--button-base);padding-left:30px;padding-right:30px}button,input :not([type=checkbox]) :not([type=radio]),input[type=range],select,textarea{-webkit-appearance:none;-moz-appearance:none;appearance:none}button:hover,input[type=button]:hover,input[type=reset]:hover,input[type=submit]:hover{background:var(--button-hover)}input[type=color]{cursor:pointer;min-height:2rem;padding:8px}input[type=checkbox],input[type=radio]{height:1em;width:1em}input[type=radio]{border-radius:100%}input{vertical-align:top}label{display:inline-block;margin-bottom:4px;vertical-align:middle}textarea{box-sizing:border-box;display:block;margin-right:0;resize:vertical}textarea:not([cols]){width:100%}textarea:not([rows]){height:140px;min-height:40px}select{background:var(--background) var(--select-arrow) calc(100% - 12px) 50% /12px no-repeat;padding-right:35px}select::-ms-expand{display:none}select[multiple]{background-image:none;overflow-y:auto;padding-right:10px}button:focus,input:focus,select:focus,textarea:focus{box-shadow:0 0 0 2px var(--focus)}button:active,input[type=button]:active,input[type=checkbox]:active,input[type=radio]:active,input[type=range]:active,input[type=reset]:active,input[type=submit]:active{transform:translateY(2px)}button:disabled,input:disabled,select:disabled,textarea:disabled{cursor:not-allowed;opacity:.5}::-moz-placeholder{color:var(--form-placeholder)}::placeholder{color:var(--form-placeholder)}fieldset{border:1px solid var(--focus);border-radius:6px;margin:0 0 12px;padding:10px}legend{font-size:.9em;font-weight:600}input[type=range]{background:transparent;margin:10px 0;padding:10px 0}input[type=range]:focus{outline:none}input[type=range]::-webkit-slider-runnable-track{background:var(--background);border-radius:3px;height:9.5px;-webkit-transition:.2s;transition:.2s;width:100%}input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;background:var(--border);border-radius:50%;box-shadow:0 1px 1px #000,0 0 1px #0d0d0d;height:20px;margin-top:-7px;width:20px}input[type=range]:focus::-webkit-slider-runnable-track{background:var(--background)}input[type=range]::-moz-range-track{background:var(--background);border-radius:3px;height:9.5px;-moz-transition:.2s;transition:.2s;width:100%}input[type=range]::-moz-range-thumb{background:var(--border);border-radius:50%;box-shadow:1px 1px 1px #000,0 0 1px #0d0d0d;height:20px;width:20px}input[type=range]::-ms-track{background:transparent;border-color:transparent;border-width:16px 0;color:transparent;height:9.5px;width:100%}input[type=range]::-ms-fill-lower,input[type=range]::-ms-fill-upper{background:var(--background);border:.2px solid #010101;border-radius:3px;box-shadow:1px 1px 1px #000,0 0 1px #0d0d0d}input[type=range]::-ms-thumb{background:var(--border);border:1px solid #000;border-radius:50%;box-shadow:1px 1px 1px #000,0 0 1px #0d0d0d;height:20px;width:20px}input[type=range]:focus::-ms-fill-lower,input[type=range]:focus::-ms-fill-upper{background:var(--background)}a{color:var(--links);text-decoration:none}a:hover{text-decoration:underline}a:focus,a:focus-visible{box-shadow:0 0 0 2px var(--focus);outline:2px solid transparent;outline-offset:2px}code,samp,time{background:var(--background);color:var(--code);font-family:JetBrains Mono,Menlo,Monaco,Consolas,Andale Mono,Ubuntu Mono,Courier New,monospace;font-size:1em;padding:2.5px 5px}code,pre,samp,time{border-radius:6px}pre>code{display:block;overflow-x:auto;padding:10px}var{color:var(--variable);font-family:monospace;font-style:normal}kbd{background:var(--background);border:1px solid var(--border);border-radius:2px;color:var(--text-main);padding:2px 4px}img,video{height:auto;max-width:100%}figure figcaption{color:var(--text-muted);font-size:.8em;margin-block:.5em;padding-left:5em;padding-right:1em;text-align:right}hr{border:none;border-top:1px solid var(--border)}table{border-collapse:collapse;margin-bottom:10px;table-layout:fixed;width:100%}table caption,td,th{text-align:left}td,th{padding:6px;vertical-align:top;word-wrap:break-word}thead{border-bottom:1px solid var(--border)}tfoot{border-top:1px solid var(--border)}tbody tr:nth-child(2n){background-color:var(--background)}tbody tr:nth-child(2n) button{background-color:var(--background-alt)}tbody tr:nth-child(2n) button:hover{background-color:var(--background-body)}::-webkit-scrollbar{height:10px;width:10px}::-webkit-scrollbar-track{background:var(--background);border-radius:6px}::-webkit-scrollbar-thumb{background:var(--scrollbar-thumb);border-radius:6px}::-webkit-scrollbar-thumb:hover{background:var(--scrollbar-thumb-hover)}::-moz-selection{background-color:var(--selection);color:var(--text-selection)}::selection{background-color:var(--selection);color:var(--text-selection)}summary{background-color:var(--background);cursor:pointer;display:list-item;margin:-10px -10px 0;outline:none;padding:10px}summary:focus,summary:hover{text-decoration:underline}summary::-webkit-details-marker{color:var(--text-main)}details{align-items:flex-start;background-color:var(--background-alt);border-radius:6px;display:flex;flex-direction:column;margin:1em 0;overflow:hidden;padding:10px 10px 0}details[open]{padding:10px}details>:last-child{margin-bottom:0}details[open] summary{margin-bottom:10px}details>:not(summary){margin-top:0}dialog{background-color:var(--background-alt);border:none;border-color:var(--border);border-radius:6px;color:var(--text-main);padding:10px 30px}dialog>header:first-child{background-color:var(--background);border-radius:6px 6px 0 0;margin:-10px -30px 10px;padding:10px;text-align:center}dialog::backdrop{-webkit-backdrop-filter:blur(4px);backdrop-filter:blur(4px);background:#0000009c}footer{border-top:1px solid var(--border);color:var(--text-muted);padding-top:10px}body>footer{margin-top:40px}@media print{body,button,code,details,input,pre,summary,textarea{background-color:#fff}button,input,textarea{border:1px solid #000}body,button,code,footer,h1,h2,h3,h4,h5,h6,input,pre,strong,summary,textarea{color:#000}summary::marker{color:#000}summary::-webkit-details-marker{color:#000}tbody tr:nth-child(2n){background-color:#f2f2f2}a{color:#00f;text-decoration:underline}}</style>
</head>

<body style="height:calc(100svh - 40px);display: flex;">
  <main style="flex-grow:1;display:flex;align-items:center;justify-content:center;">
    <div style="display:flex;gap:1rem;">
      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" class="bi bi-bell" viewBox="0 0 16 16">
        <path d="M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2M8 1.918l-.797.161A4 4 0 0 0 4 6c0 .628-.134 2.197-.459 3.742-.16.767-.376 1.566-.663 2.258h10.244c-.287-.692-.502-1.49-.663-2.258C12.134 8.197 12 6.628 12 6a4 4 0 0 0-3.203-3.92zM14.22 12c.223.447.481.801.78 1H1c.299-.199.557-.553.78-1C2.68 10.2 3 6.88 3 6c0-2.42 1.72-4.44 4.005-4.901a1 1 0 1 1 1.99 0A5 5 0 0 1 13 6c0 .88.32 4.2 1.22 6" />
      </svg>
      <div>
        <h1 style="margin:0;">Error 404!</h1>
        <p>Page not found!</p>
        <a href="/"><button><i class="bi bi-power"></i> home</button></a>
      </div>
    </div>
  </main>
</body>

</html>
`;
//#endregion
//#region src/server.ts
const __dirname$1 = (0, node_path.resolve)();
const app = (0, express.default)();
const appServe = node_http.default.createServer(app);
/**
* Creating a Static file server
* @param args - Optional parameters: server port, source file folder and file name for error 404
* @type type Args = { port: number; dist: string; e404: string }
*/
async function server(args = {
	port: 3e3,
	dist: (0, node_path.join)(__dirname$1, "dist"),
	e404: "404.html"
}) {
	const port = args.port ?? 3e3;
	const dist = args.dist ?? (0, node_path.join)(__dirname$1, "dist");
	const e404 = args.e404 ?? "404.html";
	let isE404 = false;
	let nameErr = (0, node_path.resolve)(__dirname$1, dist, e404);
	try {
		await node_fs_promises.default.access(nameErr, fs.constants.F_OK);
		isE404 = true;
	} catch {
		nameErr = `Used default page, because file "/404.html" not found.`;
	}
	app.use((_req, res, next) => {
		res.header("Access-Control-Allow-Origin", "*");
		res.header("Access-Control-Expose-Headers", "Content-Length");
		res.header("Access-Control-Allow-Headers", "range");
		res.header("X-Served-Static-By", "passerve");
		next();
	});
	app.use(express.default.static(dist));
	app.use((_req, res) => {
		if (isE404) res.status(404).sendFile((0, node_path.resolve)(__dirname$1, dist, e404));
		else res.status(404).send(content);
	});
	appServe.listen(port, () => {
		console.log(colors_safe_js.default.green("The server has been started successfully at:"), colors_safe_js.default.cyan(`http://localhost${port === 80 ? "" : `:${port}`}/`), colors_safe_js.default.magenta(`\nFolder for static files:`), colors_safe_js.default.gray((0, node_path.resolve)(__dirname$1, dist)), colors_safe_js.default.magenta("\nPage \"Error 404\":"), colors_safe_js.default.gray(nameErr));
	});
}
//#endregion
module.exports = server;
