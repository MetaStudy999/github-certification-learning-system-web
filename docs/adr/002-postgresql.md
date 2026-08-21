# ADR-002 PostgreSQL 공통 기준 채택

## 빠른 시작 (Quick Start, QS)

**Status: Accepted**

## Context

Local → Supabase Cloud → AWS/GCP로 발전할 때 데이터 계층 재작성 비용을 최소화해야 합니다.

## Decision

핵심 관계형 데이터베이스는 모든 단계에서 PostgreSQL을 사용합니다.

## Consequences

- Level 1: Supabase Local PostgreSQL
- Level 2: Supabase Cloud PostgreSQL
- Level 3: RDS PostgreSQL 또는 Cloud SQL for PostgreSQL 등으로 이전 가능
- RAG vector index도 PostgreSQL 확장으로 시작할 수 있습니다.

Cloud별 전용 DB 기능은 Domain contract에 직접 노출하지 않습니다.

## Revisit

대규모 분석/검색/이벤트 데이터가 PostgreSQL 운영 경계를 넘을 때 보조 데이터 시스템을 추가합니다.
