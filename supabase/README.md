# Supabase Local

Supabase Local은 GCLS Web 1단계의 PostgreSQL/Auth 개발환경입니다. 외부 네트워크에 공개하지 않습니다.

## 빠른 시작

```bash
npm run supabase:start
npm run supabase:status
npm run supabase:reset
```

`supabase/config.toml`은 Supabase CLI가 생성한 기준 설정을 유지합니다.

## P3 Migration

`supabase/migrations/`에는 사용자·학습 진행률 schema와 RLS 정책을 저장합니다.

```text
auth.users
  ↓
learner_profiles
  ├─ course_progress
  ├─ module_progress
  └─ study_sessions
```

새 migration을 추가한 후에는 다음으로 깨끗한 상태를 검증합니다.

```bash
npm run supabase:reset
```

## Browser Key

Local 개발에서는 `npm run supabase:status`가 출력하는 anon key를 `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`에 사용할 수 있습니다. 2단계 Supabase Cloud에서는 publishable key를 사용합니다.

Secret 또는 service-role key는 브라우저 환경변수에 넣지 않습니다.
