# 190 전체 설치·실행 체크리스트 (Full Checklist, FC)

아래 표는 처음 설치할 때 위에서 아래로 하나씩 체크합니다.

## A. Clone

- [ ] `~/workspace/gcls` 생성
- [ ] Content Repo Clone
- [ ] Web Repo Clone
- [ ] 두 Repo가 sibling 구조
- [ ] 두 Repo `main`
- [ ] `git status` clean

## B. Runtime

- [ ] Git 동작
- [ ] Node.js 22+ / <25
- [ ] npm 동작
- [ ] Docker-compatible runtime 동작

## C. Web Dependencies

- [ ] Web Repo로 이동
- [ ] `npm ci` PASS
- [ ] `npm run typecheck` PASS

## D. Environment

- [ ] `.env.local` 생성
- [ ] `GCLS_CONTENT_DIR` 확인
- [ ] `AI_MODE=mock` 초기 사용
- [ ] Supabase URL 입력
- [ ] Supabase publishable/anon key 입력
- [ ] server-only key 입력
- [ ] Secret이 Git에 올라가지 않음

## E. Supabase

- [ ] `npm run supabase:start` PASS
- [ ] `npm run supabase:status` PASS
- [ ] `npm run supabase:reset` PASS

## F. Web

- [ ] `npm run dev`
- [ ] `/` 접속
- [ ] `/api/health` 정상
- [ ] `/login` 계정 생성
- [ ] `/progress` 접근

## G. GH-900

- [ ] `/courses/001-foundations`
- [ ] 15 modules 표시
- [ ] `/questions/001-foundations`
- [ ] 문제 제출
- [ ] `/wrong-answers`
- [ ] `/mocks/001-foundations`
- [ ] `/readiness/001-foundations`

## H. AI / RAG

- [ ] `GCLS_CONTENT_VERSION` 설정
- [ ] `RAG_INDEX_TOKEN` 설정
- [ ] RAG Index 생성
- [ ] `/api/rag/health` → ready
- [ ] AI Tutor 동작

## I. GitHub Labs

- [ ] `GITHUB_TOKEN_ENCRYPTION_KEY` 설정
- [ ] 학습용 Fine-grained PAT 생성
- [ ] `/labs/001-foundations` 연결
- [ ] PASS/RETRY 확인

## J. Evidence / Portfolio

- [ ] `/evidence/001-foundations`
- [ ] `/portfolio/001-foundations`
- [ ] SYSTEM_VERIFIED 확인
- [ ] SELF_ATTESTED 구분 확인
- [ ] JSON/Markdown Export 확인

## K. Final Verify

```bash
npm run verify
npm run typecheck
```

Web 실행 중:

```bash
VERIFY_RUNNING=1 npm run verify
```

RAG ready:

```bash
VERIFY_RUNNING=1 VERIFY_RAG=1 npm run verify
```

- [ ] 모든 필수 Verify PASS

## 완료

이 체크리스트가 완료되면 **Clone부터 GH-900 Vertical Slice 실행까지의 입문자 로컬 설치·실행 과정**을 한 번 재현한 것입니다.
