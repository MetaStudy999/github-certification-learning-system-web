# 100 Database Reset과 Migration 적용 (Database Reset, DR)

## 빠른 시작

```bash
cd ~/workspace/gcls/github-certification-learning-system-web
npm run supabase:reset
```

## 왜 Reset을 하는가

P3~P10에서 만든 Database schema, RLS, function이 `supabase/migrations/`에 있습니다.

```text
Supabase Local
   ↓ db reset
P3 User/Progress
P4 Question Bank
P5 Wrong Answer
P6 Mock/Readiness
P7 AI Audit
P8 pgvector/RAG
P9 GitHub Labs
P10 Evidence/Portfolio
```

`db reset`은 Local DB를 다시 만들고 migration을 순서대로 적용합니다.

## 주의

**Local 개발 DB의 기존 데이터는 삭제될 수 있습니다.**

실제 운영 Cloud DB에서 이 명령을 임의로 실행하면 안 됩니다.

## 실행

```bash
npm run supabase:reset
```

끝난 후:

```bash
npm run supabase:status
```

## 확인

```bash
npm run typecheck
```

## PASS 기준

- `supabase:reset` 오류 없음
- migration 적용 완료
- Supabase status 정상

다음: [110 Web 실행](./110-run-web.md)
