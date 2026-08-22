# 170 Verify와 문제 해결 (Verification & Troubleshooting, VT)

## 빠른 시작

Web Repository에서:

```bash
npm run verify
npm run typecheck
```

Web이 실행 중이라면 Runtime까지 확인할 수 있습니다.

```bash
VERIFY_RUNNING=1 npm run verify
```

RAG Index도 ready인 상태에서:

```bash
VERIFY_RUNNING=1 VERIFY_RAG=1 npm run verify
```

## Verify가 확인하는 것

- Node version
- 필수 프로젝트 파일
- Content Repository 위치
- GH-900 Terms/Labs/Question/Mock Source
- 실행 중인 App Health
- 15개 Course modules
- Q001~Q100
- 120 Mock questions
- AI provider health
- GitHub Labs page
- 선택: RAG readiness
- P10 Evidence/Portfolio 파일과 화면

## 기본 진단 순서

문제가 생기면 무작정 재설치하지 말고 다음 순서로 확인합니다.

```text
1. 현재 경로
2. Git 상태
3. Node/npm
4. Docker
5. Supabase status
6. .env.local
7. TypeScript
8. Web health
9. Verify
```

### 1. 현재 경로

```bash
pwd
```

### 2. Git 상태

```bash
git status
```

### 3. Node

```bash
node --version
npm --version
```

### 4. Docker

```bash
docker info
```

### 5. Supabase

```bash
npm run supabase:status
```

### 6. TypeScript

```bash
npm run typecheck
```

### 7. Web Health

```bash
curl http://127.0.0.1:3000/api/health
```

## 흔한 문제

### Content Repo를 찾지 못함

두 Repo가 sibling인지 확인합니다.

```bash
cd ~/workspace/gcls
ls
```

### `.env.local` 변경이 반영되지 않음

Web server를 `Ctrl+C`로 종료하고 `npm run dev`를 다시 실행합니다.

### Supabase port 충돌

```bash
npm run supabase:stop
npm run supabase:start
```

### RAG profile mismatch

Embedding provider/model/dimension을 바꾼 뒤 기존 Index와 벡터 공간이 달라진 경우입니다. 같은 profile로 다시 Index를 생성합니다.

## PASS 기준

최소:

```bash
npm run verify
npm run typecheck
```

모두 오류 없이 종료.

다음: [180 종료·재시작·업데이트](./180-stop-restart-update.md)
