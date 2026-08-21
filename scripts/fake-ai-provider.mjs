import http from "node:http";

const port = Number(process.env.FAKE_AI_PORT ?? 18181);

function json(response, status, body) {
  response.writeHead(status, { "content-type": "application/json" });
  response.end(JSON.stringify(body));
}

const server = http.createServer((request, response) => {
  if (request.method === "GET" && request.url === "/api/tags") {
    return json(response, 200, { models: [{ name: "fake-local" }] });
  }

  if (request.method === "POST" && request.url === "/api/chat") {
    let body = "";
    request.on("data", (chunk) => { body += chunk; });
    request.on("end", () => {
      try {
        const payload = JSON.parse(body || "{}");
        if (!payload.model || !Array.isArray(payload.messages)) return json(response, 400, { error: "invalid ollama payload" });
        return json(response, 200, { message: { role: "assistant", content: "FAKE_OLLAMA_OK" } });
      } catch {
        return json(response, 400, { error: "invalid JSON" });
      }
    });
    return;
  }

  if (request.method === "POST" && request.url === "/v1/responses") {
    if (request.headers.authorization !== "Bearer test-openai-key") {
      return json(response, 401, { error: { message: "invalid authorization" } });
    }
    let body = "";
    request.on("data", (chunk) => { body += chunk; });
    request.on("end", () => {
      try {
        const payload = JSON.parse(body || "{}");
        if (!payload.model || typeof payload.input !== "string") return json(response, 400, { error: { message: "invalid responses payload" } });
        return json(response, 200, {
          output: [{ type: "message", content: [{ type: "output_text", text: "FAKE_OPENAI_OK" }] }],
        });
      } catch {
        return json(response, 400, { error: { message: "invalid JSON" } });
      }
    });
    return;
  }

  return json(response, 404, { error: "not found" });
});

server.listen(port, "127.0.0.1", () => console.log(`fake AI provider listening on ${port}`));

for (const signal of ["SIGTERM", "SIGINT"]) {
  process.on(signal, () => server.close(() => process.exit(0)));
}
