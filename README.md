# GitHub 자격증 통합 학습 웹 시스템 (GitHub Certification Learning System Web, GCLS Web)

GitHub 자격증 학습 콘텐츠를 웹 기반 **학습·훈련·평가·실습·AI 튜터·증빙·포트폴리오** 경험으로 제공하는 애플리케이션입니다.

> **현재 단계 (Current Phase, CP): P9 COMPLETE → P10 NEXT**  
> P0 Architecture부터 P9 Labs / GitHub API까지 GH-900 Vertical Slice를 완료했습니다. 다음 단계는 Evidence / Portfolio 통합입니다.

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

P8 RAG를 사용하려면 `RAG_INDEX_TOKEN`, `RAG_EMBEDDING_MODE`, `GCLS_CONTENT_VERSION`을 설정하고 Index를 생성합니다. P9 GitHub Lab은 `GITHUB_TOKEN_ENCRYPTION_KEY`를 설정한 뒤 `/labs/001-foundations`에서 학습용 Repository에 제한된 Fine-grained PAT를 연결합니다.

Server credential, `OPENAI_API_KEY`, `RAG_INDEX_TOKEN`, `GITHUB_TOKEN_ENCRYPTION_KEY`, GitHub Token은 절대 `NEXT_PUBLIC_*`에 넣거나 Git에 커밋하지 않습니다.

## 주요 화면 / API

- `/courses/001-foundations` — GH-900 15개 학습 모듈
- `/questions/001-foundations` — Q001–Q100 + RAG-grounded AI Tutor
- `/wrong-answers` — DAY_1 / DAY_7 Retry Queue
- `/mocks/001-foundations` — Mock 01 / 02 / Final
- `/readiness/001-foundations` — Exam Readiness Gate
- `/labs/001-foundations` — 실제 GitHub Lab Verification
- `/progress` — 개인별 학습 진행률
- `/login` — 학습자 Auth

P9 API:

- `/api/github/connection` — 암호화 GitHub Credential 연결/상태/삭제
- `/api/github/labs/verify` — GitHub Lab PASS/RETRY 검증
- `/api/github/labs/attempts` — 사용자 Lab Evidence 이력

## 저장소 역할

| 저장소 | 역할 |
|---|---|
| [`github-certification-learning-system`](https://github.com/MetaStudy999/github-certification-learning-system) | 학습 콘텐츠 Source of Truth |
| `github-certification-learning-system-web` | Learning / Assessment / AI-RAG / GitHub Verification / Evidence Application |

## 현재 학습 흐름

```text
GCLS Content Repository
        ↓
Learning Content
        ↓
Question Bank + Wrong Answer
        ↓
Mock + Exam Readiness
        ↓
RAG-grounded AI Tutor
        ↓
GitHub Labs
Repository → Branch → Commit → Issue → PR → Actions
        ↓
PASS / RETRY + Canonical Evidence URL
        ↓
P10 Evidence / Portfolio
```

## P9 Labs / GitHub API

P9는 Web이 GitHub 작업을 대신 수행하지 않고 학습자가 수행한 실제 결과를 **읽기 전용 REST API**로 검증합니다.

| Lab | 검증 |
|---:|---|
| 020 | Repository + Default Branch |
| 030 | 작업 Branch 존재 / 기본 Branch와 분리 |
| 040 | Issue + Branch + Commit + Commit-on-Branch + PR Head/Base + `Closes #Issue` |
| 080 | Actions Workflow + optional Run |

Local Credential 흐름:

```text
Fine-grained PAT
   ↓ GitHub /user validation
AES-256-GCM encryption
   ↓
github_connections
   ↓
GitHub REST verification
   ↓
lab_attempts / lab_verification_checks
```

권장 권한: 학습용 Repository만 선택하고 Contents / Issues / Pull requests / Actions를 Read로 부여합니다. Stage 2 Cloud에서는 GitHub App User Access Token으로 교체할 수 있도록 Credential 경계를 분리했습니다.

## 검증

P9 기능 커밋 기준 PASS:

- `GCLS Web Verify` — `32528772357`
- `GCLS Web P6 Verify` — `32528772282`
- `GCLS Web P7 Verify` — `32528772347`
- `GCLS Web P8 Verify` — `32528772297`
- `GCLS Web P9 Verify` — `32528772306`

P9 전용 CI는 실제 Token/외부 계정 대신 Fake GitHub REST Server로 Token 검증, 암호화 저장, GitHub Flow, Actions, RETRY, RLS를 검증합니다.

## 문서 맵

- [Architecture](./docs/architecture/README.md)
- [Development](./docs/development/README.md)
- [P8 RAG Grounding](./docs/development/170-p8-rag-grounding.md)
- [P8 Verification](./docs/development/180-p8-verification.md)
- [P9 Labs / GitHub API](./docs/development/190-p9-github-labs.md)
- [P9 Verification](./docs/development/200-p9-verification.md)

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
| P9 Labs / GitHub API | **COMPLETE** |
| P10 Evidence / Portfolio | **NEXT** |
