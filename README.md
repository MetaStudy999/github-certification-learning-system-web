# GitHub 자격증 통합 학습 웹 시스템 (GitHub Certification Learning System Web, GCLS Web)

GitHub 자격증 학습 콘텐츠를 웹 기반 **학습·훈련·평가·실습·AI 튜터·증빙·포트폴리오** 경험으로 제공하는 애플리케이션입니다.

> **현재 단계 (Current Phase, CP): P8 COMPLETE → P9 NEXT**  
> P0 Architecture부터 P8 RAG Grounding까지 GH-900 Vertical Slice를 완료했습니다. 다음 단계는 실제 GitHub 수행 결과를 검증하는 P9 Labs / GitHub API입니다.

## 빠른 시작 (Quick Start, QS)

콘텐츠 레포와 Web 레포를 sibling으로 배치합니다.

```text
workspace/
├─ github-certification-learning-system/
└─ github-certification-learning-system-web/
```

```bash
npm ci
cp .env.example .env.local
npm run supabase:start
npm run supabase:reset
npm run supabase:status
npm run dev
```

P8 RAG를 처음 사용할 때는 `RAG_INDEX_TOKEN`, 하나의 `RAG_EMBEDDING_MODE`, 그리고 가능하면 콘텐츠 저장소의 정확한 `GCLS_CONTENT_VERSION` Commit SHA를 설정한 뒤 `/api/rag/index`를 server-only token으로 실행합니다. 실제 학습 환경에서는 초기 Index 완료 후 `RAG_GROUNDING_MODE=required`를 권장합니다.

Local Supabase의 공개 credential은 `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`에 넣습니다. 서버 채점·오답·Mock·Readiness·AI/RAG Audit에는 `SUPABASE_SECRET_KEY` 또는 `SUPABASE_SERVICE_ROLE_KEY`를 사용합니다. 서버 전용 credential, `OPENAI_API_KEY`, `RAG_INDEX_TOKEN`은 절대 `NEXT_PUBLIC_*`에 넣거나 Git에 커밋하지 않습니다.

## 주요 화면 / API

- `/courses/001-foundations` — GH-900 15개 학습 모듈
- `/questions/001-foundations` — Q001–Q100 문제은행 + RAG-grounded AI Tutor
- `/wrong-answers` — 오답 원인·DAY_1/DAY_7 Retry Queue
- `/mocks/001-foundations` — Mock 01 / Mock 02 / Final Mock
- `/readiness/001-foundations` — Exam Readiness Gate
- `/progress` — 개인별 학습 진행률
- `/login` — 학습자 Auth
- `/api/rag/health` — RAG 상태 / Profile / Freshness
- `/api/rag/index` — server-only Index
- `/api/rag/search` — authenticated PRE_ANSWER Search

Health API: `/api/content/health`, `/api/questions/health`, `/api/mocks/health`, `/api/ai/health`, `/api/rag/health`

## 저장소 역할

| 저장소 | 역할 |
|---|---|
| [`github-certification-learning-system`](https://github.com/MetaStudy999/github-certification-learning-system) | 학습 콘텐츠 Source of Truth — 001~006, 문제은행, 모의고사, 실습, 증빙, 포트폴리오 |
| `github-certification-learning-system-web` | Web Application — Learning, Question, Wrong Answer, Mock, Readiness, AI Tutor, RAG, Progress, GitHub Verification |

## 기술 성장 경로 (Technology Evolution Path, TEP)

```text
LEVEL 1 — LOCAL
Next.js + Supabase Local/PostgreSQL + pgvector + Ollama + OpenAI API(optional)
        ↓
LEVEL 2 — MVP CLOUD
Vercel + Supabase Cloud/PostgreSQL + GitHub + OpenAI
        ↓
LEVEL 3 — PRODUCTION CLOUD
AWS 또는 GCP
```

## 현재 학습 흐름

```text
GCLS Content Repository
        ↓
GH-900 Learning Content
        ↓
Q001–Q100 Question Bank
        ↓
RAG: Chunk → Embed → pgvector Retrieve
        ↓
AI Tutor + Sources
Hint → Concept → Similar Example → Retry → Explanation
        ↓
Source-backed Server Evaluation
        ↓
Wrong Answer: DAY_1 → DAY_7 → CLOSED
        ↓
Mock 01 → Mock 02 → Final Mock
        ↓
Exam Readiness Gate
        ↓
P9 Labs / GitHub API
```

콘텐츠 Repository는 계속 Source of Truth입니다. RAG DB는 `content_hash`, `source_ref`, `embedding_profile`로 추적되는 재생성 가능한 검색 Index이며 원문을 대체하지 않습니다.

## P7 AI Gateway / Tutor

- AI는 채점하지 않습니다. 기존 Source-backed Rule Engine이 정답을 판정합니다.
- Hint/Concept/Similar Example에서는 선택지를 AI Provider에 전달하지 않습니다.
- Explanation은 실제 Question Attempt가 DB에 존재할 때만 허용됩니다.
- 생성 Mode: `mock | local | api | hybrid`
- `hybrid`: Ollama Local First → OpenAI Fallback

## P8 RAG Grounding

```text
GCLS Source of Truth
      ↓
Markdown Chunking
      ↓
Embedding Provider
mock | Ollama | OpenAI
      ↓
PostgreSQL pgvector(384D)
      ↓
Retrieval Policy
      ↓
AI Tutor + Source Audit
```

핵심 정책:

- Embedding은 `mock | local | api` 중 **한 Profile로 고정**합니다. Hybrid Vector Space를 만들지 않습니다.
- PRE_ANSWER: Overview, Terms, Concepts, Official Docs, Guides, Labs, Resources
- POST_ATTEMPT: Exercises, Final Review, Projects
- Question Bank / Mock / Wrong Answer는 RAG Index에서 제외합니다.
- `RAG_GROUNDING_MODE=required`이면 Index 없음, Source Version 불일치, Profile 불일치, 근거 부족 시 AI 응답을 중단합니다.
- Hash가 동일한 문서는 재색인하지 않고 변경 문서만 다시 Embedding합니다.
- `ai_interactions`와 `ai_interaction_sources`로 Grounding/Audit을 저장합니다.
- RAG는 채점 권한이 없습니다.

## 검증

P8 기능 커밋 기준 PASS:

- `GCLS Web Verify` — `32526614749`
- `GCLS Web P6 Verify` — `32526614886`
- `GCLS Web P7 Verify` — `32526614767`
- `GCLS Web P8 Verify` — `32526614755`

P8 전용 CI는 pgvector migration, 10개 안전 문서 Index, Incremental Re-index, Retrieval leakage policy, RAG Tutor/Audit/RLS, Ollama `/api/embed`, OpenAI `/v1/embeddings`, Embedding Profile mismatch를 외부 AI 비용 없이 검증합니다.

상세: [P8 Verification](./docs/development/180-p8-verification.md)

## 문서 맵

- [Architecture](./docs/architecture/README.md)
- [ADR](./docs/adr/README.md)
- [Development](./docs/development/README.md)
- [P7 AI Gateway / Tutor](./docs/development/150-p7-ai-gateway-tutor.md)
- [P7 Verification](./docs/development/160-p7-verification.md)
- [P8 RAG Grounding](./docs/development/170-p8-rag-grounding.md)
- [P8 Verification](./docs/development/180-p8-verification.md)

## 현재 상태

| 단계 | 상태 |
|---|---|
| P0 Architecture | **COMPLETE** |
| P1 Local Environment | **COMPLETE** |
| P2 Content Engine | **COMPLETE** |
| P3 User / Progress | **COMPLETE** |
| P4 Question Bank | **COMPLETE** |
| P5 Wrong Answer Engine | **COMPLETE** |
| P6 Mock / Readiness | **COMPLETE** |
| P7 AI Gateway / Tutor | **COMPLETE** |
| P8 RAG | **COMPLETE** |
| P9 Labs / GitHub API | **NEXT** |
| P10 Evidence / Portfolio | PLANNED |
