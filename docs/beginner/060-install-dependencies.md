# 060 의존성 설치 (Install Dependencies, ID)

## 빠른 시작

Web Repository 안으로 이동한 후 **`npm ci`**를 실행합니다.

```bash
cd ~/workspace/gcls/github-certification-learning-system-web
npm ci
```

## 왜 `npm install`보다 `npm ci`인가

이 프로젝트는 `package-lock.json`에 검증된 정확한 dependency version을 기록합니다.

```text
package.json
   +
package-lock.json
   ↓
npm ci
   ↓
동일한 의존성 재현
```

## 실행

```bash
pwd
```

현재 경로가 다음과 비슷해야 합니다.

```text
.../workspace/gcls/github-certification-learning-system-web
```

그 다음:

```bash
npm ci
```

## 예상 결과

여러 package가 설치된 뒤 오류 없이 shell prompt가 돌아옵니다.

`node_modules/` 폴더가 생성됩니다.

## 확인

```bash
npm run typecheck
```

TypeScript 오류 없이 종료되면 설치 상태가 좋습니다.

## 문제 해결

### `npm ERR!`

우선 Node 버전을 다시 확인합니다.

```bash
node --version
npm --version
```

그리고 인터넷 연결과 `package-lock.json` 존재 여부를 확인합니다.

```bash
ls package.json package-lock.json
```

## PASS 기준

- `npm ci` 오류 없음
- `npm run typecheck` PASS

다음: [070 환경파일 만들기](./070-env-local.md)
