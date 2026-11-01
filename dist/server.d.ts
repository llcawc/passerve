import { serve } from "h3";
type Args = {
  port: number;
  dist: string;
  e404: string;
};
type ServerInstance = ReturnType<typeof serve>;
declare function server(args?: Partial<Args>): Promise<ServerInstance>;
export { type Args, type ServerInstance, server as default };