# 020 개발 로드맵 (Development Roadmap, DR)

## 빠른 시작 (Quick Start, QS)

한 번에 전체 플랫폼을 만들지 않고 **GH-900 Vertical Slice를 P1~P10으로 완성**합니다.

## 목차 (Table of Contents, TOC)

1. Phase 정의
2. Gate
3. 확장 원칙

## 1. Phase 정의

| Phase | 범위 | 완료 기준 요약 |
|---:|---|---|
| P0 | Architecture / ADR | 핵심 경계와 기술 결정 문서화 |
| P1 | Local Environment | Next.js + Supabase Local + test smoke PASS |
| P2 | Content Engine | GH-900 Markdown/metadata 읽기 PASS |
| P3 | User / Progress | 학습 세션과 Progress 저장 PASS |
| P4 | Question Bank | GH-900 문제/시도/채점 PASS |
| P5 | Wrong Answer Engine | 오답/Retry/Review Queue PASS |
| P6 | Mock / Readiness | Mock 및 Exam Readiness Gate PASS |
| P7 | AI Gateway / Tutor | Mock + Ollama + OpenAI adapter PASS |
| P8 | RAG | GCLS 콘텐츠 검색/출처 연결 PASS |
| P9 | Labs / GitHub API | Repository/Branch/PR 실습 검증 PASS |
| P10 | Evidence / Portfolio | GH-900 Evidence 흐름 E2E PASS |

## 2. Gate

각 Phase는 다음 단계로 넘어가기 전에 최소한:

- 요구사항 문서
- 구현
- 자동 테스트
- 수동 smoke test
- Verify 기록
- Known Issues

을 남깁니다.

## 3. 확장 원칙

```text
GH-900 Vertical Slice CLEAR
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

공통 Engine을 확장하고 Course-specific 기능만 추가합니다.
