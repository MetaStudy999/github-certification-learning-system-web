import http from "node:http";

const port = Number(process.env.FAKE_GITHUB_PORT ?? 19191);
const expectedToken = process.env.FAKE_GITHUB_TOKEN ?? "github_pat_test_p9_abcdefghijklmnopqrstuvwxyz";
const commitSha = "1111111111111111111111111111111111111111";

function json(response, status, body) {
  response.writeHead(status, { "content-type": "application/json" });
  response.end(JSON.stringify(body));
}

const server = http.createServer((request, response) => {
  if (request.headers.authorization !== `Bearer ${expectedToken}`) return json(response, 401, { message: "Bad credentials" });
  const url = new URL(request.url ?? "/", `http://127.0.0.1:${port}`);
  const path = decodeURIComponent(url.pathname);

  if (request.method === "GET" && path === "/user") return json(response, 200, { login: "p9-ci", html_url: "https://github.com/p9-ci" });
  if (request.method === "GET" && path === "/repos/octo/github-foundations-lab") return json(response, 200, {
    full_name: "octo/github-foundations-lab", default_branch: "main", html_url: "https://github.com/octo/github-foundations-lab", private: true,
  });
  if (request.method === "GET" && path === "/repos/octo/github-foundations-lab/branches/main") return json(response, 200, { name: "main", commit: { sha: "2222222222222222222222222222222222222222" }, protected: false });
  if (request.method === "GET" && path === "/repos/octo/github-foundations-lab/branches/feature/p9") return json(response, 200, { name: "feature/p9", commit: { sha: "3333333333333333333333333333333333333333" }, protected: false });
  if (request.method === "GET" && path.startsWith("/repos/octo/github-foundations-lab/branches/")) return json(response, 404, { message: "Branch not found" });
  if (request.method === "GET" && path === `/repos/octo/github-foundations-lab/commits/${commitSha}`) return json(response, 200, { sha: commitSha, html_url: `https://github.com/octo/github-foundations-lab/commit/${commitSha}` });
  if (request.method === "GET" && path === `/repos/octo/github-foundations-lab/compare/${commitSha}...feature/p9`) return json(response, 200, { status: "ahead", ahead_by: 2, behind_by: 0 });
  if (request.method === "GET" && path === "/repos/octo/github-foundations-lab/issues/7") return json(response, 200, { number: 7, state: "open", html_url: "https://github.com/octo/github-foundations-lab/issues/7" });
  if (request.method === "GET" && path === "/repos/octo/github-foundations-lab/pulls/8") return json(response, 200, {
    number: 8, state: "open", merged: false, merged_at: null, html_url: "https://github.com/octo/github-foundations-lab/pull/8",
    body: "Closes #7", head: { ref: "feature/p9", sha: "3333333333333333333333333333333333333333" }, base: { ref: "main" },
  });
  if (request.method === "GET" && path === "/repos/octo/github-foundations-lab/actions/workflows") return json(response, 200, {
    total_count: 1, workflows: [{ id: 99, name: "hello", path: ".github/workflows/hello.yml", html_url: "https://github.com/octo/github-foundations-lab/actions/workflows/hello.yml" }],
  });
  if (request.method === "GET" && path === "/repos/octo/github-foundations-lab/actions/runs") return json(response, 200, {
    total_count: 1, workflow_runs: [{ id: 100, name: "hello", status: "completed", conclusion: "success", html_url: "https://github.com/octo/github-foundations-lab/actions/runs/100" }],
  });
  return json(response, 404, { message: `Not Found: ${path}` });
});

server.listen(port, "127.0.0.1", () => console.log(`fake GitHub API listening on ${port}`));
for (const signal of ["SIGTERM", "SIGINT"]) process.on(signal, () => server.close(() => process.exit(0)));
