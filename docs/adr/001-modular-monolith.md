# ADR-001 Modular Monolith 채택

## 빠른 시작 (Quick Start, QS)

**Status: Accepted for P0/P1**

## Context

GCLS Web은 Learning, Training, AI, RAG, GitHub Integration 등 여러 도메인을 가지지만 초기 사용자 규모와 운영팀 규모는 아직 검증되지 않았습니다.

## Decision

초기 애플리케이션은 Next.js 기반 **Modular Monolith**로 구현하고 모듈 간 경계를 명시합니다.

## Consequences

장점:
- 로컬 실행과 배포가 단순합니다.
- 트랜잭션과 테스트가 쉽습니다.
- 초기 운영 비용을 줄입니다.

주의:
- 모듈이 DB/SDK를 임의로 교차 접근하지 않도록 경계를 유지합니다.
- 무거운 AI/Sandbox Worker는 필요 시 별도 프로세스로 분리할 수 있게 합니다.

## Revisit

AI Worker, Sandbox, 대규모 비동기 작업이 독립 확장되어야 할 시점에 Service 분리를 재검토합니다.
