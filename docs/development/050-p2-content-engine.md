# 050 P2 콘텐츠 엔진 (P2 Content Engine, P2-CE)

## 목표

메인 콘텐츠 저장소 `MetaStudy999/github-certification-learning-system`을 **Source of Truth**로 유지하면서 Web이 GH-900 콘텐츠를 직접 읽고 학습 화면으로 렌더링합니다.

## 빠른 시작

권장 로컬 배치:

```text
workspace/
├─ github-certification-learning-system/
└─ github-certification-learning-system-web/
```

```bash
cd github-certification-learning-system-web
cp .env.example .env.local
npm ci
npm run dev
```

열기:

```text
http://localhost:3000/courses/001-foundations
```

## Provider 모드

| Mode | 동작 |
|---|---|
| `auto` | Local clone이 있으면 Local, 없으면 GitHub fallback |
| `local` | `GCLS_CONTENT_DIR`의 로컬 콘텐츠만 허용 |
| `github` | GitHub Contents/Raw API 사용 |

기본값은 `auto`입니다.

## P2 Vertical Slice

```text
Courses
  ↓
001 GitHub Foundations / GH-900
  ↓
15 Standard Modules
  ↓
Module README.md
  ↓
React Markdown + GFM
```

## Source of Truth 규칙

- 학습 본문을 Web DB나 TS 파일에 복사하지 않습니다.
- Web에는 route/navigation metadata와 Provider 로직만 둡니다.
- Markdown 본문은 실행 시 콘텐츠 저장소에서 읽습니다.
- 상대 링크는 canonical GitHub 원문 링크로 변환합니다.

## P2 Merge Gate

- [ ] package lock 재생성 및 `npm ci` PASS
- [ ] TypeScript PASS
- [ ] Next.js build PASS
- [ ] Content Health = `ok`
- [ ] GH-900 module count = 15
- [ ] Course page runtime PASS
- [ ] `010-overview` Markdown render PASS
- [ ] Local Provider CI PASS
- [ ] GitHub Provider fallback smoke PASS
- [ ] P1 Supabase smoke regression PASS
