# 070 P3 사용자·진행률 (P3 User / Progress, P3-UP)

## 목표

P2에서 읽기 전용이던 GH-900 학습 화면을 **사용자별 상태를 기억하는 학습 시스템**으로 확장합니다.

## 빠른 시작

```bash
npm ci
cp .env.example .env.local
npm run supabase:start
npm run supabase:reset
npm run supabase:status
```

Local Supabase의 API URL과 anon key를 `.env.local`의 다음 값에 반영합니다.

```text
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<local anon key>
```

이후:

```bash
npm run dev
```

- 계정: `http://localhost:3000/login`
- 진행률: `http://localhost:3000/progress`
- GH-900: `http://localhost:3000/courses/001-foundations`

## 데이터 모델

```text
auth.users
   ↓
learner_profiles
   │
   ├─ course_progress
   ├─ module_progress
   └─ study_sessions
```

### learner_profiles

Supabase Auth 사용자와 1:1로 연결합니다. `auth.users` 생성 Trigger가 Profile을 자동 생성합니다.

### module_progress

- 과정/모듈 식별자
- `not_started / in_progress / completed`
- 첫 방문 / 최근 방문
- 완료 시각
- View Count

### course_progress

모듈 완료 개수를 바탕으로 과정 상태를 관리합니다. GH-900 최초 Slice에서는 총 15개 모듈을 기준으로 합니다.

### study_sessions

학습 시작/종료 시각과 학습 시간을 기록합니다.

## RPC

| RPC | 역할 |
|---|---|
| `record_module_visit` | 모듈 방문 및 과정 시작 기록 |
| `set_module_completion` | 완료/완료취소 및 과정 집계 |
| `start_study_session` | 학습 세션 시작 |
| `finish_study_session` | 종료 시각·지속시간 계산 |

## 보안 기준

모든 사용자 데이터 테이블에 RLS(Row Level Security)를 활성화합니다.

```text
User A → User A Progress만 읽기/쓰기
User B → User B Progress만 읽기/쓰기
Anon   → User Progress 접근 불가
```

Cloud 이전 시에도 같은 RLS 정책을 유지합니다. Secret/Service Role Key는 브라우저에 제공하지 않습니다.

## P3 완료 조건

- [x] Supabase Auth signup/login
- [x] Profile 자동 생성
- [x] Course / Module Progress
- [x] Study Session
- [x] Module 방문·완료 UI
- [x] Progress Dashboard
- [x] RLS 사용자 격리
- [x] Local migration/reset
- [x] P2 Content regression
