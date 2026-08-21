# GitHub 자격증 통합 학습 웹 시스템 (GitHub Certification Learning System Web, GCLS Web)

GitHub 자격증 학습 콘텐츠를 웹 기반 **학습·훈련·평가·실습·AI 튜터·증빙·포트폴리오** 경험으로 제공하는 애플리케이션입니다.

> **현재 단계 (Current Phase, CP): P7 COMPLETE → P8 NEXT**  
> P0 Architecture부터 P7 AI Gateway / Tutor까지 GH-900 Vertical Slice를 완료했습니다. 다음 단계는 Source of Truth 기반 검색 증강 생성을 연결하는 P8 RAG입니다.

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

Local Supabase의 공개 credential은 `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`에 넣습니다. 서버 채점·오답·Mock·Readiness·AI Audit 쓰기에는 `SUPABASE_SECRET_KEY` 또는 `SUPABASE_SERVICE_ROLE_KEY`를 사용합니다. 서버 전용 credential과 `OPENAI_API_KEY`는 절대 `NEXT_PUBLIC_*`에 넣거나 Git에 커밋하지 않습니다.

## 주요 화면

- `/courses/001-foundations` — GH-900 15개 학습 모듈
- `/questions/001-foundations` — Q001–Q100 문제은행 + AI Tutor
- `/wrong-answers` — 오답 원인·DAY_1/DAY_7 Retry Queue
- `/mocks/001-foundations` — Mock 01 / Mock 02 / Final Mock
- `/readiness/001-foundations` — Exam Readiness Gate
- `/progress` — 개인별 학습 진행률
- `/login` — 학습자 Auth

Health API: `/api/content/health`, `/api/questions/health`, `/api/mocks/health`, `/api/ai/health`

## 저장소 역할

| 저장소 | 역할 |
|---|---|
| [`github-certification-learning-system`](https://github.com/MetaStudy999/github-certification-learning-system) | 학습 콘텐츠 Source of Truth — 001~006, 문제은행, 모의고사, 실습, 증빙, 포트폴리오 |
| `github-certification-learning-system-web` | Web Application — Learning, Question, Wrong Answer, Mock, Readiness, AI Tutor, RAG, Progress, GitHub Verification |

## 기술 성장 경로 (Technology Evolution Path, TEP)

```text
LEVEL 1 — LOCAL
Next.js + Supabase Local + PostgreSQL + Ollama + OpenAI API(optional)
        ↓
LEVEL 2 — MVP CLOUD
Vercel + Supabase Cloud + GitHub + OpenAI
        ↓
LEVEL 3 — PRODUCTION CLOUD
AWS 또는 GCP
```

## 현재 학습 흐름

```text
GCLS Content Repository
        ↓
GH-900 15 Modules
        ↓
Q001–Q100 Question Bank
        ↓
AI Tutor: Hint → Concept → Similar Example → Retry → Explanation
        ↓
Source-backed Server Evaluation
        ↓
Wrong Answer: DAY_1 → DAY_7 → CLOSED
        ↓
Mock 01 → Mock 02 → Final Mock
        ↓
Exam Readiness Gate
        ↓
P8 RAG
```

콘텐츠 원문과 정답은 Web DB/TypeScript에 복제하지 않습니다. DB에는 사용자 상태, 평가 결과, AI 상호작용 Audit 등 실행 상태만 저장합니다.

## P4 Question Bank

- 10세트 × 10문항 = **100문항**
- 제출 전 정답·해설 비노출
- Source of Truth 서버 채점
- `question_attempts` + RLS

## P5 Wrong Answer Engine

- `CONCEPT / COMPARE / READING / MEMORY / PRACTICE / SCOPE`
- `HIGH / MEDIUM / LOW`
- `DAY_1 → DAY_7 → CLOSED`
- Retry 실패 시 `HIGH / DAY_1` 재시작

## P6 Mock / Readiness

| 시험 | 문항 | 권장 시간 | 목표 |
|---|---:|---:|---:|
| Mock 01 | 40 | 60분 | 85%+ |
| Mock 02 | 40 | 60분 | 85%+ |
| Final Mock | 40 | **55분** | 90%+ 권장 |

Exam Readiness Gate는 Mock 01 85%+, Mock 02 85%+, 최근 2회 85%+, Final 90%+, 오답 Retry 90%+, 최신 Study Guide 확인의 6개 항목으로 계산합니다.

## P7 AI Gateway / Tutor

```text
Question
   ↓
Hint
   ↓
Concept
   ↓
Similar Example
   ↓
Retry
   ↓
Explanation
```

- AI는 채점하지 않습니다. 기존 Rule Engine이 정답을 판정합니다.
- Hint/Concept/Similar Example에서는 **선택지를 AI Provider에 전달하지 않습니다.**
- Explanation은 실제 Question Attempt가 DB에 존재할 때만 허용됩니다.
- `ai_interactions`에 stage/provider/model/fallback/latency를 Audit합니다.
- Browser는 본인 AI 기록 SELECT만 가능하고 쓰기는 server-only입니다.

| AI Mode | Provider |
|---|---|
| `mock` | Deterministic Mock |
| `local` | Ollama |
| `api` | OpenAI |
| `hybrid` | Ollama Local First → OpenAI Fallback |

OpenAI 연결은 `OPENAI_BASE_URL`, `OPENAI_API_KEY`, `OPENAI_MODEL`로 설정하며 모델명을 코드에 고정하지 않습니다.

## 검증

P7 기능 커밋 기준 최종 PASS:

- `GCLS Web Verify` — `32524604932`
- `GCLS Web P6 Verify` — `32524604937`
- `GCLS Web P7 Verify` — `32524604921`

P7 전용 CI는 Mock Tutor 접근제어/RLS뿐 아니라 fake Ollama/OpenAI-compatible server를 이용해 Local/API/Hybrid Provider contract와 fallback을 외부 비용 없이 검증합니다.

상세: [P7 Verification](./docs/development/160-p7-verification.md)

## 문서 맵

- [Architecture](./docs/architecture/README.md)
- [ADR](./docs/adr/README.md)
- [Development](./docs/development/README.md)
- [P6 Mock / Readiness](./docs/development/130-p6-mock-readiness.md)
- [P6 Verification](./docs/development/140-p6-verification.md)
- [P7 AI Gateway / Tutor](./docs/development/150-p7-ai-gateway-tutor.md)
- [P7 Verification](./docs/development/160-p7-verification.md)

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
| P8 RAG | **NEXT** |
| P9 Labs / GitHub API | PLANNED |
| P10 Evidence / Portfolio | PLANNED |
