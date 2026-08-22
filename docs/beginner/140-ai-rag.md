# 140 AI Tutor와 RAG 설정 (AI Tutor & RAG, AR)

## 빠른 시작

처음 설치 검증에서는 외부 API 비용이 없는 `mock` 모드를 권장합니다.

`.env.local`:

```env
AI_MODE=mock
RAG_EMBEDDING_MODE=mock
RAG_EMBEDDING_DIMENSIONS=384
RAG_GROUNDING_MODE=required
RAG_TOP_K=5
RAG_MIN_SIMILARITY=0.05
RAG_INDEX_TOKEN=<직접 만든 로컬 비밀값>
GCLS_CONTENT_VERSION=<Content Repo commit SHA>
```

## 1. Content Version 확인

Content Repository의 현재 commit SHA를 확인합니다.

```bash
git -C ../github-certification-learning-system rev-parse HEAD
```

출력된 SHA를 `.env.local`의 `GCLS_CONTENT_VERSION`에 넣습니다.

## 2. RAG Index Token 만들기

macOS/Linux/WSL2 예시:

```bash
openssl rand -hex 32
```

출력값을 `RAG_INDEX_TOKEN`에 저장합니다.

## 3. Web Server 재시작

환경변수를 수정했다면:

```text
Ctrl + C
```

후:

```bash
npm run dev
```

## 4. RAG Index 생성

`<local-secret>` 부분에 `.env.local`의 `RAG_INDEX_TOKEN` 값을 사용합니다.

```bash
curl -X POST http://127.0.0.1:3000/api/rag/index \
  -H 'content-type: application/json' \
  -H 'x-rag-index-token: <local-secret>' \
  -d '{"courseSlug":"001-foundations"}'
```

## 5. RAG Health 확인

```bash
curl http://127.0.0.1:3000/api/rag/health
```

정상 기준:

```text
status: ready
```

## 6. AI Tutor 사용

Question Bank에서:

```text
Hint
→ Concept
→ Similar Example
→ 문제 제출
→ Explanation
```

제출 전에는 정답/선택지를 AI에 노출하지 않는 정책을 사용합니다.

## 선택: Local Ollama

생성 AI를 Local로 전환할 때:

```env
AI_MODE=local
OLLAMA_BASE_URL=http://127.0.0.1:11434
OLLAMA_MODEL=<사용할 모델>
```

Embedding까지 Local로 바꿀 때는 같은 Index 안에서 embedding profile을 섞지 않도록 기존 Index를 다시 생성해야 합니다.

## 선택: OpenAI API

```env
AI_MODE=api
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_API_KEY=<server-only>
OPENAI_MODEL=<사용할 모델>
```

`OPENAI_API_KEY`에는 `NEXT_PUBLIC_`을 붙이지 않습니다.

## PASS 기준

- `/api/rag/health` → ready
- Question Bank에서 AI Tutor 호출 가능
- Source 근거 표시 확인

다음: [150 GitHub Labs](./150-github-labs.md)
