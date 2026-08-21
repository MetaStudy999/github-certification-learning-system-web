# 030 P1 로컬 개발환경 (P1 Local Development Environment, P1-LDE)

## 목표

P1의 완료 조건은 문서가 아니라 **새 PC에서 재현 가능한 실행환경**입니다.

## 기준 버전

- Node.js: 22 LTS 계열
- Next.js: 16.3.1
- React / React DOM: 19.2.8
- TypeScript: 7.0.2
- Supabase CLI invocation: 2.115.0

패키지 버전은 `package.json`과 npm script에서 고정합니다.

## 빠른 시작

```bash
npm install
npm run bootstrap
npm run supabase:init
npm run supabase:start
npm run dev
```

다른 터미널에서:

```bash
VERIFY_RUNNING=1 npm run verify
npm run typecheck
npm run build
```

## AI 모드

`.env.local`의 `AI_MODE`를 사용합니다.

```text
mock   → 외부 서비스 없이 UI/기능 개발
local  → Ollama
api    → OpenAI API
hybrid → Ollama 우선, 실패 시 OpenAI fallback
```

OpenAI Key는 서버 환경변수 `OPENAI_API_KEY`에만 저장하고 `NEXT_PUBLIC_` 접두사를 사용하지 않습니다.

## Local AI

Ollama 기본 주소:

```text
http://127.0.0.1:11434
```

모델명은 고정하지 않고 개발 머신에 맞춰 `OLLAMA_MODEL`로 지정합니다.

## API 확인

```text
GET  /api/health
GET  /api/ai/health
POST /api/ai/demo
```

`/api/ai/demo`는 P1 로컬 개발 검증용이며 운영 배포 전에 인증·rate limit·사용량 정책을 추가해야 합니다.

## P1 Merge Gate

- [ ] `npm install` 완료 및 `package-lock.json` 커밋
- [ ] `npm run supabase:init` 생성 `supabase/config.toml` 커밋
- [ ] `npm run typecheck` PASS
- [ ] `npm run build` PASS
- [ ] `npm run verify` PASS
- [ ] `VERIFY_RUNNING=1 npm run verify` PASS
- [ ] `GET /api/ai/health` mock mode PASS
- [ ] Ollama 사용 시 local mode 확인
- [ ] API 사용 시 비밀키가 Git에 포함되지 않았는지 확인

P1은 위 Gate를 통과하기 전 `main`에 병합하지 않습니다.
