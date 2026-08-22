# 150 GitHub Labs 설정 (GitHub Labs, GL)

## 빠른 시작

P9는 GitHub 작업을 대신 수행하지 않습니다. 사용자가 실제 GitHub에서 수행한 결과를 **읽기 전용 API**로 검증합니다.

## 1. Encryption Key 생성

macOS/Linux/WSL2:

```bash
openssl rand -base64 32
```

출력값을 `.env.local`에 넣습니다.

```env
GITHUB_API_BASE_URL=https://api.github.com
GITHUB_TOKEN_ENCRYPTION_KEY=<base64 32-byte key>
```

Web server를 재시작합니다.

## 2. Fine-grained PAT 만들기

GitHub에서 **Fine-grained personal access token**을 사용합니다.

보안 원칙:

- 학습용 Repository만 선택
- 필요한 기간만 Expiration 설정
- 가능한 최소 권한만 부여
- Token은 비밀번호처럼 취급

P9 권장 Repository read 권한:

- Contents — Read
- Issues — Read
- Pull requests — Read
- Actions — Read

GitHub 공식 문서는 Fine-grained PAT가 특정 Repository와 세분화된 권한으로 제한될 수 있어 classic PAT보다 세밀한 통제가 가능하다고 설명합니다.

## 3. Web에서 연결

```text
http://localhost:3000/labs/001-foundations
```

로그인한 뒤 Fine-grained PAT를 연결합니다.

Token은:

```text
PAT
 ↓ GitHub /user 확인
AES-256-GCM 암호화
 ↓
Supabase
```

흐름으로 저장되며 Web UI에 plaintext를 다시 반환하지 않습니다.

## 4. 자동 검증 대상

| Lab | 검증 내용 |
|---:|---|
| 020 | Repository + Default Branch |
| 030 | 작업 Branch 존재 |
| 040 | Issue + Branch + Commit + PR + `Closes #Issue` |
| 080 | Actions Workflow + optional Run |

## 5. PASS / RETRY

입력한 GitHub 객체가 Rule을 만족하면 `PASS`, 부족하면 `RETRY`가 표시됩니다.

## 중요한 주의

Fine-grained PAT를 다음에 붙여 넣지 않습니다.

- README
- GitHub Issue
- Discord
- Screenshot
- Chat 기록

노출되면 GitHub Settings에서 즉시 Token을 revoke합니다.

## PASS 기준

- Encryption Key 설정
- 학습용 Fine-grained PAT 연결
- `/labs/001-foundations` 정상 표시

다음: [160 Evidence와 Portfolio](./160-evidence-portfolio.md)
