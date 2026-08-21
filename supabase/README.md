# Supabase Local

P1에서는 Supabase CLI의 **현재 버전이 생성하는 설정을 원본으로 사용**합니다. 수동으로 오래된 `config.toml`을 복제하지 않습니다.

## 초기화

```bash
npm run supabase:init
```

생성된 `supabase/config.toml`은 검토 후 이 브랜치에 커밋합니다.

## 실행

```bash
npm run supabase:start
npm run supabase:status
```

로컬 Stack은 개발 전용이며 외부 네트워크에 공개하지 않습니다.
