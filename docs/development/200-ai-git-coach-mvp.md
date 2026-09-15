# AI Git Coach MVP — 모두의창업 제출 스프린트

## 목표

2026-09-16~17 사이에 다음을 완료한다.

1. 모두의창업 AI 사전점검 문안 확정
2. 실행형 AI Git 코치 데모 화면 완성
3. 실제 AI API 1개 이상 연결
4. GitHub 자격증 준비도 대시보드 데모 완성
5. 60~90초 실행 영상 녹화 가능한 상태 확보
6. Vercel Preview 배포 및 최종 제출용 링크 확보

## MVP 핵심 가치

> 사용자가 Git 문제를 자연어 또는 오류 메시지로 입력하면, 현재 상태 확인 → 원인 설명 → 안전한 명령 안내 → 결과 검증 → 복구 경로까지 단계적으로 지원한다.

학습 모드와 실전 모드를 연결한다.

- Learn: 자격증/개념 학습
- Practice: 샌드박스 실습
- Assist: 실전 문제 질문
- Verify: 결과 확인
- Recover: 복구 안내
- Re-Learn: 부족 영역 재학습

## 데모 화면

### 1. `/coach-demo`

3열 Dark Mode UI.

- 좌측: Git Graph / Branch Tree
- 중앙: 현재 실행할 명령어 + 설명 + 터미널
- 우측: AI Git Coach 채팅

대표 시나리오:

`push가 안 돼요. 어떻게 해야 하나요?`

응답 순서:

1. `git status`
2. `git remote -v`
3. 필요 시 `git add .` / `git commit`
4. `git push origin <branch>`
5. 실행 결과 재확인

위험 명령(`reset --hard`, `clean -fd`, 강제 push 등)은 자동 실행하지 않고 경고/백업/확인 단계를 우선한다.

### 2. `/cert-dashboard-demo`

GitHub 자격증별 내부 준비도 지표를 보여준다.

- GitHub Foundations
- GitHub Actions
- GitHub Administration
- GitHub Advanced Security
- GitHub Copilot
- GitHub Agentic AI Developer

화면 항목:

- 질문 수
- 실습 수
- 오답/취약 항목
- 준비도 %
- 대분류/하위 카테고리 이해도
- 부족 질문 수
- 추천 실습
- AI Next Best Action

주의: 준비도 %는 공식 합격 확률이 아니라 서비스 내부 학습 준비도 지표로 표시한다.

## API 구조

브라우저 → Next.js Route Handler → 기존 AI Provider → 응답 → UI

### `POST /api/coach`

입력 예시:

```json
{
  "question": "push가 안 돼요",
  "level": "beginner",
  "context": {
    "branch": "main",
    "status": "modified files"
  }
}
```

출력 목표:

```json
{
  "summary": "먼저 현재 저장소 상태를 확인합니다.",
  "risk": "low",
  "steps": [
    {"command":"git status","why":"변경사항과 현재 브랜치를 확인합니다."},
    {"command":"git remote -v","why":"원격 저장소 연결을 확인합니다."}
  ],
  "verify": "명령 결과를 확인한 뒤 다음 단계를 안내합니다."
}
```

MVP는 기존 `AI_MODE=mock|local|api|hybrid` 구조와 기존 Provider를 재사용한다. 실제 외부 API 키는 서버 환경변수에만 둔다.

## 데이터 수집

최소 이벤트:

- `question_submitted`
- `coach_step_shown`
- `practice_started`
- `practice_succeeded`
- `practice_failed`
- `topic_mastery_updated`

데이터 필드 예시:

- user_id
- certification_code
- topic
- subtopic
- question_text_hash
- success
- duration_ms
- created_at

원문 질문 저장이 필요하면 개인정보/소스코드 유출 위험을 고려해 별도 동의 및 마스킹 정책을 둔다.

## 60~90초 데모 영상

### 0~10초 — 문제

"Git은 배웠지만 실전에서 막히면 다시 검색합니다."

### 10~35초 — AI Git Coach

1. 사용자가 `push가 안 돼요` 입력
2. AI가 `git status`를 제시
3. 중앙 터미널에서 실행
4. 좌측 Git Graph 상태 변화 강조

### 35~55초 — 안전/검증

- 위험 명령 경고
- 실행 후 결과 검증
- 복구 경로 표시

### 55~75초 — 자격증 대시보드

- 6개 자격증 준비도
- 부족 학습 항목
- AI 추천

### 75~90초 — 마무리

"학습에서 실전 문제 해결까지 연결하는 실행형 AI Git 코치"

## 시간 계획

### 9/16

- 04:30~06:00: 제출 문안/사전점검 1차 완성
- 06:00~07:00: 경쟁서비스 차별성/기술 과장 표현 정리
- 07:00~08:00: 사전점검 1차 실행
- 08:00~09:00: 점수/피드백 기반 수정
- 09:00~10:00: 사전점검 2차 및 문안 Freeze
- 10:00~11:00: 영상 스토리보드/자막/데모 데이터 준비
- 11:00~12:00: 정적 데모 화면 점검
- 12:00~13:00: 영상 1차 화면 녹화
- 13:00~14:00: MVP 페이지 골격
- 14:00~15:00: `/api/coach` 연결
- 15:00~16:00: Coach UI 상호작용
- 16:00~17:00: Certification Dashboard UI
- 17:00~18:00: Supabase 이벤트 최소 연결
- 18:00~19:00: Build / Typecheck / 오류 수정
- 19:00~20:00: Vercel Preview 준비
- 20:00~21:00: 실제 데모 시나리오 검증
- 21:00~22:00: 영상 2차 녹화
- 22:00~23:00: 제출 문안과 MVP 화면 일치 확인
- 23:00~24:00: 버퍼 / 치명 오류만 수정

### 9/17

- 00:00~06:00: 안정화 버퍼 / 휴식 우선
- 06:00~07:00: 전체 기능 Smoke Test
- 07:00~08:00: API/배포 환경변수 재검증
- 08:00~09:00: 최종 영상/링크 확인
- 09:00~10:00: 신청서 최종 교정
- 10:00~11:00: 최종 제출

## Definition of Done

- [ ] Q1/Q2/Q3-1/Q3-2/Q4-1/Q4-2/Q8 최종 문안 확보
- [ ] `/coach-demo`에서 질문→명령→설명 흐름 동작
- [ ] 최소 1개 실제 AI API 호출 성공
- [ ] 위험 명령 경고 화면 존재
- [ ] `/cert-dashboard-demo`에서 6개 자격증 준비도 및 취약 항목 표시
- [ ] `npm run typecheck` 통과
- [ ] `npm run build` 통과
- [ ] Vercel Preview URL 확보
- [ ] 60~90초 영상 링크 확보
- [ ] 제출 전 링크/맞춤법/공개범위 최종 점검
