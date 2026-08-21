# GitHub 자격증 통합 학습 웹 시스템 (GitHub Certification Learning System Web, GCLS Web)

GitHub 자격증 학습 콘텐츠를 웹 기반 **학습·훈련·평가·실습·AI 튜터·증빙·포트폴리오** 경험으로 제공하는 애플리케이션입니다.

> **현재 단계 (Current Phase, CP): P4 COMPLETE → P5 NEXT**  
> P0 Architecture, P1 Local Environment, P2 Content Engine, P3 User / Progress, P4 Question Bank를 완료했습니다. 다음 단계는 오답을 재학습 Queue로 연결하는 P5 Wrong Answer Engine입니다.

## 빠른 시작 (Quick Start, QS)

권장 배치는 콘텐츠 레포와 Web 레포를 sibling으로 둡니다.

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

Local Supabase 상태에서 확인한 공개용 anon/publishable credential은 `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`에 넣습니다. 문제풀이 Attempt의 서버 측 저장에는 Local `SECRET_KEY` 또는 `SERVICE_ROLE_KEY`를 각각 `SUPABASE_SECRET_KEY` 또는 `SUPABASE_SERVICE_ROLE_KEY`에 넣습니다. 서버 전용 credential은 절대 `NEXT_PUBLIC_*`로 노출하거나 Git에 커밋하지 않습니다.

주요 화면:

- `/courses`
- `/courses/001-foundations`
- `/courses/001-foundations/010-overview`
- `/questions/001-foundations`
- `/questions/001-foundations/010-basics`
- `/login`
- `/progress`
- `/api/content/health`
- `/api/questions/health`

## 저장소 역할

| 저장소 | 역할 |
|---|---|
| [`github-certification-learning-system`](https://github.com/MetaStudy999/github-certification-learning-system) | 학습 콘텐츠 Source of Truth — 001~006, 문제은행, 모의고사, 실습, 증빙, 포트폴리오 |
| `github-certification-learning-system-web` | Web Application — 학습 UI, Question/Training Engine, AI Tutor, RAG, 사용자 Progress, GitHub Verification |

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

## Content Engine

```text
GCLS Content Repository
        ↓
Content Provider
   ├─ local
   ├─ github
   └─ auto = Local First → GitHub Fallback
        ↓
001 GitHub Foundations / GH-900
        ↓
15 Standard Modules
        ↓
README.md → Markdown/GFM → Learning UI
```

학습 본문과 문제 원문은 Web DB나 TypeScript에 복제하지 않습니다. Web은 실행 시 메인 콘텐츠 저장소를 읽습니다.

## User / Progress

```text
Supabase Auth
     ↓
auth.users
     ↓
learner_profiles
     │
     ├─ course_progress
     ├─ module_progress
     └─ study_sessions
          ↓
       RLS
          ↓
사용자별 학습 Dashboard
```

- 이메일 가입/로그인
- 신규 Auth 사용자 → Learner Profile 자동 생성
- GH-900 15개 모듈 방문 및 완료 기록
- 과정 완료 개수와 진행률 계산
- 학습 세션 시작/종료 및 시간 기록
- RLS(Row Level Security)로 사용자 간 데이터 격리

## Question Bank

```text
GH-900 Q001–Q100
       ↓
Markdown Question Parser
       ↓
Public Question
정답·해설 제외
       ↓
Question UI
       ↓
Server-side Evaluation
       ↓
question_attempts
       ↓
RLS + Score / Accuracy
       ↓
P5 Wrong Answer Engine
```

- 10개 세트 × 10문항 = **100문항**
- 메인 콘텐츠의 두 Markdown 표기 형식을 모두 파싱
- 최초 문제 화면에는 정답·해설을 전달하지 않음
- 답 제출 후 서버가 Source of Truth를 다시 읽어 판정
- Attempt 기록은 server-only credential로 저장
- Browser는 자신의 Attempt SELECT만 가능하며 직접 INSERT는 차단
- 사용자 간 Attempt 데이터는 RLS로 격리

## AI 모드

| Mode | 역할 |
|---|---|
| `mock` | 외부 서비스 없이 결정론적 개발/테스트 |
| `local` | Ollama |
| `api` | OpenAI API |
| `hybrid` | Ollama 우선, 실패 시 OpenAI API fallback |

## P4 검증 결과

GitHub Actions Ubuntu 24.04에서 다음을 검증했습니다.

- `npm ci` / Static Verify / TypeScript PASS
- Supabase Local P3 + P4 migration / `db reset` PASS
- Next.js Build / Production Runtime PASS
- GH-900 **10 Question Sets / 100 Questions** PASS
- Q001–Q100 두 Markdown 형식 파싱 PASS
- 최초 HTML 정답 비노출 PASS
- Correct / Incorrect 서버 판정 PASS
- `question_attempts` 저장 PASS
- Browser 직접 Attempt INSERT 차단 PASS
- 사용자 2명 간 Attempt RLS 격리 PASS
- P3 Auth / Progress 회귀검사 PASS
- Local / GitHub Content Provider 회귀검사 PASS

상세: [P4 Verification](./docs/development/100-p4-verification.md)

## 문서 맵

- [Architecture](./docs/architecture/README.md)
- [ADR](./docs/adr/README.md)
- [Development](./docs/development/README.md)
- [P1 Local Environment](./docs/development/030-p1-local-environment.md)
- [P1 Verification](./docs/development/040-p1-verification.md)
- [P2 Content Engine](./docs/development/050-p2-content-engine.md)
- [P2 Verification](./docs/development/060-p2-verification.md)
- [P3 User / Progress](./docs/development/070-p3-user-progress.md)
- [P3 Verification](./docs/development/080-p3-verification.md)
- [P4 Question Bank](./docs/development/090-p4-question-bank.md)
- [P4 Verification](./docs/development/100-p4-verification.md)

## 현재 상태

| 단계 | 상태 |
|---|---|
| P0 Architecture | **COMPLETE** |
| P1 Local Environment | **COMPLETE** |
| P2 Content Engine | **COMPLETE** |
| P3 User / Progress | **COMPLETE** |
| P4 Question Bank | **COMPLETE** |
| P5 Wrong Answer Engine | **NEXT** |
| P6 Mock / Readiness | PLANNED |
| P7 AI Gateway / Tutor | PLANNED |
| P8 RAG | PLANNED |
| P9 Labs / GitHub API | PLANNED |
| P10 Evidence / Portfolio | PLANNED |
