# P4 Question Bank — 문제은행

## 목표

GH-900 `001-foundations/080-question-bank`의 Q001–Q100을 Web DB에 복제하지 않고 Source of Truth에서 직접 읽어 실제 문제풀이 경험으로 제공합니다.

## 흐름

```text
GCLS Content Repository
  → Markdown Question Parser
  → Public Question (정답 제외)
  → Question UI
  → Answer Submit API
  → Source-backed Server Evaluation
  → question_attempts
  → RLS Select
  → Question Bank Progress
```

## 보안 경계

- 정답/해설은 최초 페이지 payload에서 제외합니다.
- 사용자는 Supabase Access Token으로 제출 API를 호출합니다.
- 서버가 콘텐츠 레포에서 정답을 다시 읽어 판정합니다.
- Attempt Insert는 server-only service role/secret credential로 수행합니다.
- Browser의 authenticated role에는 `question_attempts` SELECT만 허용합니다.
- Service credential은 `NEXT_PUBLIC_*`에 절대 넣지 않습니다.

## P4 완료 기준

- 10 Question Sets 탐색
- Q001–Q100 = 100문항 파싱
- 정답 선노출 없음
- 로그인 사용자 정답/오답 제출
- Attempt 저장
- 사용자별 RLS 조회 격리
- 직접 Browser Insert 거부
- Local/GitHub Content Provider 회귀검사
