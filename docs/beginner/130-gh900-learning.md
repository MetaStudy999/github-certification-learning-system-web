# 130 GH-900 학습 흐름 (Learning Journey, LJ)

## 빠른 시작

로그인 후 다음 순서로 실제 학습 흐름을 확인합니다.

```text
Course
→ Learning Modules
→ Question Bank
→ Wrong Answers
→ Mock Exams
→ Readiness
```

## 1. GH-900 Course

```text
http://localhost:3000/courses/001-foundations
```

15개 표준 학습 모듈이 보여야 합니다.

## 2. 첫 모듈

```text
http://localhost:3000/courses/001-foundations/010-overview
```

Markdown 학습 콘텐츠가 렌더링되는지 확인합니다.

## 3. 100문제 Question Bank

```text
http://localhost:3000/questions/001-foundations
```

Q001~Q100, 10개 세트 구조를 사용합니다.

문제를 풀면 서버가 Source of Truth를 읽어 채점하고 Attempt를 저장합니다.

## 4. 오답 재학습

```text
http://localhost:3000/wrong-answers
```

틀린 문제는 Retry Queue로 연결됩니다.

학습 Cycle:

```text
DAY_1
  ↓
DAY_7
  ↓
CLOSED
```

## 5. Mock Exam

```text
http://localhost:3000/mocks/001-foundations
```

- Mock 01 — 40문항 / 60분 / 85%+
- Mock 02 — 40문항 / 60분 / 85%+
- Final Mock — 40문항 / 55분 / 90%+ 권장

## 6. Exam Readiness

```text
http://localhost:3000/readiness/001-foundations
```

시험 준비 Gate를 확인합니다.

## PASS 기준

- Course 표시
- 문제 제출 가능
- 오답 Queue 확인
- Mock 화면 표시
- Readiness 화면 표시

다음: [140 AI Tutor와 RAG](./140-ai-rag.md)
