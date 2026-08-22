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

`.env.local`을 바꾼 뒤 Web server가 이미 실행 중이었다면 기존 server를 종료하고 다시 시작합니다.

환경변수는 Web server가 시작될 때 읽히는 값이 있으므로, `.env.local`을 수정한 뒤 **Browser 새로고침만 하는 것으로 끝내지 않고 개발 server를 재시작하는 것을 권장**합니다.

### 1. 실행 중인 개발 server 종료

`npm run dev`가 실행 중인 터미널로 이동합니다.

키보드에서 다음을 누릅니다.

```text
Ctrl + C
```

터미널에 명령을 다시 입력할 수 있는 Prompt가 나타나면 server가 종료된 것입니다.

> 개발 server가 실행 중이지 않았다면 이 단계는 건너뛰어도 됩니다.

### 2. 프로젝트 폴더인지 확인

새 명령은 프로젝트의 `package.json`이 있는 폴더에서 실행해야 합니다.

```bash
pwd
ls package.json
```

`package.json`이 표시되면 다음 단계로 진행합니다.

### 3. 개발 server 다시 시작

```bash
npm run dev
```

정상적으로 시작되면 Next.js가 Local 주소를 표시합니다.

예시:

```text
▲ Next.js
- Local: http://localhost:3000
```

표시되는 버전이나 부가 메시지는 설치된 Next.js 버전에 따라 조금 다를 수 있습니다.

### 4. Browser에서 다시 확인

Browser에서 다음 주소를 엽니다.

```text
http://localhost:3000
```

이미 열어 두었다면 새로고침합니다.

정리하면 다음 순서입니다.

```text
.env.local 수정
      ↓
파일 저장
      ↓
실행 중인 server에서 Ctrl + C
      ↓
npm run dev
      ↓
http://localhost:3000 접속
      ↓
변경된 환경값 적용 확인
```

### 5. `npm run dev`가 실행되지 않을 때

다음 오류가 보인다면 현재 위치부터 확인합니다.

```text
npm error Missing script: "dev"
```

또는 `package.json`을 찾을 수 없다는 오류가 나오면 프로젝트 폴더가 아닐 가능성이 큽니다.

```bash
pwd
ls
```

프로젝트 폴더로 이동한 뒤 다시 실행합니다.

```bash
npm run dev
```

`npm: command not found`가 나온다면 먼저 [050 Node.js와 npm](./050-node-npm.md) 단계로 돌아가 Node.js와 npm 설치를 완료합니다.

## PASS 기준

- URL 입력 완료
- publishable/anon key 입력 완료
- server-only key 입력 완료
- Secret을 Git에 Commit하지 않음
- `.env.local` 변경 후 필요하면 기존 개발 server를 `Ctrl + C`로 종료함
- `npm run dev`로 개발 server를 다시 시작할 수 있음
- `http://localhost:3000`에서 Web 화면을 확인할 수 있음

다음: [100 Database Reset](./100-database-reset.md)
