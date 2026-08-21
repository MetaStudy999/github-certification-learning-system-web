# 010 로컬 개발 기준 (Local Development Standard, LDS)

## 빠른 시작 (Quick Start, QS)

P1에서 이 문서를 실제 실행 명령과 Verify 절차로 확장합니다. P0에서는 환경 계약을 먼저 고정합니다.

## 목차 (Table of Contents, TOC)

1. 개발 환경 계약
2. 권장 Workspace
3. 환경변수 그룹
4. Verify 원칙

## 1. 개발 환경 계약

필수:
- Git
- Node.js LTS 계열 — P1 착수 시 정확한 버전 pin
- npm/pnpm 중 하나 — P1에서 확정
- Docker-compatible runtime
- Supabase CLI

선택:
- Ollama
- LM Studio
- OpenAI API Key

## 2. 권장 Workspace

```text
workspace/
├── github-certification-learning-system/
└── github-certification-learning-system-web/
```

## 3. 환경변수 그룹

```text
APP_*
DATABASE_*/SUPABASE_*
GCLS_CONTENT_*
AI_*
LOCAL_AI_*
OPENAI_*
GITHUB_*
```

`.env.example`에는 키 이름과 예시만 두고 실제 Secret은 commit하지 않습니다.

## 4. Verify 원칙

P1부터 모든 개발환경 문서는 다음을 포함합니다.

```text
Install
→ Start
→ Health Check
→ Test
→ Verify PASS/FAIL
→ Troubleshooting
```

'실행된다'가 아니라 재현 가능한 명령과 예상 결과를 완료 기준으로 사용합니다.
