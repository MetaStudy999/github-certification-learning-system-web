# P8 검증 (Verification, VER) — RAG Grounding

## 빠른 시작 (Quick Start, QS)

P8 전용 검증은 GitHub Actions의 `GCLS Web P8 Verify`에서 수행합니다.

```text
TypeScript
→ pgvector Migration
→ Build
→ RAG Empty Gate
→ Index
→ Retrieval Policy
→ Tutor Grounding
→ Audit / RLS
→ Incremental Re-index
→ Ollama Embedding
→ OpenAI Embedding
→ Profile Mismatch Gate
```

## 목차 (Table of Contents, TOC)

1. 검증 범위
2. 기능 커밋 검증 결과
3. Security / Leakage Gate
4. Embedding Contract
5. Regression
6. Local Verify

## 1. 검증 범위

P8는 단순히 Vector 검색 결과가 나오는지만 확인하지 않습니다.

- DB migration / `vector` extension
- 384D Embedding 일관성
- Source of Truth 문서 Index
- Content Hash Incremental Re-index
- Content Version Freshness
- Embedding Profile compatibility
- PRE_ANSWER / POST_ATTEMPT 정책
- 제출 전 정답 정보 우회 노출 방지
- Tutor RAG Source 반환
- Interaction Source Audit
- RLS / Browser 직접 접근 차단
- P3~P7 Regression

을 함께 Gate로 둡니다.

## 2. 기능 커밋 검증 결과

기능 커밋 `9bf3a763d158ab9946be7ace94a994649b70001e` 기준:

| Workflow | Run | 결과 |
|---|---:|---|
| GCLS Web Verify | `32526614749` | PASS |
| GCLS Web P6 Verify | `32526614886` | PASS |
| GCLS Web P7 Verify | `32526614767` | PASS |
| GCLS Web P8 Verify | `32526614755` | PASS |

P8 전용 Run에서 다음을 검증했습니다.

- `npm ci` PASS
- TypeScript PASS
- P8 migration + Supabase `db reset` PASS
- Next.js production build PASS
- `required` 모드에서 Index 전 Tutor 차단 PASS
- Index token 인증 PASS
- 허용 문서 10개 Index PASS
- 변경 없는 10개 문서 Re-index Skip PASS
- 단일 Markdown 변경 시 1개 문서만 Re-index PASS
- PRE_ANSWER Retrieval PASS
- 제외 Source 비노출 PASS
- Hint Grounding PASS
- Explanation Attempt Gate PASS
- Attempt 후 Explanation Grounding PASS
- AI interaction RAG Audit PASS
- AI Source Audit PASS
- Browser RAG direct access 차단 PASS
- Cross-user Source Audit RLS PASS
- Ollama `/api/embed` 384D PASS
- OpenAI `/v1/embeddings` 384D PASS
- Profile mismatch 503 Gate PASS

## 3. Security / Leakage Gate

### 제출 전

```text
Question Prompt
    ↓
PRE_ANSWER Sources only
    ↓
AI Tutor
```

`080-question-bank`, `110-mock-exams`, `120-wrong-answers`는 RAG Index 자체에서 제외했습니다.

### Explanation

```text
DB actual QUESTION_BANK Attempt 확인
    ↓
PASS
    ↓
PRE_ANSWER + POST_ATTEMPT Retrieval
    ↓
Explanation
```

Client가 Search API를 직접 호출해도 POST_ATTEMPT Tier를 Request로 지정할 수 없습니다.

## 4. Embedding Contract

P8 CI의 Fake Provider는 외부 비용 없이 실제 Payload Contract를 검증합니다.

| Provider | 검증 |
|---|---|
| Mock | Deterministic 384D |
| Ollama | `/api/embed`, batch input, 384D |
| OpenAI | `/v1/embeddings`, batch input, 384D |

Index를 OpenAI Profile로 만든 다음 Ollama Profile로 검색을 시도해 `RAG_PROFILE_MISMATCH`가 발생하는지도 검증합니다.

## 5. Regression

P8 migration이 추가된 상태에서도 기존 기능을 그대로 검증했습니다.

- P3 Auth / Progress / RLS
- P4 Question Bank / server grading
- P5 Wrong Answer state machine
- P6 Mock / Readiness
- P7 Tutor access gate / Provider contracts / Hybrid fallback
- Local / GitHub Content Provider

즉 P8는 P7을 대체하지 않고 그 앞에 Grounding Layer를 추가합니다.

## 6. Local Verify

정적 확인:

```bash
npm run verify
```

실행 중인 앱 확인:

```bash
VERIFY_RUNNING=1 npm run verify
```

RAG Index까지 `ready`여야 PASS하도록 확인:

```bash
VERIFY_RUNNING=1 VERIFY_RAG=1 npm run verify
```

`VERIFY_RAG=1`은 `/api/rag/health`의 `status=ready`와 10개 문서 이상을 요구합니다.
