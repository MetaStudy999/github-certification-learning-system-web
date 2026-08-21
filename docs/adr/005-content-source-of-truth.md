# ADR-005 GCLS Content Repository를 Source of Truth로 유지

## 빠른 시작 (Quick Start, QS)

**Status: Accepted**

## Context

메인 GCLS Repository에는 001~006 과정과 공통 문제은행/모의고사/실습/증빙 구조가 이미 존재합니다. 동일 콘텐츠를 Web DB에 수작업 복제하면 Drift가 발생합니다.

## Decision

`github-certification-learning-system`을 학습 콘텐츠의 Source of Truth로 유지하고 Web은 Content Adapter를 통해 읽습니다.

## Consequences

- 콘텐츠 버전 관리와 리뷰는 GitHub workflow를 그대로 사용할 수 있습니다.
- Web DB는 사용자 상태/시도/점수/Evidence 중심으로 단순화됩니다.
- RAG index는 재생성 가능한 파생 데이터로 취급합니다.

## Revisit

비개발자용 CMS 편집 요구가 커질 경우 Git 기반 CMS 또는 별도 authoring layer를 검토하되 최종 canonical source 정책을 명확히 유지합니다.
