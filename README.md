# GitHub 자격증 통합 학습 웹 시스템 (GitHub Certification Learning System Web, GCLS Web)

GitHub 자격증 학습 콘텐츠를 웹 기반 **학습·훈련·평가·실습·AI 튜터·증빙·포트폴리오** 경험으로 제공하는 애플리케이션입니다.

> **현재 단계 (Current Phase, CP): P6 COMPLETE → P7 NEXT**  
> P0 Architecture부터 P6 Mock / Readiness까지 GH-900 Vertical Slice를 완료했습니다. 다음 단계는 AI Provider를 실제 학습 흐름에 연결하는 P7 AI Gateway / Tutor입니다.

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

Local Supabase의 publishable/anon credential은 `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`에 넣습니다. 서버 채점·오답·Mock·Readiness 쓰기에는 `SUPABASE_SECRET_KEY` 또는 `SUPABASE_SERVICE_ROLE_KEY`를 사용합니다. 서버 전용 credential은 `NEXT_PUBLIC_*`에 넣거나 Git에 커밋하지 않습니다.

## 주요 화면

- `/courses/001-foundations` — GH-900 15개 학습 모듈
- `/questions/001-foundations` — Q001–Q100 문제은행
- `/wrong-answers` — 오답 원인·DAY_1/DAY_7 Retry Queue
- `/mocks/001-foundations` — Mock 01 / Mock 02 / Final Mock
- `/readiness/001-foundations` — Exam Readiness Gate
- `/progress` — 개인별 학습 진행률
- `/login` — 학습자 Auth

Health API:

- `/api/content/health`
- `/api/questions/health`
- `/api/mocks/health`
- `/api/ai/health`

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
Content Provider (local / github / auto)
        ↓
GH-900 15 Modules
        ↓
Q001–Q100 Question Bank
        ↓
Server-side Evaluation
        ↓
Wrong Answer Engine
DAY_1 → DAY_7 → CLOSED
        ↓
Mock 01 → Mock 02 → Final Mock
        ↓
Exam Readiness Gate
        ↓
P7 AI Tutor
```

콘텐츠 원문과 정답을 Web DB나 TypeScript에 복제하지 않습니다. Web은 실행 시 메인 콘텐츠 저장소를 읽고, DB에는 사용자 상태와 실행 결과만 저장합니다.

## P4 Question Bank

- 10개 세트 × 10문항 = **100문항**
- 문제 화면에서는 정답·해설 비노출
- 서버가 Source of Truth를 다시 읽어 채점
- `question_attempts` 저장 및 RLS 사용자 격리
- Browser 직접 Attempt INSERT 차단

## P5 Wrong Answer Engine

- 원인 코드: `CONCEPT / COMPARE / READING / MEMORY / PRACTICE / SCOPE`
- Priority: `HIGH / MEDIUM / LOW`
- `DAY_1 → DAY_7 → CLOSED`
- Retry 실패 시 `HIGH / DAY_1` 재시작
- `wrong_answer_retries` Audit
- Browser SELECT only / server-only 상태 변경

## P6 Mock / Readiness

| 시험 | 문항 | 권장 시간 | 목표 |
|---|---:|---:|---:|
| Mock 01 | 40 | 60분 | 85%+ |
| Mock 02 | 40 | 60분 | 85%+ |
| Final Mock | 40 | **55분** | 90%+ 권장 |

- `questions.md` / `answers.md` 분리 유지
- 제출 전 정답·해설 Client 비노출
- Mock Start → 전체 Submit → 서버 채점
- `mock_exam_attempts` / `mock_exam_answers` 저장
- Mock 오답은 P5 Queue와 연동
- Question Bank와 Mock Attempt는 `source_kind`로 분리

Exam Readiness Gate:

1. Mock 01 85%+
2. Mock 02 85%+
3. 최근 2회 연속 85%+
4. Final Mock 90%+ 권장
5. 최근 오답 Retry 90%+
6. 최신 공식 Study Guide 확인

6/6 충족 시 `EXAM-READY`입니다.

## AI 모드

| Mode | 역할 |
|---|---|
| `mock` | 결정론적 개발/테스트 |
| `local` | Ollama |
| `api` | OpenAI API |
| `hybrid` | Ollama 우선, 실패 시 OpenAI API fallback |

P7에서는 이 Provider 골격을 `Hint → Concept → Similar Example → Retry → Explanation` 학습 흐름과 연결합니다.

## 검증

P6까지 GitHub Actions Ubuntu 24.04에서 다음 기준을 검증합니다.

- Static Verify / TypeScript / Next.js Build
- Supabase P3~P6 migrations + `db reset`
- Local / GitHub Content Provider
- P3 Auth / Progress / RLS
- P4 Question Bank / Attempt / RLS
- P5 Wrong Answer State Machine / RLS
- P6 3 Mock / 120문항 / 정답 비노출
- Mock 제출·서버 채점·P5 Retry 통합
- Exam Readiness 6개 Gate
- Browser 직접 Write 차단
- Cross-user RLS isolation

상세: [P6 Verification](./docs/development/140-p6-verification.md)

## 문서 맵

- [Architecture](./docs/architecture/README.md)
- [ADR](./docs/adr/README.md)
- [Development](./docs/development/README.md)
- [P5 Wrong Answer Engine](./docs/development/110-p5-wrong-answer-engine.md)
- [P5 Verification](./docs/development/120-p5-verification.md)
- [P6 Mock / Readiness](./docs/development/130-p6-mock-readiness.md)
- [P6 Verification](./docs/development/140-p6-verification.md)

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
| P7 AI Gateway / Tutor | **NEXT** |
| P8 RAG | PLANNED |
| P9 Labs / GitHub API | PLANNED |
| P10 Evidence / Portfolio | PLANNED |
