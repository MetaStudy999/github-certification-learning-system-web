# P5 검증 (Verification, VER)

## 빠른 시작 (Quick Start, QS)

P5는 GitHub Actions Ubuntu 24.04에서 Supabase Local과 Production Next.js Runtime을 함께 실행해 검증합니다.

```text
Static Verify
   ↓
TypeScript
   ↓
Supabase P3 + P4 + P5 Migration / db reset
   ↓
Next.js Build / Runtime
   ↓
P3 Regression
   ↓
P4 Regression
   ↓
P5 Wrong Answer State Machine
   ↓
RLS / Direct Write Security
   ↓
GitHub Content Provider Regression
```

## 검증 범위

### 1. 정적·빌드

- `npm ci --ignore-scripts`
- `npm run verify`
- `npm run typecheck`
- `npm run build`

### 2. Supabase

- P3 User / Progress migration
- P4 Question Bank migration
- P5 Wrong Answer migration
- `supabase db reset`
- `wrong_answer_items` / `wrong_answer_retries` RLS

### 3. P5 상태 머신

실제 테스트 사용자를 생성한 뒤 다음을 순서대로 검증합니다.

```text
Q001 오답
  → MEDIUM / OPEN / DAY_1
  → COMPARE + Reflection 저장
  → DAY_1 정답
  → OPEN / DAY_7
  → DAY_7 정답
  → CLOSED

Q002 오답
  → OPEN / DAY_1
  → Retry 오답
  → HIGH / DAY_1 / wrongCount 2
```

### 4. 보안

- Browser `authenticated` role 직접 `wrong_answer_items` INSERT 거부
- User 2가 User 1의 Wrong Answer Row를 조회하지 못함
- Server-only credential을 통한 상태 변경만 허용

### 5. 회귀검사

- P3 Auth / Progress / Study Session / RLS
- P4 10 Question Sets / 100 Questions
- P4 Correct / Incorrect 평가와 `question_attempts`
- Local Content Provider
- GitHub Content Provider fallback

## 검증 결과

P5 구현 CI에서 다음 핵심 단계가 PASS했습니다.

| 검증 | 결과 |
|---|---|
| Install / Static Verify / TypeScript | PASS |
| P3 + P4 + P5 Supabase Migration | PASS |
| Next.js Build / Runtime | PASS |
| P3 Regression | PASS |
| P4 Regression | PASS |
| Ordinary Incorrect → DAY_1 | PASS |
| Error Code / Reflection | PASS |
| DAY_1 Correct → DAY_7 | PASS |
| DAY_7 Correct → CLOSED | PASS |
| Retry Incorrect → HIGH / DAY_1 | PASS |
| Retry Audit | PASS |
| Browser Direct Write Block | PASS |
| Cross-user RLS Isolation | PASS |
| GitHub Provider Fallback | PASS |

## 판정

**P5 Wrong Answer Engine: PASS**

P5 완료 후 다음 Phase는 **P6 Mock / Readiness**입니다. P6에서는 모의고사 결과와 오답 상태를 Exam Readiness Gate에 연결합니다.
