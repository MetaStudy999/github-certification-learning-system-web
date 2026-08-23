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

## Reset 전 Web 서버 확인

Web 개발 서버가 이미 실행 중이라면 입문자 과정에서는 잠시 중지한 뒤 Database Reset을 진행하는 것을 권장합니다.

Web 서버가 실행된 터미널에서:

```text
Ctrl + C
```

`Ctrl + C`는 `npm`을 삭제하거나 종료하는 명령이 아닙니다. 현재 터미널에서 실행 중인 Web server 프로세스를 중지합니다.

> Database Reset을 위해 Web 서버를 반드시 중지해야 하는 것은 아닙니다. 다만 Reset 중에는 DB 연결이 잠시 끊기거나 오류가 표시될 수 있으므로, 입문자 과정에서는 `중지 → Reset → 확인 → 재실행` 순서를 권장합니다.

## Supabase Local 실행 상태 확인

먼저 Local Supabase가 실행 중인지 확인합니다.

```bash
npm run supabase:status
```

Supabase가 실행 중이 아니라면 시작합니다.

```bash
npm run supabase:start
```

## Database Reset 실행

```bash
npm run supabase:reset
```

Reset이 끝난 후 다시 상태를 확인합니다.

```bash
npm run supabase:status
```

## Web 개발 서버 다시 실행하기

Database Reset과 상태 확인이 끝났다면 Web 개발 서버를 다시 실행합니다.

```bash
npm run dev
```

기본 접속 주소:

```text
http://localhost:3000
```

### Web 서버 실행·중지·재시작 한눈에 보기

| 목적 | 명령/방법 | 설명 |
| --- | --- | --- |
| Web 개발 서버 실행 | `npm run dev` | Next.js 개발 서버를 실행합니다. |
| Web 개발 서버 중지 | `Ctrl + C` | Web 서버가 실행 중인 터미널에서 누릅니다. |
| Web 개발 서버 재시작 | `Ctrl + C` → `npm run dev` | 별도의 `restart` 명령 없이 중지 후 다시 실행합니다. |
| Supabase Local 시작 | `npm run supabase:start` | Local Supabase 서비스를 시작합니다. |
| Supabase 상태 확인 | `npm run supabase:status` | Local Supabase 실행 상태를 확인합니다. |
| Supabase Local 중지 | `npm run supabase:stop` | Local Supabase 서비스를 중지합니다. |
| Database Reset | `npm run supabase:reset` | Local DB를 다시 만들고 migration을 재적용합니다. |

## `npm run dev`와 `npm run start`의 차이

이 입문자 과정에서는 일반적으로 다음 명령을 사용합니다.

```bash
npm run dev
```

- 개발하면서 사용하는 Web 서버입니다.
- 코드 변경 내용을 확인하기 편합니다.
- 이 과정의 기본 실행 명령입니다.

반면 다음 명령은 production(운영) 모드 실행용입니다.

```bash
npm run start
```

`npm run start`를 사용하려면 일반적으로 먼저 production build가 필요합니다.

```bash
npm run build
npm run start
```

따라서 현재 입문자 실습에서는 특별한 안내가 없는 한 `npm run dev`를 사용합니다.

## 전체 순서 따라하기

Web 서버가 이미 실행 중인 상태에서 Database Reset을 한다면 다음 순서로 진행합니다.

```text
1. Web 서버가 실행된 터미널에서 Ctrl + C
2. npm run supabase:status
3. 필요하면 npm run supabase:start
4. npm run supabase:reset
5. npm run supabase:status
6. npm run typecheck
7. npm run dev
```

## 확인

```bash
npm run typecheck
```

## PASS 기준

- `supabase:reset` 오류 없음
- migration 적용 완료
- Supabase status 정상
- `typecheck` 오류 없음
- Web 서버를 다시 실행했을 때 `http://localhost:3000` 접속 가능

다음: [110 Web 실행](./110-run-web.md)
