# P4 Verification — 문제은행 검증

## 판정

**PASS**

## 검증 범위

P4는 단순 페이지 렌더링이 아니라 Source of Truth 기반 문제 파싱, 서버 채점, Attempt 저장, 권한 경계를 End-to-End로 검증합니다.

| 검증 | 결과 |
|---|---|
| npm ci | PASS |
| Static Verify | PASS |
| TypeScript | PASS |
| Supabase P3 + P4 migrations | PASS |
| Supabase db reset | PASS |
| Next.js build/runtime | PASS |
| Local Content Provider | PASS |
| GH-900 Question Sets | 10 / PASS |
| GH-900 Questions | Q001–Q100 / 100 / PASS |
| `## Qnnn` + `정답: A` 형식 | PASS |
| `### Qnnn` + `A — 해설` 형식 | PASS |
| 최초 문제 HTML 정답 비노출 | PASS |
| Correct server evaluation | PASS |
| Incorrect server evaluation | PASS |
| Attempt INSERT by server | PASS |
| Browser direct Attempt INSERT | BLOCKED / PASS |
| Cross-user Attempt SELECT | BLOCKED BY RLS / PASS |
| P3 Auth / Progress regression | PASS |
| GitHub Provider fallback | PASS |

## 발견 및 수정

1. 메인 콘텐츠의 Q001–Q050과 Q051–Q100이 서로 다른 Markdown heading/answer 표기를 사용하는 것을 발견했습니다.
2. Parser를 두 표기 형식을 모두 허용하도록 수정했습니다.
3. `question_attempts`는 authenticated Browser에 SELECT만 허용하고 server role에 INSERT 권한을 명시했습니다.
4. CI에서 Supabase 환경파일을 출력하지 않도록 보안 로그를 정리하고 server-side Secret Key를 우선하도록 정리했습니다.

## 보안 불변조건

- 최초 문제 payload에 `correctAnswer`와 `explanation`을 포함하지 않는다.
- 정답 판정은 서버가 현재 Source of Truth를 읽어 수행한다.
- Browser가 `is_correct`나 `correct_answer`를 직접 저장할 수 없다.
- Attempt 조회는 RLS에 의해 사용자 본인 데이터로 제한된다.
- Server credential은 `NEXT_PUBLIC_*`에 포함하지 않는다.

## 다음 단계

P5 Wrong Answer Engine에서는 `question_attempts`의 오답을 입력으로 사용해 오답 Queue, 원인 분류, 복습 간격, 재시도, Mastered 상태를 추가합니다.
