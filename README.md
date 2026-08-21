# GitHub 자격증 통합 학습 웹 시스템 (GitHub Certification Learning System Web, GCLS Web)

GitHub 자격증 학습 콘텐츠를 웹 기반 **학습·훈련·평가·실습·AI 튜터·증빙·포트폴리오** 경험으로 제공하는 애플리케이션입니다.

> **현재 단계 (Current Phase, CP): P2 COMPLETE → P3 NEXT**  
> P0 Architecture, P1 Local Environment, P2 Content Engine을 완료했습니다. 다음 단계는 사용자별 학습 상태를 저장하는 P3 User / Progress입니다.

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
npm run dev
```

학습 화면:

- `/courses`
- `/courses/001-foundations`
- `/courses/001-foundations/010-overview`
- `/api/content/health`

## 저장소 역할

| 저장소 | 역할 |
|---|---|
| [`github-certification-learning-system`](https://github.com/MetaStudy999/github-certification-learning-system) | 학습 콘텐츠 Source of Truth — 001~006, 문제은행, 모의고사, 실습, 증빙, 포트폴리오 |
| `github-certification-learning-system-web` | Web Application — 학습 UI, Training Engine, AI Tutor, RAG, Progress, GitHub Verification |

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
README.md
        ↓
React Markdown + GFM
        ↓
Learning UI
```

학습 본문은 Web DB나 TypeScript에 복제하지 않습니다. Web은 실행 시 메인 콘텐츠 저장소를 읽습니다.

## AI 모드

| Mode | 역할 |
|---|---|
| `mock` | 외부 서비스 없이 결정론적 개발/테스트 |
| `local` | Ollama |
| `api` | OpenAI API |
| `hybrid` | Ollama 우선, 실패 시 OpenAI API fallback |

## P2 검증 결과

GitHub Actions Ubuntu 24.04에서 다음을 검증했습니다.

- `npm ci` PASS
- Static Verify PASS
- TypeScript PASS
- Next.js Build PASS
- Next.js production runtime PASS
- Local Content Provider PASS
- GH-900 **15 modules** 탐색 PASS
- `/api/content/health` PASS
- Course page PASS
- `010-overview` Markdown/GFM render PASS
- GitHub Provider fallback PASS
- AI Mock regression PASS
- Supabase Local `start → status → stop` regression PASS

상세: [P2 Verification](./docs/development/060-p2-verification.md)

## 문서 맵

- [Architecture](./docs/architecture/README.md)
- [ADR](./docs/adr/README.md)
- [Development](./docs/development/README.md)
- [P1 Local Environment](./docs/development/030-p1-local-environment.md)
- [P1 Verification](./docs/development/040-p1-verification.md)
- [P2 Content Engine](./docs/development/050-p2-content-engine.md)
- [P2 Verification](./docs/development/060-p2-verification.md)

## 현재 상태

| 단계 | 상태 |
|---|---|
| P0 Architecture | **COMPLETE** |
| P1 Local Environment | **COMPLETE** |
| P2 Content Engine | **COMPLETE** |
| P3 User / Progress | **NEXT** |
| P4 Question Bank | PLANNED |
| P5 Wrong Answer Engine | PLANNED |
| P6 Mock / Readiness | PLANNED |
| P7 AI Gateway / Tutor | PLANNED |
| P8 RAG | PLANNED |
| P9 Labs / GitHub API | PLANNED |
| P10 Evidence / Portfolio | PLANNED |
