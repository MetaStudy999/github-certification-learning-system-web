# 080 Supabase Local 시작 (Supabase Start, SS)

## 빠른 시작

Docker-compatible runtime이 먼저 실행 중이어야 합니다.

```bash
cd ~/workspace/gcls/github-certification-learning-system-web
npm run supabase:start
```

## 1. Docker 확인

```bash
docker info
```

오류 없이 Docker 정보가 출력되어야 합니다.

## 2. Supabase 시작

```bash
npm run supabase:start
```

실제 실행 명령은 프로젝트에 고정된 Supabase CLI 2.115.0을 사용합니다.

처음 실행은 필요한 Container Image 다운로드 때문에 시간이 더 걸릴 수 있습니다.

## 3. 상태 확인

```bash
npm run supabase:status
```

API URL, DB URL, local key 정보 등이 출력되면 정상입니다.

기본 API 주소:

```text
http://127.0.0.1:54321
```

기본 DB port:

```text
54322
```

## 문제 해결

### Docker daemon 오류

Docker Desktop/OrbStack을 먼저 실행한 뒤 다시 시도합니다.

### Port already in use

54320~54324 근처 port를 다른 프로그램 또는 이전 Supabase container가 사용 중인지 확인합니다.

먼저:

```bash
npm run supabase:stop
npm run supabase:start
```

## PASS 기준

```bash
npm run supabase:status
```

이 정상 출력된다.

다음: [090 Supabase 환경값 연결](./090-supabase-env.md)
