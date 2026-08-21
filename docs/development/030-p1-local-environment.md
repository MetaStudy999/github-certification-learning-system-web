# 030 P1 로컬 개발환경 (P1 Local Development Environment, P1-LDE)

## 목표

P1의 완료 조건은 문서가 아니라 **새 환경에서 재현 가능한 실행환경**입니다.

## 기준 버전

- Node.js: 22 LTS 계열
- Next.js: 16.3.1
- React / React DOM: 19.2.8
- TypeScript: 7.0.2
- Supabase CLI invocation: 2.115.0
- Supabase Local PostgreSQL: 17

패키지 버전은 `package.json`과 `package-lock.json`에서 고정합니다.

## 빠른 시작

```bash
npm ci
npm run bootstrap
npm run supabase:start
npm run dev
```

다른 터미널에서:

```bash
VERIFY_RUNNING=1 npm run verify
npm run typecheck
npm run build
```

신규 Supabase 설정을 다시 생성해야 하는 경우에만 다음을 사용합니다.

```bash
npm run supabase:init
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

모델명은 고정하지 않고 개발 머신에 맞춰 `OLLAMA_MODEL`로 지정합니다. 실제 모델 품질·속도·GPU 최적화는 P7 AI Gateway / Tutor 단계에서 별도 검증합니다.

## API 확인

```text
GET  /api/health
GET  /api/ai/health
POST /api/ai/demo
```

`/api/ai/demo`는 P1 로컬 개발 검증용이며 운영 배포 전에 인증·rate limit·사용량 정책을 추가해야 합니다.

## P1 Merge Gate

- [x] `package-lock.json` 생성 및 커밋
- [x] Supabase CLI 2.115.0 생성 `supabase/config.toml` 커밋
- [x] `npm ci` PASS
- [x] `npm run typecheck` PASS
- [x] `npm run build` PASS
- [x] `npm run verify` PASS
- [x] `VERIFY_RUNNING=1 npm run verify` PASS
- [x] `GET /api/ai/health` mock mode PASS
- [x] `POST /api/ai/demo` Mock Provider PASS
- [x] Supabase Local `start → status → stop` PASS
- [x] OpenAI 비밀키가 Client/Public 변수로 노출되지 않도록 구성
- [ ] 실제 Ollama 모델별 품질/성능 검증 — P7에서 수행
- [ ] 실제 OpenAI 모델별 품질/비용 검증 — P7에서 수행

P1의 **환경·구동·Provider 경계 검증은 완료**했습니다. 모델 자체의 품질 검증은 P7 책임으로 분리합니다.

상세 검증 증빙: [`040-p1-verification.md`](./040-p1-verification.md)
