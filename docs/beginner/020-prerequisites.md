# 020 사전 준비 (Prerequisites, PR)

## 목차

- [빠른 시작](#빠른-시작)
- [필수 항목](#필수-항목)
- [운영체제 메모](#운영체제-메모)
- [Git 확인](#git-확인)
- [Docker 확인](#docker-확인)
- [macOS + OrbStack + Ubuntu 24.04에서 `docker: command not found`가 나올 때](#macos--orbstack--ubuntu-2404에서-docker-command-not-found가-나올-때)
- [Docker 설치 후 최종 확인](#docker-설치-후-최종-확인)
- [PASS 기준](#pass-기준)

## 빠른 시작

터미널에서 아래 명령을 실행해 설치 여부만 먼저 확인합니다.

```bash
git --version
node --version
npm --version
docker --version
```

아직 없는 프로그램이 있어도 정상입니다. 이 문서는 필요한 항목을 확인하고, 없는 항목은 다음 절차로 설치하는 단계입니다.

> **Mac에서 OrbStack의 Ubuntu 24.04를 사용 중이라면** `docker --version` 실행 시 `-bash: docker: command not found`가 나올 수 있습니다. 아래의 **[macOS + OrbStack + Ubuntu 24.04에서 `docker: command not found`가 나올 때](#macos--orbstack--ubuntu-2404에서-docker-command-not-found가-나올-때)** 절차를 따라가면 됩니다.

## 필수 항목

| 프로그램 | 용도 | 기준 |
|---|---|---|
| Git | Clone/Pull | 최신 안정 버전 권장 |
| Node.js | Next.js 실행 | **22 이상, 25 미만** |
| npm | 패키지 설치 | 프로젝트 lockfile 사용 |
| Docker-compatible runtime | Supabase Local | Docker Engine / OrbStack 등 |

Supabase CLI는 프로젝트가 `npx supabase@2.115.0`으로 고정 실행하므로 별도 전역 설치가 필수는 아닙니다.

## 운영체제 메모

### macOS

- Terminal 또는 VS Code Terminal 사용
- Docker 실행 환경으로 OrbStack 또는 Docker Desktop 사용 가능
- 회사/교육장 공용 Mac은 설치 권한이 제한될 수 있으므로 관리자 정책을 먼저 확인

#### OrbStack을 사용하는 경우 꼭 구분하기

OrbStack에서는 다음 두 환경을 서로 구분해야 합니다.

```text
macOS
├─ OrbStack Docker Engine       ← macOS 쪽 Docker 실행 환경
└─ OrbStack Ubuntu 24.04        ← 별도의 Linux 머신
```

OrbStack 자체에 Docker Engine이 포함되어 있어도 **OrbStack 안에 만든 Ubuntu 24.04 머신에 `docker` 명령이 자동으로 설치되어 있다는 뜻은 아닙니다.**

따라서 현재 터미널이 Ubuntu 안이라면 다음처럼 확인합니다.

```bash
uname -s
cat /etc/os-release
```

Ubuntu 24.04 안이라면 대략 다음과 같이 확인됩니다.

```text
Linux
Ubuntu 24.04 LTS
```

이 학습 시스템에서는 macOS와 Windows에서 가능한 한 동일한 Ubuntu 24.04 흐름을 유지하기 위해, **OrbStack Ubuntu 24.04 내부에 Docker Engine을 설치해서 사용하는 방식을 권장**합니다.

### Windows 11 + WSL2

권장:

```text
Windows 11
  ↓
WSL2 Ubuntu 24.04
  ↓
VS Code Remote - WSL
```

Git/Node/Docker 명령은 가능하면 Ubuntu 터미널 안에서 실행합니다.

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

먼저 Docker 명령이 있는지 확인합니다.

```bash
docker --version
```

정상 예시:

```text
Docker version 2x.x.x, build xxxxxxx
```

그리고 Docker daemon(도커 데몬)이 실제 동작하는지 확인합니다.

```bash
docker info
```

`docker info`가 권한/daemon 오류 없이 정보를 출력해야 Supabase Local을 시작할 수 있습니다.

## macOS + OrbStack + Ubuntu 24.04에서 `docker: command not found`가 나올 때

### 1. 오류의 의미

Ubuntu 터미널에서 다음과 같이 나온다면:

```bash
docker --version
```

```text
-bash: docker: command not found
```

이 메시지는 **Docker가 고장 났다는 뜻이 아니라, 현재 Ubuntu 24.04 안에 Docker CLI/Engine이 아직 설치되지 않았다는 뜻**입니다.

### 2. 현재 위치가 Ubuntu인지 확인

```bash
uname -s
cat /etc/os-release
```

`Linux`, `Ubuntu 24.04`가 보이면 아래 설치를 진행합니다.

> 이 절차는 **macOS 터미널이 아니라 OrbStack Ubuntu 24.04 터미널에서 실행**합니다.

### 3. Docker 공식 저장소 등록

먼저 기본 패키지를 준비합니다.

```bash
sudo apt update
sudo apt install -y ca-certificates curl
```

Docker 공식 GPG 키를 등록합니다.

```bash
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg \
  -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc
```

Docker 공식 APT 저장소를 등록합니다.

```bash
sudo tee /etc/apt/sources.list.d/docker.sources > /dev/null <<EOF
Types: deb
URIs: https://download.docker.com/linux/ubuntu
Suites: $(. /etc/os-release && echo "${UBUNTU_CODENAME:-$VERSION_CODENAME}")
Components: stable
Architectures: $(dpkg --print-architecture)
Signed-By: /etc/apt/keyrings/docker.asc
EOF

sudo apt update
```

> 위 방식은 Ubuntu 24.04에서 Docker가 안내하는 공식 APT 저장소 설치 방식입니다.

### 4. Docker Engine 설치

```bash
sudo apt install -y \
  docker-ce \
  docker-ce-cli \
  containerd.io \
  docker-buildx-plugin \
  docker-compose-plugin
```

설치 직후 버전을 확인합니다.

```bash
docker --version
docker compose version
```

### 5. Docker 서비스 확인

```bash
sudo systemctl status docker --no-pager
```

`active (running)`이 보이면 정상입니다.

실행 중이 아니라면:

```bash
sudo systemctl start docker
```

다시 확인합니다.

```bash
sudo systemctl is-active docker
```

정상 결과:

```text
active
```

### 6. `sudo` 없이 Docker 사용하기

처음에는 다음 명령은 동작하지만:

```bash
sudo docker run hello-world
```

일반 `docker` 명령에서 권한 오류가 날 수 있습니다.

현재 사용자를 `docker` 그룹에 추가합니다.

```bash
sudo usermod -aG docker "$USER"
```

그룹 변경을 현재 셸에 적용합니다.

```bash
newgrp docker
```

> `docker` 그룹은 Docker daemon에 높은 권한으로 접근할 수 있으므로 개인 개발/학습 머신에서만 신뢰할 수 있는 사용자에게 부여합니다.

### 7. Hello World 테스트

```bash
docker run --rm hello-world
```

아래와 비슷한 문장이 보이면 Docker Engine이 정상 동작한 것입니다.

```text
Hello from Docker!
```

### 8. 최종 Docker 점검

```bash
docker --version
docker compose version
docker info
docker ps
```

네 명령이 모두 오류 없이 실행되면 완료입니다.

### 9. 그래도 안 될 때

#### `permission denied`가 나오는 경우

현재 사용자가 `docker` 그룹에 들어갔는지 확인합니다.

```bash
groups
```

목록에 `docker`가 없다면 다시 실행합니다.

```bash
sudo usermod -aG docker "$USER"
newgrp docker
```

#### `Cannot connect to the Docker daemon`이 나오는 경우

Docker 서비스를 다시 확인합니다.

```bash
sudo systemctl status docker --no-pager
sudo systemctl start docker
```

그 다음:

```bash
docker info
```

#### `docker: command not found`가 계속 나오는 경우

설치 여부를 확인합니다.

```bash
which docker
apt list --installed 2>/dev/null | grep -E '^docker-ce|^docker-ce-cli'
```

정상이라면 `which docker`에서 보통 다음과 같이 나옵니다.

```text
/usr/bin/docker
```

### macOS의 OrbStack Docker를 직접 쓰는 대안

OrbStack 자체에도 macOS용 Docker Engine과 Docker CLI가 포함되어 있습니다. 이 방식을 선택한다면 **macOS Terminal에서** 다음을 확인합니다.

```bash
docker --version
docker info
```

다만 이 학습 시스템에서 프로젝트 명령은 Ubuntu 24.04 안에서 실행하는 것을 기본으로 하므로, **macOS Docker와 Ubuntu 내부 명령을 섞어 쓰지 않는 것을 권장**합니다.

특히 `Supabase Local`처럼 Docker daemon 접근이 필요한 도구를 Ubuntu 안에서 실행한다면, Ubuntu 내부 Docker Engine을 함께 사용하는 편이 입문자에게 구조가 단순합니다.

### 하지 않아도 되는 것

OrbStack Ubuntu 24.04 안에서 학습하기 위해 다음 작업은 기본적으로 필요하지 않습니다.

- Ubuntu 안에 Docker Desktop GUI 설치
- macOS용 Docker Desktop을 OrbStack과 동시에 실행
- 처음부터 Docker socket 경로를 수동 연결
- `DOCKER_HOST`를 임의로 설정

먼저 **Ubuntu 내부 Docker Engine 설치 → `hello-world` 성공 → `docker info` 성공** 순서로 확인합니다.

## Docker 설치 후 최종 확인

아래를 한 번에 확인합니다.

```bash
printf '\n[1] OS\n'
cat /etc/os-release | grep PRETTY_NAME

printf '\n[2] Docker CLI\n'
docker --version

printf '\n[3] Docker Compose\n'
docker compose version

printf '\n[4] Docker daemon\n'
docker info >/dev/null && echo "Docker daemon: PASS"

printf '\n[5] Container test\n'
docker run --rm hello-world
```

최소 PASS 기준은 다음과 같습니다.

```text
Docker CLI      : PASS
Docker Compose  : PASS
Docker daemon   : PASS
hello-world     : PASS
```

## PASS 기준

- Git 사용 가능
- Docker CLI 사용 가능
- Docker daemon 실행 가능
- `docker compose` 사용 가능
- `docker run --rm hello-world` 성공
- Node.js는 이후 050 단계에서 정확히 확인/설치

### 공식 참고 문서

- [Docker Engine - Install on Ubuntu](https://docs.docker.com/engine/install/ubuntu/)
- [Docker Engine - Linux post-installation steps](https://docs.docker.com/engine/install/linux-postinstall/)
- [OrbStack - Docker containers](https://docs.orbstack.dev/docker/)
- [OrbStack - Linux machines](https://docs.orbstack.dev/machines/)

다음: [030 Workspace 만들기와 Clone](./030-workspace-clone.md)
