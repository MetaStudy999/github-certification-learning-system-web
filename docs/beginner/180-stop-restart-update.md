# 180 종료·재시작·업데이트 (Stop, Restart & Update, SRU)

## 1. Web 종료

`npm run dev`가 실행 중인 터미널에서:

```text
Ctrl + C
```

## 2. Supabase 종료

```bash
npm run supabase:stop
```

PC를 종료하기 전에 반드시 필요한 명령은 아니지만 Local container를 명확히 정리할 때 사용합니다.

## 3. 다음 날 다시 시작

```bash
cd ~/workspace/gcls/github-certification-learning-system-web
npm run supabase:start
npm run supabase:status
npm run dev
```

Database를 매번 reset할 필요는 없습니다.

## 4. Repository 업데이트

두 Repo를 순서대로 최신화합니다.

```bash
cd ~/workspace/gcls/github-certification-learning-system
git status
git pull --ff-only
```

```bash
cd ~/workspace/gcls/github-certification-learning-system-web
git status
git pull --ff-only
npm ci
```

`--ff-only`는 예상치 못한 자동 merge commit을 만들지 않고 안전하게 fast-forward만 허용합니다.

## 5. Migration이 추가된 경우

개발 문서 또는 Release Note에서 DB reset이 필요하다고 안내할 때:

```bash
npm run supabase:reset
```

주의: Local 학습 데이터가 초기화될 수 있습니다.

## 6. Content가 변경된 경우 RAG

Content Repo commit이 바뀌면:

```bash
git -C ../github-certification-learning-system rev-parse HEAD
```

새 SHA로 `GCLS_CONTENT_VERSION`을 갱신하고 RAG Index를 다시 생성합니다.

## PASS 기준

- 종료 방법을 알고 있음
- 다음 날 재시작 가능
- `git pull --ff-only`로 두 Repo 업데이트 가능

다음: [190 전체 체크리스트](./190-full-checklist.md)
