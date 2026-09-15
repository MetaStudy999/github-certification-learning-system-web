# AI Git Coach — 실제 개발 트랙

> 목적: 모두의창업 제출 문안에서 약속하는 최소 MVP와 별개로 실제 제품 개발 범위를 관리한다.
>
> 브랜치: `feature/ai-git-coach-mvp`
>
> 작성일: 2026-09-16

---

## 1. 운영 원칙

모두의창업 제출 문안은 **심사자가 실행 가능하다고 판단할 수 있는 최소 범위**로 관리한다.

실제 개발은 제출 범위보다 앞서갈 수 있다.

```text
제출 문안 = 1~3개월 안에 반드시 검증할 약속 범위
실제 개발 = 기술적으로 가능한 기능을 병행 실험하는 제품 범위
```

두 범위를 혼동하지 않는다.

- 제출 문안에서 미완성 기능을 완성 기능처럼 표현하지 않는다.
- 실제 개발에서 구현된 기능은 프로토타입 증빙으로 활용한다.
- 기능이 많다는 사실보다 사용자가 실제로 반복 사용하는 핵심 루프를 먼저 검증한다.

---

## 2. 제출용 Core MVP

제출 문안에서 1~3개월 핵심 MVP는 다음 세 가지로 제한한다.

### 2.1 자연어 Git 문제 진단

사용자가 Git 오류 또는 현재 문제를 자연어로 입력한다.

```text
"push가 안 돼요"
"merge conflict가 발생했어요"
"stash를 어떻게 써야 하나요?"
```

AI는 바로 파괴적 명령을 제시하지 않고 우선 상태 확인 단계부터 안내한다.

### 2.2 Git Graph + 안전한 단계별 해결

- 현재 브랜치·커밋 흐름 시각화
- 현재 단계에서 사용할 명령 강조
- 명령을 사용하는 이유 설명
- 위험 명령 경고
- 결과 확인 및 복구 경로 안내

### 2.3 Replay + Guided Practice

문제가 해결되면 해결 과정을 구조화된 이벤트로 저장한다.

```text
문제
↓
상태 확인
↓
명령 실행
↓
결과
↓
성공
```

저장된 성공 세션은:

- Replay로 다시 보기
- 속도 조절
- Step 단위 진행
- 사용자가 직접 명령 입력
- 정오답 판정
- 단계별 힌트
- 무힌트 성공 여부 측정

으로 재사용한다.

---

## 3. 현재 프로토타입에서 확인 가능한 개발 항목

현재 브랜치에는 다음 프로토타입 구조가 있다.

### `/coach-demo`

- 3열 UI: Git Graph / Guided Terminal / AI Coach
- 자연어 질문 입력
- `/api/coach` 호출
- 단계별 명령 선택
- 명령 실행 시뮬레이션
- 위험도 표시
- 검증 설명

코드:
`src/app/coach-demo/page.tsx`

### `/api/coach`

- 사용자 수준 입력
- 자연어 질문 처리
- 상태 우선 안내
- 최대 2~5개 단계 제안
- 고위험 Git 명령 패턴 별도 감지
- AI Provider 실패 시 안전한 fallback 제공

고위험 명령 예:

- `git reset --hard`
- `git clean`
- `git push --force`
- `git branch -D`

코드:
`src/app/api/coach/route.ts`

### `/cert-dashboard-demo`

- GitHub 자격증별 내부 학습 준비도
- 질문·실습 데이터
- 부족 학습 항목
- 추천 실습
- 공식 합격확률이 아닌 내부 지표라는 고지

코드:
`src/app/cert-dashboard-demo/page.tsx`

이 대시보드는 현재 제품 확장 가능성을 보여주는 프로토타입이며, 제출용 1~3개월 Core MVP의 필수 범위에서는 제외한다.

---

## 4. 실제 개발 확장 트랙

실제 개발은 아래 항목을 병행 실험할 수 있다.

### Track A — Core Coach

- Git 상태 입력/분석
- Git Graph
- 안전한 명령 추천
- 검증/복구
- 사용자 수준별 설명

### Track B — Replay & Practice

- Session Event 모델
- Replay Engine
- 0.5x / 1x / 1.5x / 2x
- Step Forward / Restart
- Guided Practice
- 힌트
- 무힌트 성공률

### Track C — Certification Intelligence

- 질문/실습/오답 주제 분류
- GitHub 자격증 학습영역 매핑
- 내부 준비도
- 부족 영역 추천
- 재학습 루프

### Track D — Local / Cloud / Hybrid LLM

사용자가 프로젝트 보안 수준에 따라 AI 실행방식을 선택한다.

```text
Local LLM
├─ 비공개 저장소
├─ 민감 코드
└─ 외부 전송 최소화

Cloud API
├─ 복잡한 추론
├─ 고품질 설명
└─ 교육콘텐츠 생성

Hybrid
├─ Local 우선
├─ 민감정보 마스킹
└─ 필요 시 Cloud
```

향후 Auto Mode에서는 보안·비용·난이도를 기준으로 모델을 자동 선택한다.

### Track E — AI 교육영상 자동 제작

```text
성공 작업 History
↓
교육 목표 입력
↓
AI Scene 구성
↓
Git Graph + Terminal Replay
↓
말풍선 / 자막 / 설명
↓
음성 합성
↓
영상 출력
↓
직접 따라하기
```

MVP 초기에는 Scene/말풍선/자막 생성 수준부터 검증하고, 실제 MP4/WebM 자동 렌더링은 후속으로 둔다.

### Track F — Enterprise

- Private Repo → Local only 정책
- Cloud 허용/금지 정책
- Secret masking
- 사내 Git 규칙 반영
- 관리자 학습/실습 대시보드
- 조직별 교육콘텐츠

---

## 5. 우선순위

### P0 — 모두의창업 데모에 반드시 필요한 것

1. `/coach-demo` 안정화
2. `/api/coach` 실제 AI Provider 1개 연결 확인
3. 위험 명령 Safety Guard 확인
4. Replay 데모 1개
5. Guided Practice PASS 흐름 1개
6. Vercel Preview 배포

### P1 — 제출 후 즉시 개발

1. Session Event 저장 구조
2. Replay Engine 실제 구현
3. Guided Practice 채점
4. Local LLM 연결 UI
5. Certification Dashboard 데이터 연계

### P2 — 후속 검증

1. Hybrid AI routing
2. AI 교육영상 Scene Generator
3. TTS
4. 영상 export
5. Enterprise policy
6. CLI / IDE integration

---

## 6. 개발 의사결정 기준

새 기능은 아래 질문을 통과할 때만 P0 또는 P1로 올린다.

1. 첫 사용자가 실제 문제를 더 빨리 해결하는가?
2. 7일 뒤 다시 돌아올 이유가 생기는가?
3. Replay 또는 Practice가 기억 유지에 도움이 되는가?
4. 사용자가 비용을 지불할 이유가 생기는가?
5. 보안 위험을 증가시키지 않는가?

단순히 “있으면 멋진 기능”은 P2로 둔다.

---

## 7. 제출 문안과 개발의 연결 방법

제출 문안에서는:

> “초기 MVP는 자연어 진단, Git Graph 기반 안전한 해결, 성공 작업 Replay·직접훈련에 집중합니다.”

실제 데모에서는 필요하면:

- 자격증 대시보드
- 모델 선택 UI
- 교육영상 콘셉트

까지 보여줄 수 있다.

단, 영상과 신청서에서 다음 표현을 구분한다.

```text
현재 구현됨   → 프로토타입에서 확인 가능
개발 중       → 현재 구현 중
설계 완료     → 후속 구현 예정
장기 확장     → 사용자 검증 후 확장
```

---

## 8. 최종 원칙

> **심사에는 작은 약속을 하고, 개발에서는 더 빠르게 앞서간다.**

> **기능 수보다 실제 Git 문제 해결 → 재현 → 직접 수행의 반복 루프를 먼저 완성한다.**
