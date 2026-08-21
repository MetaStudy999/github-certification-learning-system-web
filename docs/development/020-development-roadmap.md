# 020 개발 로드맵 (Development Roadmap, DR)

## 빠른 시작 (Quick Start, QS)

한 번에 전체 플랫폼을 만들지 않고 **GH-900 Vertical Slice를 P1~P10으로 완성**합니다.

> **현재 상태: P0~P10 COMPLETE — GH-900 Vertical Slice COMPLETE**

## 목차 (Table of Contents, TOC)

1. Phase 정의
2. Gate
3. 확장 원칙

## 1. Phase 정의

| Phase | 범위 | 완료 기준 요약 | 상태 |
|---:|---|---|---|
| P0 | Architecture / ADR | 핵심 경계와 기술 결정 문서화 | COMPLETE |
| P1 | Local Environment | Next.js + Supabase Local + smoke PASS | COMPLETE |
| P2 | Content Engine | GH-900 Markdown/metadata 읽기 PASS | COMPLETE |
| P3 | User / Progress | 학습 세션과 Progress 저장 PASS | COMPLETE |
| P4 | Question Bank | GH-900 문제/시도/채점 PASS | COMPLETE |
| P5 | Wrong Answer Engine | 오답/Retry/Review Queue PASS | COMPLETE |
| P6 | Mock / Readiness | Mock 및 Exam Readiness Gate PASS | COMPLETE |
| P7 | AI Gateway / Tutor | Mock + Ollama + OpenAI adapter PASS | COMPLETE |
| P8 | RAG | GCLS 콘텐츠 검색/출처 연결 PASS | COMPLETE |
| P9 | Labs / GitHub API | Repository/Branch/PR/Actions 실습 검증 PASS | COMPLETE |
| P10 | Evidence / Portfolio | GH-900 Evidence/Portfolio E2E PASS | COMPLETE |

## 2. Gate

각 Phase는 다음 단계로 넘어가기 전에 요구사항 문서, 구현, 자동 테스트, Runtime smoke test, Verify 기록, Known Issues를 남깁니다.

## 3. 확장 원칙

```text
GH-900 Vertical Slice COMPLETE
        ↓
실제 사용자 검증 / UX 안정화
        ↓
002 Actions
        ↓
003 Copilot
        ↓
004 Administration
        ↓
005 Advanced Security
        ↓
006 Agentic AI Developer
```

공통 Engine을 확장하고 Course-specific 기능만 추가합니다. 새로운 Phase 번호를 무조건 늘리기보다 P0~P10 기준선을 재사용해 각 과정의 Vertical Slice를 완성합니다.
