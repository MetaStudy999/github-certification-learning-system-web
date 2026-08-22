# 110 Web 실행 (Run Web, RW)

## 빠른 시작

```bash
cd ~/workspace/gcls/github-certification-learning-system-web
npm run dev
```

## 1. 실행 전 확인

다음 세 가지가 먼저 완료되어야 합니다.

- `npm ci` 완료
- Supabase Local 실행 중
- `.env.local`에 Supabase URL/Key 설정

확인:

```bash
npm run supabase:status
```

## 2. 개발 서버 실행

```bash
npm run dev
```

정상적으로 시작되면 터미널에 Local URL이 표시됩니다.

기본 접속 주소:

```text
http://localhost:3000
```

또는:

```text
http://127.0.0.1:3000
```

## 3. 브라우저 확인

브라우저 주소창에 다음을 입력합니다.

```text
http://localhost:3000
```

GCLS Web 메인 화면이 나오면 성공입니다.

## 4. Health Check

새 터미널을 열고:

```bash
curl http://127.0.0.1:3000/api/health
```

HTTP 응답이 정상이어야 합니다.

## 종료

Web server가 실행된 터미널에서:

```text
Ctrl + C
```

## 문제 해결

### Port 3000 already in use

다른 Next.js/Web server가 3000을 사용하고 있을 수 있습니다. 기존 server를 종료한 뒤 다시 실행합니다.

### Supabase 연결 필요 화면

`.env.local`의 `NEXT_PUBLIC_SUPABASE_URL`과 `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`를 다시 확인하고 Web server를 재시작합니다.

## PASS 기준

- 메인 페이지 접속 성공
- `/api/health` 정상

다음: [120 회원가입·로그인](./120-login.md)
