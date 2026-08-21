# P7 AI Gateway / Tutor — AI 게이트웨이 / 튜터

## 빠른 시작 (Quick Start, QS)

1. `AI_MODE=mock`으로 외부 AI 없이 Tutor 흐름을 검증합니다.
2. Question Bank에서 로그인합니다.
3. `Hint → Concept → Similar Example → Retry → Explanation` 순서로 사용합니다.
4. Local AI는 Ollama, Cloud AI는 OpenAI Provider를 사용합니다.
5. `hybrid`는 Ollama 우선, 실패 시 OpenAI로 fallback합니다.

## 목표

기존 AI Provider 추상화를 실제 GH-900 Question Bank 학습 흐름에 연결합니다. AI는 학습 보조 역할만 담당하며 **정답 판정은 기존 Source-backed Rule Engine**이 계속 수행합니다.

## 학습 흐름

```text
Question Bank
   ↓
1. Hint
   ↓
2. Concept
   ↓
3. Similar Example
   ↓
4. Retry — 기존 문제 제출
   ↓
5. Explanation — 실제 Attempt 확인 후 허용
```

## 정답 보호 경계

- `HINT`, `CONCEPT`, `SIMILAR_EXAMPLE` 단계에서는 **선택지 자체를 AI Provider에 전달하지 않습니다.**
- 위 세 단계의 AI 출력에는 정답 문자/정답 선택지 직접 노출 방어를 추가합니다.
- `EXPLANATION`은 DB에서 해당 사용자의 실제 `QUESTION_BANK` Attempt를 확인한 뒤에만 허용합니다.
- Explanation 단계에서만 선택지, 최근 선택, 정답, Source of Truth 해설을 AI에 제공합니다.
- AI 출력은 채점 결과를 변경할 수 없습니다.

## AI Provider

| Mode | Provider | 용도 |
|---|---|---|
| `mock` | Deterministic Mock | CI / 개발 |
| `local` | Ollama | 로컬 AI |
| `api` | OpenAI | 외부 API |
| `hybrid` | Ollama → OpenAI | Local First + Cloud Fallback |

OpenAI Provider endpoint는 `OPENAI_BASE_URL`로 설정 가능하고 기본값은 `https://api.openai.com/v1`입니다. 모델명과 API Key는 환경변수로만 주입합니다.

## 데이터 모델

`ai_interactions`는 사용자별 Tutor 상호작용 Audit을 저장합니다.

- stage
- AI mode
- provider / model
- fallback 여부
- request 문자 수
- response
- latency
- created_at

Browser는 자신의 기록을 SELECT만 할 수 있고 INSERT/UPDATE/DELETE는 server-only credential에서 수행합니다. RLS(Row Level Security)로 사용자 간 데이터를 격리합니다.

## P7 완료 기준

- Question Bank Tutor UI 연결
- 4개 Tutor stage API 동작
- 제출 전 Explanation 차단
- Attempt 후 Explanation 허용
- `ai_interactions` Audit 저장
- Browser 직접 Write 차단
- Cross-user RLS 격리
- Ollama contract 검증
- OpenAI Responses contract 검증
- Hybrid local-first / fallback 검증
- P3~P6 회귀검사 PASS
