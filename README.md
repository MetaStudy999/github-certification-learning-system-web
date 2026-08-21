# GitHub 자격증 통합 학습 웹 시스템 (GitHub Certification Learning System Web, GCLS Web)

GitHub 자격증 학습 콘텐츠를 웹 기반 **학습·훈련·평가·실습·AI 튜터·증빙·포트폴리오** 경험으로 제공하는 애플리케이션입니다.

> **현재 단계 (Current Phase, CP): P1 COMPLETE → P2 NEXT**  
> P0 Architecture Baseline과 P1 Local Development Environment를 완료했습니다. 다음 단계는 메인 콘텐츠 저장소를 읽는 P2 Content Engine입니다.

## 빠른 시작 (Quick Start, QS)

1. [시스템 개요](./docs/architecture/010-system-overview.md)를 읽습니다.
2. [로컬 아키텍처](./docs/architecture/020-local-architecture.md)에서 1단계 구조를 확인합니다.
3. [P1 로컬 개발환경](./docs/development/030-p1-local-environment.md)의 실행 절차를 확인합니다.
4. `npm ci` 후 `npm run bootstrap`을 실행합니다.
5. `npm run supabase:start`로 로컬 데이터 계층을 시작합니다.
6. `npm run dev` 후 `VERIFY_RUNNING=1 npm run verify`로 실행 상태를 확인합니다.

## 저장소 역할

| 저장소 | 역할 |
|---|---|
| [`github-certification-learning-system`](https://github.com/MetaStudy999/github-certification-learning-system) | 학습 콘텐츠 Source of Truth — 001~006 과정, 문제은행, 모의고사, 실습, 증빙, 포트폴리오 |
| `github-certification-learning-system-web` | 웹 애플리케이션 — 학습 UI, Training Engine, AI Tutor, RAG, 사용자 Progress, GitHub Verification |

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

## P1 실행 골격

```text
Browser
  ↓
Next.js 16
  ├─ GET /api/health
  └─ AI Provider Factory
       ├─ Mock
       ├─ Ollama
       ├─ OpenAI API
       └─ Hybrid: Ollama → OpenAI fallback

Supabase Local
  └─ CLI-generated config.toml + PostgreSQL 17

GCLS Content Repository
  └─ P2에서 Content Adapter로 연결
```

## AI 모드

`.env.local`의 `AI_MODE`로 전환합니다.

| Mode | 역할 |
|---|---|
| `mock` | 외부 서비스 없이 결정론적 개발/테스트 |
| `local` | Ollama 사용 |
| `api` | OpenAI API 사용 |
| `hybrid` | Ollama 우선, 실패 시 OpenAI API fallback |

비밀키는 서버 환경변수에만 두고 Git에 커밋하지 않습니다.

## P1 검증 결과

GitHub Actions의 깨끗한 Ubuntu 24.04 환경에서 다음을 검증했습니다.

- `npm ci` PASS
- `npm run verify` PASS
- `npm run typecheck` PASS
- `npm run build` PASS
- Next.js 실제 서버 기동 PASS
- `/api/health` PASS
- Mock AI `/api/ai/health` 및 `/api/ai/demo` PASS
- `VERIFY_RUNNING=1 npm run verify` PASS
- Supabase Local `start → status → stop` PASS

상세: [P1 Verification](./docs/development/040-p1-verification.md)

## 문서 맵

- [Architecture](./docs/architecture/README.md)
- [ADR — Architecture Decision Records](./docs/adr/README.md)
- [Development](./docs/development/README.md)
- [P1 Local Environment](./docs/development/030-p1-local-environment.md)
- [P1 Verification](./docs/development/040-p1-verification.md)

## 핵심 원칙

- 콘텐츠와 애플리케이션을 분리합니다.
- 메인 콘텐츠 저장소를 학습 콘텐츠의 Source of Truth로 유지합니다.
- 1단계는 완전한 Local Development를 지원합니다.
- AI는 Mock / Local / API / Hybrid 모드를 지원합니다.
- PostgreSQL을 1~3단계의 공통 데이터베이스 기준으로 유지합니다.
- Provider / Adapter 경계를 두어 특정 AI·Cloud 공급자 종속을 최소화합니다.
- GH-900을 최초 Vertical Slice로 완성한 뒤 002~006 과정으로 확장합니다.

## 현재 상태

| 단계 | 상태 |
|---|---|
| P0 Architecture | **COMPLETE** |
| P1 Local Environment | **COMPLETE** |
| P2 Content Engine | **NEXT** |
| P3 User / Progress | PLANNED |
| P4 Question Bank | PLANNED |
| P5 Wrong Answer Engine | PLANNED |
| P6 Mock / Readiness | PLANNED |
| P7 AI Gateway / Tutor | PLANNED |
| P8 RAG | PLANNED |
| P9 Labs / GitHub API | PLANNED |
| P10 Evidence / Portfolio | PLANNED |
