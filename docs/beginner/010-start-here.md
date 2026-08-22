# 010 처음 시작하기 (Start Here, SH)

## 빠른 시작 (Quick Start, QS)

이 매뉴얼은 **빈 컴퓨터에서 Clone → 설치 → 실행 → 검증**까지 진행하는 순서입니다.

## 목차

1. 무엇을 설치하는가
2. 두 Repository의 관계
3. 전체 단계
4. 절대 하지 말아야 할 것

## 1. 무엇을 설치하는가

GCLS Web은 GitHub Foundations(GH-900)를 학습하기 위한 로컬 Web 애플리케이션입니다.

주요 구성:

- Git — Repository를 Clone/Update
- Node.js 22+ — Web 실행 환경
- npm — JavaScript 의존성 설치
- Docker-compatible runtime — Supabase Local 실행
- Supabase Local — Auth/PostgreSQL/pgvector
- 선택: Ollama 또는 OpenAI API — AI Tutor

## 2. 두 Repository의 관계

```text
Content Repository
github-certification-learning-system
        ↓ 읽기
Web Repository
github-certification-learning-system-web
```

Web은 학습 콘텐츠를 복사해서 관리하지 않고 Content Repository를 Source of Truth로 읽습니다.

## 3. 전체 단계

```text
Clone
→ Git 확인
→ Node/npm 확인
→ npm ci
→ .env.local
→ Supabase start
→ Supabase key 연결
→ db reset
→ npm run dev
→ login
→ GH-900 학습
→ AI/RAG
→ GitHub Labs
→ Evidence/Portfolio
→ Verify
```

## 4. 절대 하지 말아야 할 것

다음 값은 GitHub에 Commit하지 않습니다.

- `OPENAI_API_KEY`
- Supabase server/service-role credential
- `RAG_INDEX_TOKEN`
- `GITHUB_TOKEN_ENCRYPTION_KEY`
- GitHub PAT

실제 Secret은 `.env.local`에만 둡니다.

## PASS 기준

- 전체 흐름이 무엇인지 이해했다.
- Content Repo와 Web Repo의 역할을 구분할 수 있다.

다음: [020 사전 준비](./020-prerequisites.md)
