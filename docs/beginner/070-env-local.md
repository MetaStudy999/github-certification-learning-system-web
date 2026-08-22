# 070 환경파일 만들기 (`.env.local`)

## 빠른 시작

```bash
cd ~/workspace/gcls/github-certification-learning-system-web
cp .env.example .env.local
```

또는 프로젝트의 bootstrap script를 사용할 수 있습니다.

```bash
npm run bootstrap
```

`.env.local`이 없으면 `.env.example`을 복사하고 sibling Content Repo/Supabase 설정 상태도 안내합니다.

## 1. 파일 생성 확인

```bash
ls -la .env.local
```

## 2. 기본값 이해

초기 로컬 학습에서는 다음 구성이 가장 단순합니다.

```env
GCLS_CONTENT_PROVIDER=auto
GCLS_CONTENT_DIR=../github-certification-learning-system
AI_MODE=mock
RAG_EMBEDDING_MODE=mock
RAG_GROUNDING_MODE=required
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
```

Supabase Key는 080~090 단계에서 채웁니다.

## 3. Secret 주의

`.env.local`에는 실제 Secret이 들어갈 수 있습니다.

절대 다음을 하지 않습니다.

```bash
git add .env.local
```

실수로 Secret을 GitHub에 올렸다면 단순 삭제만 하지 말고 해당 Key/Token을 즉시 폐기·재발급해야 합니다.

## 4. 편집

VS Code:

```bash
code .env.local
```

또는 원하는 텍스트 편집기를 사용합니다.

## PASS 기준

- `.env.local` 존재
- Content 경로가 sibling Repo를 가리킴
- 아직 모르는 Secret은 빈 값으로 유지

다음: [080 Supabase Local 시작](./080-supabase-start.md)
