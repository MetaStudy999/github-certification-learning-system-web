import http from "node:http";

const port = Number(process.env.FAKE_AI_PORT ?? 18181);

function json(response, status, body) {
  response.writeHead(status, { "content-type": "application/json" });
  response.end(JSON.stringify(body));
}

function readJson(request, callback) {
  let body = "";
  request.on("data", (chunk) => { body += chunk; });
  request.on("end", () => {
    try {
      callback(JSON.parse(body || "{}"));
    } catch {
      callback(null);
    }
  });
}

function fakeVector(text, dimensions) {
  const vector = Array.from({ length: dimensions }, () => 0);
  let seed = 2166136261;
  for (const character of String(text)) {
    seed ^= character.charCodeAt(0);
    seed = Math.imul(seed, 16777619) >>> 0;
  }
  vector[seed % dimensions] = 1;
  vector[(seed >>> 8) % dimensions] += 0.5;
  const norm = Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0)) || 1;
  return vector.map((value) => value / norm);
}

const server = http.createServer((request, response) => {
  if (request.method === "GET" && request.url === "/api/tags") {
    return json(response, 200, { models: [{ name: "fake-local" }, { name: "fake-embed" }] });
  }

  if (request.method === "POST" && request.url === "/api/chat") {
    readJson(request, (payload) => {
      if (!payload || !payload.model || !Array.isArray(payload.messages)) return json(response, 400, { error: "invalid ollama payload" });
      return json(response, 200, { message: { role: "assistant", content: "FAKE_OLLAMA_OK" } });
    });
    return;
  }

  if (request.method === "POST" && request.url === "/api/embed") {
    readJson(request, (payload) => {
      if (!payload || !payload.model || (!Array.isArray(payload.input) && typeof payload.input !== "string")) {
        return json(response, 400, { error: "invalid ollama embed payload" });
      }
      const inputs = Array.isArray(payload.input) ? payload.input : [payload.input];
      const dimensions = Number(payload.dimensions ?? 384);
      return json(response, 200, {
        model: payload.model,
        embeddings: inputs.map((input) => fakeVector(input, dimensions)),
      });
    });
    return;
  }

  if (request.method === "POST" && request.url === "/v1/responses") {
    if (request.headers.authorization !== "Bearer test-openai-key") {
      return json(response, 401, { error: { message: "invalid authorization" } });
    }
    readJson(request, (payload) => {
      if (!payload || !payload.model || typeof payload.input !== "string") return json(response, 400, { error: { message: "invalid responses payload" } });
      return json(response, 200, {
        output: [{ type: "message", content: [{ type: "output_text", text: "FAKE_OPENAI_OK" }] }],
      });
    });
    return;
  }

  if (request.method === "POST" && request.url === "/v1/embeddings") {
    if (request.headers.authorization !== "Bearer test-openai-key") {
      return json(response, 401, { error: { message: "invalid authorization" } });
    }
    readJson(request, (payload) => {
      if (!payload || !payload.model || (!Array.isArray(payload.input) && typeof payload.input !== "string")) {
        return json(response, 400, { error: { message: "invalid embeddings payload" } });
      }
      const inputs = Array.isArray(payload.input) ? payload.input : [payload.input];
      const dimensions = Number(payload.dimensions ?? 384);
      return json(response, 200, {
        object: "list",
        model: payload.model,
        data: inputs.map((input, index) => ({ object: "embedding", index, embedding: fakeVector(input, dimensions) })),
        usage: { prompt_tokens: inputs.length, total_tokens: inputs.length },
      });
    });
    return;
  }

  return json(response, 404, { error: "not found" });
});

server.listen(port, "127.0.0.1", () => console.log(`fake AI provider listening on ${port}`));

for (const signal of ["SIGTERM", "SIGINT"]) {
  process.on(signal, () => server.close(() => process.exit(0)));
}
