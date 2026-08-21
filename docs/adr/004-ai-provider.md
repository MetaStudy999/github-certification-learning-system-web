# ADR-004 AI Provider 추상화와 Hybrid Mode

## 빠른 시작 (Quick Start, QS)

**Status: Accepted**

## Context

로컬 개발 비용과 개인정보 보호를 고려하면서도 고난도 AI 작업에는 외부 API의 품질을 활용해야 합니다.

## Decision

공통 `AIProvider` 경계를 두고 `mock`, `local`, `api`, `hybrid` 모드를 지원합니다. 초기 Local provider는 Ollama, 초기 Cloud provider는 OpenAI API를 기준으로 합니다.

## Consequences

- 로컬 AI만으로 핵심 UI/Training 개발이 가능합니다.
- Cloud provider 장애나 비용 정책 변화에 대응하기 쉽습니다.
- Provider별 기능 차이는 Gateway capability check에서 관리합니다.

AI가 학습의 공식 PASS를 단독 결정하지 않도록 결정론적 평가 경로를 우선합니다.

## Revisit

멀티모달·Agent·self-hosted GPU inference 요구가 커질 때 provider capability model을 확장합니다.
