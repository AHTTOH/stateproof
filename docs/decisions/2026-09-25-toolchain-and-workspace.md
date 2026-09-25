# ADR: 툴체인 고정과 워크스페이스 방식

> 작성: 2026-09-25 22:00 KST · 상태: 확정
> 관련: [작업계획서 §4.1·§10](../plan/2026-09-23-작업계획서.md)

## 결정

1. **툴체인 버전을 호환 매트릭스(2026-09-22)에 고정한다.**

   | 구성요소 | 버전 |
   |---|---|
   | Compact 컴파일러 | 0.31.1 (언어 0.23.0) |
   | compact-runtime | 0.16.0 |
   | Midnight.js · testkit-js | 4.1.1 |
   | DApp Connector API | 4.0.1 |
   | ledger-v8 · onchain-runtime-v3 · zkir-v2 | 8.1.0 · 3.0.0 · 2.1.0 (template lock) |

   `scripts/compile.sh` 는 컴파일러가 0.31.1 이 아니면 중단한다. 0.34 계열은 ledger 9 대상이라 Preprod 에 배포되지 않는다.

2. **패키지 매니저는 pnpm 이 아니라 npm workspaces 로 간다.** (계획서 §6 의 `pnpm-workspace.yaml` 을 바꾼 결정)
   - `create-mn-app` 0.5.1 bboard 템플릿이 npm workspaces + `package-lock.json` 으로 나온다.
   - 그 lock 파일이 Midnight 패키지 사이에 검증된 버전 조합(ledger-v8 8.1.0, compact-js 2.5.1, wallet-sdk-facade 4.1.0 등)을 담고 있다. pnpm 으로 바꾸면 전이 의존성을 다시 풀면서 조합이 흔들릴 수 있다. 남은 3일에 감수할 이유가 없다.
   - 루트 `package-lock.json` 은 템플릿 lock 을 시작점으로 `npm install` 해서 만들었다.
   - 디렉토리 구조(§6)는 그대로다.

3. **워크스페이스 패키지는 빌드 없이 TS 소스를 바로 내보낸다** (`"exports": { ".": "./src/index.ts" }`). CLI 는 `tsx`, 웹은 Vite 가 TS 를 직접 읽는다. `dist/` 단계가 없어 심사자 재현 절차가 짧아진다.

4. **컴파일러는 Hermes 사용자 공간에서만 돈다.** (계획서 §10 결정 1)
   - 설치 위치: `~/.nvm`(Node 24.21), `~/.compact/bin`(compact CLI 0.5.2), `~/.compact/versions/0.31.1/aarch64-unknown-linux-musl`, `~/.compact/tools`(unzip, `apt-get download` 로 받은 .deb 를 `dpkg -x` 로 풀어 둠. sudo 없음), `~/stateproof`(빌드 작업 폴더).
   - 셸 rc 는 건드리지 않았다(`COMPACT_NO_MODIFY_PATH=1`). 환경은 `~/.compact/env.sh` 를 source 해서 쓴다.
   - `~/.npmrc` 의 `prefix` 설정은 기존 전역 도구용이라 그대로 두었다. nvm 경고는 무해하다.
   - 전체 컴파일(ZK 키 포함) 18초, 산출물 6.8MB. Git LFS 불필요.

## 실측 근거 (2026-09-25)

- `compact list`: 0.31.1 은 `aarch64_linux` 지원. 첫 설치는 `unzip` 부재로 추출 실패, unzip 확보 후 재설치해 해결.
- bboard 템플릿 `npm ci` + `compact compile` 이 Hermes 에서 통과.
