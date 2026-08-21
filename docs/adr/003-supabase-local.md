# ADR-003 1단계 Supabase Local 채택

## 빠른 시작 (Quick Start, QS)

**Status: Accepted for Local Development**

## Context

1단계에서 PostgreSQL뿐 아니라 Auth/Storage/Migration까지 로컬에서 재현하고 2단계 Supabase Cloud로 자연스럽게 전환할 필요가 있습니다.

## Decision

P1 로컬 개발 플랫폼으로 Supabase Local을 사용합니다.

## Consequences

- 로컬 Postgres/Auth/Storage를 일관된 방식으로 실행할 수 있습니다.
- Migration과 Seed를 repository에 버전 관리합니다.
- 2단계 Supabase Cloud 전환이 단순해집니다.

단, Domain/Application 계층이 Supabase SDK에 직접 종속되지 않도록 Repository/Adapter 경계를 둡니다.

## Revisit

P3 AWS/GCP 전환 시 Auth/Storage adapter 구현을 추가하고 Supabase-specific dependency를 재점검합니다.
