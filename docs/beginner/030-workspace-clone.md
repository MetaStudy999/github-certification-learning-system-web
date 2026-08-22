# 030 Workspace 만들기와 Clone (Workspace & Clone, WC)

## 빠른 시작

```bash
cd ~
mkdir -p ~/workspace/gcls
cd ~/workspace/gcls

git clone https://github.com/MetaStudy999/github-certification-learning-system.git
git clone https://github.com/MetaStudy999/github-certification-learning-system-web.git
```

## 1. 홈 폴더로 이동

```bash
cd ~
pwd
```

`pwd`는 **Print Working Directory**, 현재 위치를 보여 줍니다.

## 2. 작업 폴더 만들기

```bash
mkdir -p ~/workspace/gcls
cd ~/workspace/gcls
```

- `mkdir` = Make Directory
- `-p` = 중간 폴더까지 필요하면 생성

## 3. Content Repository Clone

```bash
git clone https://github.com/MetaStudy999/github-certification-learning-system.git
```

## 4. Web Repository Clone

```bash
git clone https://github.com/MetaStudy999/github-certification-learning-system-web.git
```

## 5. 결과 확인

```bash
ls
```

반드시 다음 두 폴더가 같이 보여야 합니다.

```text
github-certification-learning-system
github-certification-learning-system-web
```

## 최종 구조

```text
~/workspace/gcls/
├─ github-certification-learning-system/
└─ github-certification-learning-system-web/
```

Web의 기본 `GCLS_CONTENT_DIR=../github-certification-learning-system` 설정이 이 sibling 구조를 사용합니다.

## 문제 해결

### `git: command not found`

Git이 설치되지 않았습니다. 020 문서의 Git 준비부터 해결합니다.

### `destination path ... already exists`

같은 이름의 폴더가 이미 있습니다. 삭제하지 말고 먼저 040 Clone 검증 단계에서 기존 Repository인지 확인합니다.

## PASS 기준

두 Repository 폴더가 같은 상위 폴더에 존재한다.

다음: [040 Clone 검증](./040-clone-verify.md)
