//#region src/server.d.ts
type Args = {
  port: number;
  dist: string;
  e404: string;
};
/**
 * Creating a Static file server
 * @param args - Optional parameters: server port, source file folder and file name for error 404
 * @type type Args = { port: number; dist: string; e404: string }
 */
declare function server(args?: Args): Promise<void>;
//#endregion
export { type Args, server as default };