# P5 오답 엔진 (Wrong Answer Engine, WAE)

## 빠른 시작 (Quick Start, QS)

1. GH-900 Question Bank에서 문제를 풉니다.
2. 틀린 문항은 `wrong_answer_items`에 자동 등록됩니다.
3. `/wrong-answers`에서 오답 원인 코드와 한 문장 학습 메모를 기록합니다.
4. `DAY_1` 재도전을 수행합니다.
5. 정답이면 `DAY_7`, 오답이면 `HIGH + DAY_1`으로 돌아갑니다.
6. `DAY_7`도 정답이면 `CLOSED` 처리합니다.

## 목표

메인 콘텐츠 저장소의 `001-foundations/120-wrong-answers`를 Source of Truth로 삼아, 오답을 단순 정답 확인으로 끝내지 않고 **원인 분석 → 재학습 → 반복 재시험 → 종료**의 실행 가능한 학습 Cycle로 연결합니다.

## 오답 원인 코드 (Error Code, EC)

| 코드 | 의미 |
|---|---|
| `CONCEPT` | 개념 부족 |
| `COMPARE` | 유사 개념 혼동 |
| `READING` | 조건 해석 실패 |
| `MEMORY` | 기억 실패 |
| `PRACTICE` | 실습 부족 |
| `SCOPE` | 시험 범위 연결 실패 |

## 상태 흐름 (State Flow, SF)

```text
Question Bank 오답
        ↓
OPEN / DAY_1
        ↓
원인 코드 + Reflection
        ↓
DAY_1 Retry
   ┌────┴────┐
 오답       정답
  ↓          ↓
HIGH       OPEN / DAY_7
DAY_1        ↓
재시작     DAY_7 Retry
          ┌──┴──┐
        오답    정답
         ↓       ↓
       HIGH    CLOSED
       DAY_1
```

`next_retry_at`은 Source of Truth의 +1일/+7일 복습 시점을 기록합니다. P5 MVP에서는 학습자가 필요하면 예정일보다 먼저 재도전할 수도 있도록 하며, 예정 시점은 Dashboard에서 `DUE`로 표시합니다.

## 데이터 모델

### `wrong_answer_items`

문항별 현재 오답 상태를 저장합니다.

- 사용자 / 과정 / 문제 세트 / 문제 ID
- 최초·최신 Question Attempt
- 마지막 선택 답 / 정답
- Error Code / Reflection
- Priority: `HIGH / MEDIUM / LOW`
- Status: `OPEN / CLOSED`
- Retry Stage: `DAY_1 / DAY_7 / CLOSED`
- Wrong Count / Correct Retry Count
- Next Retry / Closed At

### `wrong_answer_retries`

재도전 이력을 감사 가능한 형태로 별도 저장합니다.

- Wrong Answer ID
- Question Attempt ID
- Retry Stage
- Correct 여부
- Review 시각

## 우선순위 규칙

P5의 자동 규칙은 다음과 같습니다.

- 동일 문항을 2회 이상 틀리면 `HIGH`
- 단순 `MEMORY` 1회 오류는 `LOW`
- 그 외 1회 오류는 `MEDIUM`
- Retry에서 다시 틀리면 즉시 `HIGH`로 승격하고 `DAY_1`부터 재시작

향후 P6 Mock / Readiness에서는 Mock 종류, 시험 Domain 비중, Exam Gate를 포함해 Priority를 확장할 수 있습니다.

## 보안 경계

```text
Browser
  │ SELECT only
  ▼
wrong_answer_items / wrong_answer_retries
  ▲
  │ server-only credential
  │
Question Submit / Classify API
```

- Browser의 `authenticated` role은 본인 Row를 `SELECT`만 할 수 있습니다.
- 오답 등록, Classification, Retry 상태 전이는 서버에서만 수행합니다.
- RLS(Row Level Security)로 사용자 간 데이터가 격리됩니다.
- Server credential은 `NEXT_PUBLIC_*`에 노출하지 않습니다.

## 주요 화면과 API

- `/wrong-answers` — 오답 Dashboard / Retry Queue
- `/questions/001-foundations/{set}?retry={id}&question={Qnnn}` — Retry Mode
- `POST /api/questions/{course}/{set}/{question}/submit` — 일반/Retry 채점
- `POST /api/wrong-answers/{id}/classify` — 원인 코드 / Reflection 저장

## P5 완료 기준

- Ordinary incorrect → `OPEN / DAY_1`
- 6개 Error Code 저장
- Reflection 저장
- `DAY_1` 정답 → `DAY_7`
- `DAY_7` 정답 → `CLOSED`
- Retry 오답 → `HIGH / DAY_1`
- Retry Audit 저장
- Browser 직접 Write 거부
- 사용자 간 RLS 격리
- P3/P4 회귀검사 PASS
