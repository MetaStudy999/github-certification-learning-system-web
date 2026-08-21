# GitHub 자격증 통합 학습 웹 시스템 (GitHub Certification Learning System Web, GCLS Web)

GitHub 자격증 학습 콘텐츠를 웹 기반 **학습·훈련·평가·실습·AI 튜터·증빙·포트폴리오** 경험으로 제공하는 애플리케이션입니다.

> **현재 단계 (Current Phase, CP): P10 COMPLETE — GH-900 VERTICAL SLICE COMPLETE**  
> P0 Architecture부터 P10 Evidence / Portfolio까지 GitHub Foundations (GH-900) Vertical Slice를 완료했습니다. 다음 운영 단계는 **GH-900 실제 사용자 검증·UX 보강 → 002 GitHub Actions 확장**입니다.

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

Server credential, `OPENAI_API_KEY`, `RAG_INDEX_TOKEN`, `GITHUB_TOKEN_ENCRYPTION_KEY`, GitHub Token은 절대 `NEXT_PUBLIC_*`에 넣거나 Git에 커밋하지 않습니다. P10 Evidence Export에도 Secret/Token을 포함하지 않습니다.

## 주요 화면

- `/courses/001-foundations` — GH-900 15개 학습 모듈
- `/questions/001-foundations` — Q001–Q100 + RAG-grounded AI Tutor
- `/wrong-answers` — DAY_1 / DAY_7 Retry Queue
- `/mocks/001-foundations` — Mock 01 / 02 / Final
- `/readiness/001-foundations` — Exam Readiness Gate
- `/labs/001-foundations` — 실제 GitHub Lab Verification
- `/evidence/001-foundations` — GH-900 Evidence Package
- `/portfolio/001-foundations` — Portfolio Projection
- `/progress` — 개인별 학습 진행률
- `/login` — 학습자 Auth

## 저장소 역할

| 저장소 | 역할 |
|---|---|
| [`github-certification-learning-system`](https://github.com/MetaStudy999/github-certification-learning-system) | 학습 콘텐츠 Source of Truth |
| `github-certification-learning-system-web` | Learning / Assessment / AI-RAG / GitHub Verification / Evidence / Portfolio Application |

## GH-900 End-to-End 흐름

```text
GCLS Content Repository
        ↓
Learning Content
        ↓
Q001–Q100 Question Bank
        ↓
Wrong Answer DAY_1 → DAY_7
        ↓
Mock 01 → Mock 02 → Final Mock
        ↓
Exam Readiness Gate
        ↓
RAG-grounded AI Tutor
        ↓
GitHub Labs API Verification
        ↓
PASS / RETRY + Canonical GitHub Evidence
        ↓
P10 Evidence Package
        ↓
Portfolio Projection + JSON / Markdown Export
```

## P10 Evidence / Portfolio

P10은 기존 P3~P9 데이터를 현재 상태에서 다시 계산할 수 있는 **Evidence Snapshot**으로 묶습니다.

### 자동 검증 (SYSTEM_VERIFIED)

- Q001–Q100 Coverage
- Mock 01 / Mock 02 / Final Mock 목표 점수
- P9 Remote / Branch / GitHub Flow PASS
- Readiness / Wrong Answer / AI-RAG 지표
- Canonical GitHub Evidence URL

### 수동 증빙 (SELF_ATTESTED)

시스템이 독립적으로 확인할 수 없는 외부 사실은 별도로 기록합니다.

- Environment
- Git Basics / Local Lab
- Repository Documentation
- Project + Score
- 실제 Certification Exam Result
- Final Reflection

Manual Evidence는 `What / Why / Verify / Result` 구조로 저장하며 자동 검증과 명확히 구분합니다.

### CLEAR Candidate Gate

9개 Evidence Gate가 모두 충족되면 내부 상태를 `CLEAR_CANDIDATE`로 표시합니다. **이는 GCLS 내부 Evidence 완성도 판정이며 실제 GitHub 자격증 합격이나 공식 자격 상태를 자동 확정하지 않습니다.**

Export:

- JSON — machine-readable Evidence Package
- Markdown — human-readable Portfolio Snapshot

## 기술 성장 경로

```text
LEVEL 1 — LOCAL
Next.js + Supabase Local/PostgreSQL + pgvector + Ollama + OpenAI(optional)
        ↓
LEVEL 2 — MVP CLOUD
Vercel + Supabase Cloud + GitHub App + OpenAI
        ↓
LEVEL 3 — PRODUCTION CLOUD
AWS 또는 GCP
```

## 문서 맵

- [Architecture](./docs/architecture/README.md)
- [Development](./docs/development/README.md)
- [P9 Labs / GitHub API](./docs/development/190-p9-github-labs.md)
- [P9 Verification](./docs/development/200-p9-verification.md)
- [P10 Evidence / Portfolio](./docs/development/210-p10-evidence-portfolio.md)
- [P10 Verification](./docs/development/220-p10-verification.md)

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
| P10 Evidence / Portfolio | **COMPLETE** |

**GH-900 Vertical Slice: COMPLETE.** 다음 확장 순서는 실제 사용자 검증과 UX 안정화 후 `002-actions`입니다.
