# P6 Verification — Mock / Readiness 검증

## 결과

**PASS**

GitHub Actions Ubuntu 24.04에서 기존 `GCLS Web Verify`와 P6 전용 `GCLS Web P6 Verify`를 사용합니다.

## 검증 항목

- `npm ci` / TypeScript PASS
- P3 + P4 + P5 + P6 migration / Supabase `db reset` PASS
- Next.js Production Build PASS
- Mock 01 / Mock 02 / Final Mock = 3개 탐색 PASS
- 40 × 3 = 120문항 파싱 PASS
- Final Mock 권장 55분 Source of Truth 반영 PASS
- 최초 Mock HTML 정답/해설 비노출 PASS
- Mock Start API PASS
- 40문항 전체 Submit + 서버 채점 PASS
- `mock_exam_attempts` / `mock_exam_answers` 저장 PASS
- Mock 오답 → P5 `source_kind=MOCK` Queue 연결 PASS
- Mock 재응시 Correct → DAY_1 → DAY_7 → CLOSED PASS
- Mock 01/02/Final score Gate PASS
- 최근 2회 연속 85% Gate PASS
- 오답 Retry 90% Gate PASS
- Study Guide 확인 Gate PASS
- 최종 Readiness 100% / `EXAM-READY` PASS
- Browser 직접 Mock INSERT 차단 PASS
- 사용자 2명 간 Mock RLS 격리 PASS
- 기존 P3/P4/P5 회귀검사 PASS

## E2E 시나리오

```text
Mock 01 — 39/40
      ↓
Q01 MOCK 오답 Queue 생성
      ↓
Mock 01 재응시 40/40 → DAY_7
      ↓
Mock 01 재응시 40/40 → CLOSED
      ↓
Mock 02 40/40
      ↓
Final Mock 40/40
      ↓
Study Guide 확인
      ↓
Readiness 6/6 = 100%
      ↓
EXAM-READY
```

P6 완료 후 P7 AI Gateway / Tutor로 이동합니다.
