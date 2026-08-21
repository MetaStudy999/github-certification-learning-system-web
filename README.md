# GitHub 자격증 통합 학습 웹 시스템 (GitHub Certification Learning System Web, GCLS Web)

GitHub 자격증 학습 콘텐츠를 웹 기반 **학습·훈련·평가·실습·AI 튜터·증빙·포트폴리오** 경험으로 제공하는 애플리케이션입니다.

> **현재 단계 (Current Phase, CP): P0 — Architecture Baseline**  
> P0에서는 실행 코드보다 먼저 로컬 개발, AI, RAG, Training Engine, GitHub 연동, Cloud Evolution의 설계 기준을 고정합니다.

## 빠른 시작 (Quick Start, QS)

1. [시스템 개요](./docs/architecture/010-system-overview.md)를 읽습니다.
2. [로컬 아키텍처](./docs/architecture/020-local-architecture.md)에서 1단계 개발환경을 확인합니다.
3. [AI 아키텍처](./docs/architecture/040-ai-architecture.md)에서 Mock / Local / API / Hybrid 모드를 확인합니다.
4. [개발 로드맵](./docs/development/020-development-roadmap.md)에서 P0~P10 순서를 확인합니다.
5. P1에서 Next.js + Supabase Local 실행환경을 구축합니다.

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

## P0 문서 맵

- [Architecture](./docs/architecture/README.md)
- [ADR — Architecture Decision Records](./docs/adr/README.md)
- [Development](./docs/development/README.md)

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
| P0 Architecture | **IN PROGRESS** |
| P1 Local Environment | PLANNED |
| P2 Content Engine | PLANNED |
| P3 User / Progress | PLANNED |
| P4 Question Bank | PLANNED |
| P5 Wrong Answer Engine | PLANNED |
| P6 Mock / Readiness | PLANNED |
| P7 AI Gateway / Tutor | PLANNED |
| P8 RAG | PLANNED |
| P9 Labs / GitHub API | PLANNED |
| P10 Evidence / Portfolio | PLANNED |
