# 160 Evidence와 Portfolio (Evidence & Portfolio, EP)

## 빠른 시작

로그인 후 다음 화면을 확인합니다.

```text
http://localhost:3000/evidence/001-foundations
http://localhost:3000/portfolio/001-foundations
```

## 1. Evidence Package

P10은 P3~P9 기록을 다시 계산해 Evidence Package를 만듭니다.

```text
Progress
+ Question Bank
+ Wrong Answer
+ Mock / Readiness
+ AI / RAG
+ GitHub Labs
        ↓
Evidence Package
```

## 2. SYSTEM_VERIFIED

시스템이 자동으로 확인할 수 있는 항목 예:

- Q001~Q100 Coverage
- Mock 점수
- GitHub Lab PASS
- Readiness
- AI/RAG 기록
- Canonical GitHub Evidence URL

## 3. SELF_ATTESTED

시스템이 독립적으로 검증할 수 없는 외부 사실은 학습자가 직접 기록합니다.

- Environment
- Local Git Lab
- Repository Documentation
- Project + Score
- 실제 Certification Exam Result
- Final Reflection

이 정보는 `SELF_ATTESTED`로 명확히 구분됩니다.

## 4. CLEAR_CANDIDATE

9개 Evidence Gate가 모두 충족되면 내부 상태가 `CLEAR_CANDIDATE`가 될 수 있습니다.

**중요:** 이는 GCLS 내부 Evidence 완성도 상태이며 실제 GitHub 자격증 합격을 의미하지 않습니다.

## 5. Export

P10은 다음 내보내기를 지원합니다.

- JSON — machine-readable package
- Markdown — 사람이 읽는 Portfolio Snapshot

Secret/Token은 Export에 포함하면 안 됩니다.

## PASS 기준

- Evidence 화면 열림
- Portfolio 화면 열림
- 자동/수동 Evidence의 차이를 이해함

다음: [170 Verify와 문제 해결](./170-verify-troubleshooting.md)
