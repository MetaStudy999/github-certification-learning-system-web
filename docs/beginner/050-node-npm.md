# 050 Node.js와 npm (Node & npm, NN)

## 빠른 시작

```bash
node --version
npm --version
```

이 프로젝트의 `package.json` 기준은:

```text
Node.js >= 22 and < 25
npm package manager
```

입문자에게는 **Node.js 22 LTS 계열**을 권장합니다.

## 1. 현재 버전 확인

```bash
node --version
```

정상 예시:

```text
v22.x.x
```

다음은 정상 범위입니다.

```text
22.x
23.x
24.x
```

재현성과 안정성을 위해 매뉴얼은 22 계열을 기준으로 설명합니다.

## 2. npm 확인

```bash
npm --version
```

숫자가 출력되면 됩니다.

## 3. Node가 없다면

권장 방식 중 하나를 선택합니다.

### nvm 사용 환경

```bash
nvm install 22
nvm use 22
node --version
npm --version
```

### 공식 Node.js 설치

Node.js 공식 배포판에서 22 LTS를 설치한 후 터미널을 다시 열고 버전을 확인합니다.

## 문제 해결

### `node: command not found`

Node.js가 설치되지 않았거나 PATH가 연결되지 않았습니다.

### Node가 20 이하

22로 올린 뒤 다시 확인합니다.

## PASS 기준

```bash
node --version
```

결과가 `v22...` 이상이고 `v25` 미만이다.

다음: [060 의존성 설치](./060-install-dependencies.md)
