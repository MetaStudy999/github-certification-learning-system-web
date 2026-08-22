# GCLS Web 입문자 설치·실행 매뉴얼

> **대상:** Git/GitHub, Node.js, Supabase가 처음인 학습자

## 빠른 시작 (Quick Start, QS)

처음이라면 명령을 한꺼번에 실행하지 말고 아래 문서를 **번호 순서대로 하나씩** 진행합니다.

## 목차 (Table of Contents, TOC)

| 순서 | 문서 | 완료 기준 |
|---:|---|---|
| 010 | [처음 시작하기](./010-start-here.md) | 전체 구조 이해 |
| 020 | [사전 준비](./020-prerequisites.md) | 필수 프로그램 확인 |
| 030 | [Workspace 만들기와 Clone](./030-workspace-clone.md) | 두 Repository가 sibling 구조 |
| 040 | [Clone 검증](./040-clone-verify.md) | 두 Repo 모두 main/clean |
| 050 | [Node.js와 npm](./050-node-npm.md) | Node 22+ / npm 동작 |
| 060 | [의존성 설치](./060-install-dependencies.md) | `npm ci` PASS |
| 070 | [환경파일 만들기](./070-env-local.md) | `.env.local` 생성 |
| 080 | [Supabase Local 시작](./080-supabase-start.md) | Local services 기동 |
| 090 | [Supabase 환경값 연결](./090-supabase-env.md) | URL/Key 설정 |
| 100 | [Database Reset](./100-database-reset.md) | P3~P10 migration 적용 |
| 110 | [Web 실행](./110-run-web.md) | `http://localhost:3000` 접속 |
| 120 | [회원가입·로그인](./120-login.md) | 로그인 성공 |
| 130 | [GH-900 학습 흐름](./130-gh900-learning.md) | 학습~Mock 기본 동작 |
| 140 | [AI Tutor와 RAG](./140-ai-rag.md) | RAG health ready |
| 150 | [GitHub Labs](./150-github-labs.md) | GitHub 연결/검증 준비 |
| 160 | [Evidence와 Portfolio](./160-evidence-portfolio.md) | Evidence 화면 확인 |
| 170 | [Verify와 문제 해결](./170-verify-troubleshooting.md) | Verify PASS |
| 180 | [종료·재시작·업데이트](./180-stop-restart-update.md) | 반복 실행 가능 |
| 190 | [전체 체크리스트](./190-full-checklist.md) | 처음부터 끝까지 확인 |

## 권장 학습 원칙

```text
명령 1개 실행
   ↓
출력 확인
   ↓
PASS 기준 확인
   ↓
문제 없으면 다음 단계
```

에러가 발생하면 다음 단계로 넘어가지 말고 해당 문서의 **문제 해결 (Troubleshooting)** 절을 먼저 확인합니다.

## Repository 역할

```text
workspace/gcls/
├─ github-certification-learning-system/      ← 학습 콘텐츠 Source of Truth
└─ github-certification-learning-system-web/  ← 실행할 Web 애플리케이션
```

두 Repository는 반드시 같은 상위 폴더 아래에 두는 것을 기본값으로 합니다.
