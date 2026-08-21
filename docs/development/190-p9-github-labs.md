# P9 Labs / GitHub API — GitHub 실습 검증

## 빠른 시작 (Quick Start, QS)

1. GCLS의 `001-foundations/060-labs` 원문대로 실습합니다.
2. Web `/labs/001-foundations`에 로그인합니다.
3. 학습용 Repository에만 접근 가능한 Fine-grained PAT를 연결합니다.
4. Lab과 GitHub 객체 정보를 입력합니다.
5. API Rule Engine의 `PASS / RETRY` 결과와 Evidence URL을 확인합니다.

## 목표

P9는 학습자가 실제 GitHub에서 수행한 결과를 Source-backed API로 검증합니다. Web이 Issue/Branch/PR을 대신 생성하지 않습니다.

## 검증 Lab

| Lab | 자동 검증 |
|---:|---|
| 020 Remote Repository | Repository + Default Branch |
| 030 Branch Workflow | 작업 Branch 존재 + Default Branch와 분리 |
| 040 GitHub Flow | Issue + Branch + Commit + Commit-on-Branch + PR Head/Base + `Closes #Issue` |
| 080 Modern Development | Actions Workflow + optional latest Run |

## Credential

Local P9는 Fine-grained PAT를 `/api/github/connection`으로 전달합니다.

```text
PAT → GitHub /user 검증 → AES-256-GCM 암호화 → Supabase
```

환경변수:

```env
GITHUB_API_BASE_URL=https://api.github.com
GITHUB_TOKEN_ENCRYPTION_KEY=<base64 32-byte key>
```

권장 Token 권한은 Contents/Issues/Pull requests/Actions의 Read입니다.

## 데이터 모델

```text
github_connections
      ↓
lab_attempts
      ↓
lab_verification_checks
      ↓
P10 Evidence / Portfolio
```

`github_connections`는 Browser 직접 접근을 허용하지 않습니다. Lab Attempt / Check는 본인 SELECT만 가능하고 쓰기는 server-only입니다.

## 완료 기준

- 암호화 GitHub 연결
- Token plaintext 비노출
- GitHub Flow PASS
- Actions PASS
- 실패 조건 RETRY
- canonical GitHub Evidence URL
- Browser 직접 Write 차단
- Cross-user RLS
- P3~P8 회귀검사 PASS
