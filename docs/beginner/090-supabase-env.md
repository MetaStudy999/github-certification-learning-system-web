# 090 Supabase 환경값 연결 (Supabase Environment, SE)

## 빠른 시작

Supabase Local 상태에서 URL과 Key를 확인해 `.env.local`에 넣습니다.

```bash
npm run supabase:status
```

더 명확한 환경변수 형식이 필요하면:

```bash
npx --yes supabase@2.115.0 status -o env
```

## `.env.local`에 연결할 값

```env
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<local ANON_KEY 또는 publishable key>
SUPABASE_SERVICE_ROLE_KEY=<local SERVICE_ROLE_KEY>
SUPABASE_SECRET_KEY=<local SECRET_KEY>
```

### 중요한 구분

`NEXT_PUBLIC_` 접두어가 붙은 값은 Browser에서 볼 수 있는 값입니다.

다음 값에는 **절대** `NEXT_PUBLIC_`을 붙이지 않습니다.

- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_SECRET_KEY`
- `OPENAI_API_KEY`
- `RAG_INDEX_TOKEN`
- `GITHUB_TOKEN_ENCRYPTION_KEY`

## 확인

환경파일 내용을 화면에 공유하거나 GitHub Issue/Discord에 붙여 넣지 마세요. Key 자체는 비밀로 취급합니다.

## 서버 재시작 원칙

`.env.local`을 바꾼 뒤 Web server가 이미 실행 중이었다면 server를 종료하고 다시 시작합니다.

## PASS 기준

- URL 입력 완료
- publishable/anon key 입력 완료
- server-only key 입력 완료
- Secret을 Git에 Commit하지 않음

다음: [100 Database Reset](./100-database-reset.md)
