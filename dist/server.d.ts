import http from "node:http";
type Args = {
  port: number;
  dist: string;
  e404: string;
};
/**
 * Creating a static file server
 * @param args - Optional parameters: server port, source file folder and file name for error 404
 * @type type Args = { port: number; dist: string; e404: string }
 * @returns The HTTP server instance; the promise resolves once the server is listening
 */
declare function server(args?: Partial<Args>): Promise<http.Server>;
export { type Args, server as default };