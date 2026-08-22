# 050 Node.js와 npm (Node & npm, NN)

## 목차

- [빠른 시작](#빠른-시작)
- [프로젝트 Node.js 기준](#프로젝트-nodejs-기준)
- [1. 현재 버전 확인](#1-현재-버전-확인)
- [2. npm 확인](#2-npm-확인)
- [3. macOS + OrbStack + Ubuntu 24.04에서 `node`, `npm`이 없을 때](#3-macos--orbstack--ubuntu-2404에서-node-npm이-없을-때)
- [4. nvm 설치](#4-nvm-설치)
- [5. Node.js 22 설치](#5-nodejs-22-설치)
- [6. 설치 후 최종 확인](#6-설치-후-최종-확인)
- [7. 문제 해결](#7-문제-해결)
- [8. 하지 않는 것을 권장하는 방법](#8-하지-않는-것을-권장하는-방법)
- [PASS 기준](#pass-기준)
- [공식 참고 문서](#공식-참고-문서)

## 빠른 시작

먼저 현재 Ubuntu 터미널에서 설치 여부를 확인합니다.

```bash
node --version
npm --version
```

정상이라면 대략 다음과 같이 버전 번호가 출력됩니다.

```text
v22.x.x
10.x.x
```

다음처럼 나온다면 아직 설치되지 않은 상태입니다.

```text
-bash: node: command not found
-bash: npm: command not found
```

> **macOS에서 OrbStack Ubuntu 24.04를 사용 중이라면** 위 오류가 나와도 이상한 상태가 아닙니다. macOS에 Node.js가 설치되어 있더라도 OrbStack의 Ubuntu 24.04는 별도의 Linux 환경이므로 Ubuntu 안에는 Node.js와 npm을 따로 준비해야 합니다.

## 프로젝트 Node.js 기준

이 프로젝트의 `package.json` 기준은 다음과 같습니다.

```text
Node.js >= 22 and < 25
npm package manager
```

입문자에게는 **Node.js 22 LTS 계열**을 권장합니다.

2026년 기준 Node.js 22는 LTS 계열이며, 이 문서에서는 재현성과 안정성을 위해 22 계열을 기준으로 설명합니다.

## 1. 현재 버전 확인

```bash
node --version
```

정상 예시:

```text
v22.x.x
```

이 프로젝트에서 허용되는 범위는 다음과 같습니다.

```text
22.x
23.x
24.x
```

다만 학습 환경을 통일하기 위해 **Node.js 22 사용을 권장**합니다.

## 2. npm 확인

```bash
npm --version
```

숫자가 출력되면 됩니다.

Node.js를 `nvm`으로 정상 설치하면 npm도 함께 설치됩니다.

## 3. macOS + OrbStack + Ubuntu 24.04에서 `node`, `npm`이 없을 때

### 3-1. 오류의 의미

다음과 같이 나온다면:

```bash
node --version
```

```text
-bash: node: command not found
```

그리고:

```bash
npm --version
```

```text
-bash: npm: command not found
```

이 메시지는 **Node.js나 npm이 고장 났다는 뜻이 아니라 현재 OrbStack Ubuntu 24.04 안에 아직 설치되지 않았다는 뜻**입니다.

OrbStack에서는 다음 환경을 구분해야 합니다.

```text
macOS
└─ OrbStack
   └─ Ubuntu 24.04   ← 현재 Node.js와 npm을 설치할 위치
```

macOS에 설치된 Node.js와 Ubuntu 안의 Node.js는 서로 별개입니다.

### 3-2. 현재 위치가 Ubuntu 24.04인지 확인

다음 명령을 실행합니다.

```bash
uname -s
cat /etc/os-release
```

Ubuntu 24.04 안이라면 대략 다음과 같이 표시됩니다.

```text
Linux
PRETTY_NAME="Ubuntu 24.04.x LTS"
```

현재 명령 위치도 확인할 수 있습니다.

```bash
command -v node || echo "Node.js: NOT INSTALLED"
command -v npm || echo "npm: NOT INSTALLED"
```

둘 다 설치되지 않았다면 다음과 같이 표시될 수 있습니다.

```text
Node.js: NOT INSTALLED
npm: NOT INSTALLED
```

> 아래 설치 명령은 **macOS Terminal이 아니라 OrbStack Ubuntu 24.04 터미널에서 실행**합니다.

## 4. nvm 설치

이 학습 시스템에서는 Node.js 버전을 쉽게 맞출 수 있도록 **nvm (Node Version Manager, Node 버전 관리자)** 사용을 권장합니다.

### 4-1. 필요한 기본 패키지 설치

```bash
sudo apt update
sudo apt install -y curl ca-certificates
```

설치 확인:

```bash
curl --version
```

### 4-2. nvm 설치

현재 nvm 공식 릴리스인 `v0.40.6` 설치 스크립트를 실행합니다.

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.6/install.sh | bash
```

### 4-3. 현재 터미널에 nvm 적용

가장 쉬운 방법은 현재 Bash 설정을 다시 읽는 것입니다.

```bash
source ~/.bashrc
```

그 다음 확인합니다.

```bash
nvm --version
```

정상 예시:

```text
0.40.6
```

### 4-4. `nvm: command not found`가 계속 나오면

다음 명령을 현재 터미널에서 실행합니다.

```bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
```

다시 확인합니다.

```bash
nvm --version
```

그래도 안 되면 설치 디렉터리를 확인합니다.

```bash
ls -la ~/.nvm
```

`~/.nvm` 디렉터리가 존재하면 터미널을 완전히 닫았다가 OrbStack Ubuntu 24.04에 다시 접속한 뒤 다음을 실행합니다.

```bash
source ~/.bashrc
nvm --version
```

## 5. Node.js 22 설치

### 5-1. Node.js 22 설치

```bash
nvm install 22
```

`nvm`은 Node.js 22와 함께 사용할 npm도 설치합니다.

### 5-2. Node.js 22 사용

```bash
nvm use 22
```

### 5-3. 새 터미널에서도 22를 기본값으로 사용

```bash
nvm alias default 22
```

확인:

```bash
nvm current
```

정상 예시:

```text
v22.x.x
```

## 6. 설치 후 최종 확인

다음 명령을 순서대로 실행합니다.

```bash
node --version
npm --version
which node
which npm
```

정상 예시:

```text
v22.x.x
10.x.x
/home/<사용자명>/.nvm/versions/node/v22.x.x/bin/node
/home/<사용자명>/.nvm/versions/node/v22.x.x/bin/npm
```

`node`와 `npm` 경로가 `~/.nvm/versions/node/...` 아래에 있으면 nvm으로 설치된 것입니다.

### 한 번에 점검하기

```bash
printf '\n[1] OS\n'
grep '^PRETTY_NAME=' /etc/os-release

printf '\n[2] nvm\n'
nvm --version

printf '\n[3] Node.js\n'
node --version

printf '\n[4] npm\n'
npm --version

printf '\n[5] Executable paths\n'
which node
which npm
```

최소 PASS 기준은 다음과 같습니다.

```text
Ubuntu 24.04 : PASS
nvm          : PASS
Node.js 22   : PASS
npm          : PASS
```

## 7. 문제 해결

### `node: command not found`

Node.js가 설치되지 않았거나 현재 셸에 nvm 환경이 로드되지 않은 상태일 수 있습니다.

먼저 확인합니다.

```bash
nvm --version
```

nvm이 정상이라면:

```bash
nvm install 22
nvm use 22
nvm alias default 22
```

그 다음 Bash의 명령 경로 캐시를 초기화합니다.

```bash
hash -r
node --version
```

### `npm: command not found`

Node.js가 nvm으로 정상 설치되었다면 npm도 함께 설치되어야 합니다.

먼저 확인합니다.

```bash
node --version
nvm current
```

Node.js 22가 활성화되지 않았다면:

```bash
nvm use 22
npm --version
```

그래도 npm이 없다면 Node.js 22 설치 상태를 다시 확인합니다.

```bash
nvm ls
```

필요하면 Node.js 22를 다시 설치합니다.

```bash
nvm uninstall 22
nvm install 22
nvm alias default 22
```

> `nvm uninstall 22`는 기존 22 계열에 전역 설치한 npm 패키지도 제거할 수 있습니다. 아직 학습 환경을 처음 구성하는 단계에서만 위 재설치 방법을 권장합니다.

### `nvm: command not found`

```bash
source ~/.bashrc
```

그래도 안 되면:

```bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
```

확인:

```bash
nvm --version
```

### Node.js가 20 이하인 경우

이 프로젝트 기준보다 낮습니다.

```bash
nvm install 22
nvm use 22
nvm alias default 22
```

확인:

```bash
node --version
```

### Node.js가 25 이상인 경우

프로젝트의 지원 범위를 벗어납니다.

```bash
nvm install 22
nvm use 22
nvm alias default 22
```

### 새 SSH 접속 후 다시 `node: command not found`가 나오는 경우

Bash 설정이 로드되는지 확인합니다.

```bash
source ~/.bashrc
nvm current
node --version
```

정상이라면 새 로그인 셸에서도 `nvm alias default 22`로 지정한 Node.js 22가 자동 선택됩니다.

## 8. 하지 않는 것을 권장하는 방법

### Ubuntu 기본 `apt install nodejs npm`만 사용하는 방법

다음처럼 설치하는 방법도 보이지만 이 학습 시스템의 기본 방법으로는 권장하지 않습니다.

```bash
sudo apt install nodejs npm
```

이유는 Ubuntu 기본 저장소의 Node.js 버전이 프로젝트 요구사항인 `>=22, <25`와 맞지 않을 수 있기 때문입니다.

따라서 이 프로젝트에서는 다음 흐름을 권장합니다.

```text
nvm 설치
  ↓
Node.js 22 설치
  ↓
npm 자동 설치
  ↓
Node.js 22를 기본 버전으로 지정
```

### `sudo npm install -g ...` 남용

nvm으로 설치한 Node.js에서는 일반적인 npm 작업에 `sudo`를 붙이지 않는 것을 권장합니다.

예:

```bash
npm install
```

프로젝트 의존성 설치는 다음 단계인 `060-install-dependencies.md`에서 진행합니다.

## PASS 기준

다음 네 항목을 모두 만족하면 완료입니다.

```bash
nvm --version
node --version
npm --version
nvm current
```

PASS 기준:

- `nvm --version`이 정상 출력됨
- `node --version`이 `v22...`로 출력됨
- `npm --version`이 숫자로 출력됨
- `nvm current`가 `v22...`로 출력됨
- 새 터미널 또는 새 SSH 접속 후에도 `node --version`이 정상 동작함

## 공식 참고 문서

- [Node.js 공식 다운로드](https://nodejs.org/en/download)
- [Node.js 22 다운로드 아카이브](https://nodejs.org/en/download/archive/v22)
- [nvm 공식 GitHub 저장소](https://github.com/nvm-sh/nvm)

다음: [060 의존성 설치](./060-install-dependencies.md)
