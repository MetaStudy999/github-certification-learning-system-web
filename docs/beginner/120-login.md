# 120 회원가입·로그인 (Sign Up & Login, AUTH)

## 빠른 시작

Web server 실행 후 다음 주소를 엽니다.

```text
http://localhost:3000/login
```

## 1. 계정 만들기

화면에 다음 값을 입력합니다.

- 표시 이름
- 이메일
- 비밀번호 — 최소 6자

그 다음 **계정 만들기**를 누릅니다.

Local Supabase 환경에서는 정상이라면 바로 로그인 상태가 되고 `/progress`로 이동합니다.

## 2. 로그인

기존 계정이면 이메일/비밀번호를 입력하고 **로그인**을 누릅니다.

정상 로그인 후:

```text
/progress
```

화면으로 이동합니다.

## 3. 로그인 확인

다음 주소를 직접 열어도 됩니다.

```text
http://localhost:3000/progress
```

개인별 학습 진행률 화면이 보이면 정상입니다.

## 4. 로그아웃

`/login` 화면에서 로그인 상태일 때 **로그아웃** 버튼을 사용할 수 있습니다.

## 문제 해결

### `Supabase 연결 필요`

`.env.local`의 다음 값을 확인합니다.

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

수정했다면 `npm run dev`를 다시 시작합니다.

### 계정을 만들었는데 로그인되지 않음

Supabase Local이 실행 중인지 확인합니다.

```bash
npm run supabase:status
```

## PASS 기준

- Local 계정 생성 성공
- `/progress` 접근 성공
- 로그아웃/재로그인 가능

다음: [130 GH-900 학습 흐름](./130-gh900-learning.md)
