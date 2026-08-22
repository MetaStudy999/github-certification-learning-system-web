# 020 사전 준비 (Prerequisites, PR)

## 빠른 시작

터미널에서 아래 명령을 실행해 설치 여부만 먼저 확인합니다.

```bash
git --version
node --version
npm --version
docker --version
```

아직 없는 프로그램이 있어도 정상입니다. 이 문서는 필요한 항목을 확인하는 단계입니다.

## 필수 항목

| 프로그램 | 용도 | 기준 |
|---|---|---|
| Git | Clone/Pull | 최신 안정 버전 권장 |
| Node.js | Next.js 실행 | **22 이상, 25 미만** |
| npm | 패키지 설치 | 프로젝트 lockfile 사용 |
| Docker-compatible runtime | Supabase Local | Docker Desktop/OrbStack 등 |

Supabase CLI는 프로젝트가 `npx supabase@2.115.0`으로 고정 실행하므로 별도 전역 설치가 필수는 아닙니다.

## 운영체제 메모

### macOS

- Terminal 또는 VS Code Terminal 사용
- Docker Desktop 또는 OrbStack 사용 가능
- 회사/교육장 공용 Mac은 설치 권한이 제한될 수 있으므로 관리자 정책을 먼저 확인

### Windows 11 + WSL2

권장:

```text
Windows 11
  ↓
WSL2 Ubuntu 24.04
  ↓
VS Code Remote - WSL
```

Git/Node 명령은 가능하면 Ubuntu 터미널 안에서 실행합니다.

### Ubuntu 24.04

일반 Terminal에서 진행합니다.

## Git 확인

```bash
git --version
```

예시:

```text
git version 2.x.x
```

## Docker 확인

```bash
docker --version
```

그리고 Docker daemon이 실제 동작하는지:

```bash
docker info
```

`docker info`가 권한/daemon 오류 없이 정보를 출력해야 Supabase Local을 시작할 수 있습니다.

## PASS 기준

- Git 사용 가능
- Docker-compatible runtime 실행 가능
- Node.js는 이후 050 단계에서 정확히 확인/설치

다음: [030 Workspace 만들기와 Clone](./030-workspace-clone.md)
