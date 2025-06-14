import { routeAgentRequest } from "agents";
import { ConversationDO } from "./conversation";
import { Hono } from "hono";

const app = new Hono<{ Bindings: CloudflareBindings }>();

app.on(["GET", "POST"], "*", async (c) => {
  if (!c.env.OPENAI_API_KEY) {
    return new Response("OPENAI_API_KEY is not set", { status: 500 });
  }

  return (
    (await routeAgentRequest(c.req.raw, c.env)) ||
    new Response("Not found", { status: 404 })
  );
});

export default app;

export { ConversationDO };
