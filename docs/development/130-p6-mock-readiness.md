# P6 Mock / Readiness — 모의고사·시험 준비도

## 목표

GH-900 Source of Truth의 `110-mock-exams`를 Web DB에 복제하지 않고 직접 읽어, 실제 Mock 응시·채점·오답 재학습·Exam Readiness Gate까지 연결합니다.

## Source of Truth

| 시험 | 문항 | 권장 시간 | 목표 | 역할 |
|---|---:|---:|---:|---|
| Mock 01 | 40 | 60분 | 85%+ | DIAGNOSTIC |
| Mock 02 | 40 | 60분 | 85%+ | GATE |
| Final Mock | 40 | 55분 | 90%+ 권장 | FINAL |

각 시험은 `questions.md`와 `answers.md`가 분리되어 있습니다. Web도 이 경계를 유지해 제출 전에는 정답·해설을 Client payload로 전달하지 않습니다.

## 실행 흐름

```text
questions.md + answers.md
        ↓
Mock Parser (server)
        ↓
Public Questions only
        ↓
Mock Start
        ↓
40문항 풀이 + 권장 Timer
        ↓
전체 제출
        ↓
Source-backed Server Evaluation
        ↓
mock_exam_attempts / mock_exam_answers
        ↓
MOCK question_attempts
        ↓
P5 Wrong Answer Engine
        ↓
Exam Readiness Gate
```

## 데이터 경계

- `question_attempts.source_kind = QUESTION_BANK | MOCK`
- `wrong_answer_items.source_kind = QUESTION_BANK | MOCK`
- Mock aggregate: `mock_exam_attempts`
- Mock per-question audit: `mock_exam_answers`
- 수동 Study Guide 확인: `readiness_profiles`
- Browser는 자신의 Mock/Readiness 기록을 SELECT만 할 수 있습니다.
- Mock Start/Submit, Readiness 갱신은 server-only credential로 수행합니다.

## Exam Readiness Gate

6개 항목을 독립적으로 표시합니다.

1. Mock 01 85%+
2. Mock 02 85%+
3. 최근 2회 연속 85%+
4. Final Mock 90%+ 권장
5. 최근 오답 Retry 90%+
6. 최신 공식 Study Guide 확인

모든 Gate 충족 시 `EXAM-READY`, Final Mock 권장 Gate를 제외한 핵심 Gate 충족 시 `READY`, 일부 충족 시 `REVIEW`, 그 미만은 `NOT READY`로 표시합니다.

## 주요 Route

- `/mocks/001-foundations`
- `/mocks/001-foundations/010-mock-01`
- `/mocks/001-foundations/020-mock-02`
- `/mocks/001-foundations/030-final-mock`
- `/readiness/001-foundations`
- `/api/mocks/health`
