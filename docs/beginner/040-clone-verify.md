# 040 Clone 검증 (Clone Verification, CV)

## 빠른 시작

```bash
cd ~/workspace/gcls

git -C github-certification-learning-system status
git -C github-certification-learning-system-web status
```

## 1. Content Repo 상태 확인

```bash
git -C github-certification-learning-system status
```

정상 예시:

```text
On branch main
Your branch is up to date with 'origin/main'.
nothing to commit, working tree clean
```

## 2. Web Repo 상태 확인

```bash
git -C github-certification-learning-system-web status
```

동일하게 `main`, `working tree clean`이면 정상입니다.

## 3. Remote 확인

```bash
git -C github-certification-learning-system remote -v
git -C github-certification-learning-system-web remote -v
```

각각 `MetaStudy999/...` GitHub URL을 가리켜야 합니다.

## 4. 최신 Commit 간단 확인

```bash
git -C github-certification-learning-system-web log -1 --oneline
```

## PASS 기준

- Content Repo: branch `main`
- Web Repo: branch `main`
- 두 Repo 모두 clean
- origin URL 정상

다음: [050 Node.js와 npm](./050-node-npm.md)
