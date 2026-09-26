# StateProof

**Prove the condition. Keep the data.**
원본 개인정보를 넘기지 않고, 상대가 요구한 조건을 충족한다는 사실만 증명하는 Midnight 기반 ZK 크리덴셜 검증 서비스.

> 문서 기준일: 2026-09-27. 네트워크: Midnight **Preprod**. 데모: https://stateproof-demo.web.app

## 지갑 없이 3분 안에 확인하기 (심사용)

설치할 것도 지갑도 필요 없다. 브라우저 하나면 된다.

1. 대기 중인 데모 요청을 연다: https://stateproof-demo.web.app/holder/verify/08da5a24a5528086cd5ca5079e641c2dae79238dbb27eb0bbfeaad5a5f40d91e (조건: 재직 Active, 근속 12개월 이상. 공개 요청 값: 직무. 2026-10-27 까지 유효)
2. "The verifier will learn / They will NOT receive" 경계를 확인하고 **Use Minji Park (fictional)** 를 누른다.
3. **Try the proof without a wallet** 를 누른다. 브라우저 Web Worker 가 실제 `submitProof` 트랜잭션을 만들고 ZK 증명을 생성한다(10~30초). 임시 키를 쓰고 제출하지 않는다.
4. **Use a different persona** → **Use Sora Kim** (근속 6개월). 같은 회로가 먼저 로컬에서 돌아 "Not met: Months employed at least 12 months" 를 보여 주고, 증명도 트랜잭션도 만들지 않는다.
5. 실제로 체인에 기록된 결과를 지갑 없이 본다: [영수증 1](https://stateproof-demo.web.app/request/9361207d82adafcad3064fddf20ec813590f5d94d21df62e42a7ffdbb24f581a) (공개 값 없음), [영수증 2](https://stateproof-demo.web.app/request/04788db0ef6d7653109ea0577ff909ab1f8a8a64150d714c093b5e085c9c972f) (공개 값: 직무 Engineering). tx 는 아래 "Preprod 기록" 표에서 익스플로러로 열린다.

누군가 Lace 로 이 대기 요청에 실제 증명을 제출하면 상태가 Verified 로 바뀌고, 그 뒤에는 3~4단계를 볼 수 없다(요청당 결과는 한 번).

## English summary

StateProof lets a verifier ask a question such as *"is this person actively employed for at least 12 months?"* or *"is this person 19+ and living in Seoul or Gyeonggi?"* and receive a yes that the Midnight network has checked, without ever receiving the birth date, employment record or address behind it.

- **Issuers** sign credentials with a Jubjub Schnorr key and bind them to the holder's secret commitment.
- **Verifiers** compose a policy (up to 4 conditions, 6 operators, AND) in the browser and publish it on chain as a request.
- **Holders** keep credentials in their own browser, see exactly what crosses over, and prove it. One Compact circuit, `submitProof`, verifies the issuer signature, expiry, holder binding and every condition **inside the proof**. The policy is public: `createRequest` writes it to the ledger and `submitProof` reads it from there. The credential, its signature and the holder secret are private witnesses.
- The ledger holds the request (policy, reference time, expiry) and the result (VERIFIED plus at most one value the verifier explicitly asked to see). No other credential value is written anywhere.
- Proofs for StateProof circuits are generated **locally** with the Midnight zkir WASM prover (in a browser Web Worker or in Node). Lace pays the fee and submits. Reviewers can generate a real proof without any wallet (see the first section).

## 무엇을 하는가

| 역할 | 화면 | 하는 일 |
|---|---|---|
| Verifier | `/verifier` | 스키마, 클레임, 연산자, 값을 골라 정책을 만들고 검증 요청을 온체인에 올린다. 홀더에게 링크를 보낸다 |
| Holder | `/holder`, `/holder/verify/:id` | 브라우저에 크리덴셜을 보관한다. 요청을 열면 "검증자가 알게 되는 것 / 받지 못하는 것" 경계를 보고 [Verify privately] 로 증명한다 |
| 누구나 | `/request/:id` | 온체인 결과(영수증)를 지갑 없이 조회한다 |
| Issuer | `/issuer`, issuer CLI | 발급자 키 생성, 크리덴셜 서명 발급, 온체인 등록 상태 확인 |

연산자: `>=`, `<=`, `=`, `≠`, `between`, `in` (최대 4개 조건, AND). 크리덴셜 스키마: Employment, Identity ([packages/core/src/schemas](packages/core/src/schemas)).

## Midnight 를 어떻게 썼나

### 회로 (Compact 0.31.1, [packages/contract/src/stateproof.compact](packages/contract/src/stateproof.compact))

| 회로 | public 입력 | witness (비공개) | 증명 안에서 검사하는 것 | ledger 기록 |
|---|---|---|---|---|
| `registerIssuer` | issuerId, 발급자 공개키 | 관리자 비밀값 | 관리자 비밀값 해시 = `admin`, 공개키가 소수 차수 부분군에 속함 | `issuers[issuerId] = pk` |
| `createRequest` | requestId, **정책**, referenceTime, expiresAt | 없음 | 발급자 등록 여부, 정책 형식(슬롯 범위, between 순서), `blockTimeLt(expiresAt)` | `requests[requestId]` (정책 공개) |
| `submitProof` | requestId | **크리덴셜**, 발급자 서명, 홀더 비밀값 | 요청 존재·미응답, **체인 시간 기준 요청 미만료**, 스키마·발급자 일치, **Jubjub Schnorr 서명 검증**, 크리덴셜 유효기간(referenceTime 기준), **홀더 바인딩**(비밀값 커밋 일치), **정책의 모든 조건** | `results[requestId] = { revealed }` |

- 정책은 컴파일 시점이 아니라 **요청 생성 시점에 정해지는 public 입력**이다. Compact 에 동적 인덱싱이 없으므로 8개 슬롯과 6개 연산자를 모두 계산한 뒤 선택한다. 회로 하나가 임의의 정책을 평가한다 ([modules/policy.compact](packages/contract/src/modules/policy.compact)).
- 크리덴셜 원문, 서명, 홀더 비밀값은 witness 로만 쓰인다. 회로가 `disclose()` 하는 값은 아래 표가 전부다.

| 회로 | 공개(`disclose`)되어 ledger·트랜스크립트에 남는 값 | 공개되지 않는 값 |
|---|---|---|
| constructor | 관리자 비밀값의 해시 | 관리자 비밀값 |
| `registerIssuer` | issuerId, 발급자 공개키 | 관리자 비밀값 |
| `createRequest` | requestId, 정책 전체, referenceTime, expiresAt | 없음 |
| `submitProof` | requestId, 검증자가 요청한 슬롯 값 1개(요청한 경우) | 크리덴셜 8개 슬롯, 발급자 서명, 홀더 비밀값, 크리덴셜 해시, 홀더 커밋, 발급·만료 시각 |

- 같은 크리덴셜로 여러 요청에 답해도 회로가 공개하는 것은 요청별 결과와 요청한 값뿐이다. 수수료는 홀더 지갑의 DUST 로 내는데, 그 트랜잭션과 홀더 지갑 사이의 연결 가능성은 이번 범위에서 분석하지 않았다.

```
발급자(CLI)            홀더 브라우저                                   Midnight Preprod
 서명·바인딩 ───JSON──▶ 크리덴셜 보관(localStorage)
                        정책 읽기 ◀────────── requests[requestId] ◀──── 검증자 createRequest
                        로컬 조건 검사(pure circuit)
                        Web Worker: zkir WASM 증명
                        Lace: 수수료(DUST)·서명·제출 ─── tx ───────▶ submitProof 검증
                                                                        results[requestId] = VERIFIED
                                                   영수증(지갑 불필요) ◀── 인덱서 조회
```
- 서명: 해시와 곡선 연산은 컴파일된 pure circuit 을 TS 에서 그대로 실행하고, 스칼라 `s = k + c·sk` 만 Jubjub 부분군 차수로 계산한다. 회로 challenge 는 `degradeToTransient` 로 248비트로 잘라 `ecMul` 스칼라 범위를 지킨다 ([ADR](docs/decisions/2026-09-25-circuit-design.md)).

### 증명 생성과 트랜잭션

| 단계 | 어디서 |
|---|---|
| StateProof 회로 증명 | 브라우저 Web Worker(웹) 또는 Node(CLI) 안에서 `@midnight-ntwrk/zkir-v2` WASM. 회로 키와 공개 파라미터(k=12·13, 2.4MB)는 앱과 같은 출처에서 받는다 |
| 수수료(DUST) 균형·서명·제출 | Lace (`balanceUnsealedTransaction`, `submitTransaction`) |
| Lace 자체 수수료 증명 | Lace 설정의 `localhost:6300` proof server |

Midnight 재단의 공용 proof server 는 요청 본문 8KB 이상을 403 으로 거부해 DApp 회로 증명에는 쓸 수 없다. 그래서 회로 증명을 로컬 WASM 으로 옮겼고, 결과적으로 **홀더의 크리덴셜이 어떤 서버에도 전송되지 않는다** ([ADR](docs/decisions/2026-09-25-proving-strategy.md)).

### Preprod 기록

| 항목 | 값 |
|---|---|
| 데모 | https://stateproof-demo.web.app |
| 화면 녹화 | [docs/demo/2026-09-26-walkthrough.mp4](docs/demo/2026-09-26-walkthrough.mp4) (자막 포함. 지갑 없는 흐름만 담았다: 정책 작성, 경계 화면, 브라우저 증명, Sora 차단, 영수증. Lace 승인 단계는 없다) |
| StateProof 컨트랙트 | [`4ab5b848ababb8471f395bdc00a5a750c9b500833bbb3b983008868ceca47fa3`](https://explorer.preprod.midnight.network/contracts/4ab5b848ababb8471f395bdc00a5a750c9b500833bbb3b983008868ceca47fa3) |
| 배포 tx | [`9b5b3d77…729b60`](https://explorer.preprod.midnight.network/transactions/9b5b3d7728fa7baca2cd4aa9994e126e4e3e42ed09ad6143053a996f58729b60) (2026-09-26 06:22 KST, 컴파일러 0.31.1) |
| 발급자 등록 `issuer:acme-hr` | [`bf69827e…f680549`](https://explorer.preprod.midnight.network/transactions/bf69827ee414acb764df5d86963ff6030a20532d3b9b36de08fb3471ff680549) (CLI, Node WASM 증명) |
| 발급자 등록 `issuer:gov-id-demo` | [`df1eaf69…ddccd70e`](https://explorer.preprod.midnight.network/transactions/df1eaf6978d0b1ea9e1262cb86383fdd07cb02693a7654b4f22b00b9ddccd70e) (웹 Operator tools, 브라우저 증명 + Lace) |
| 검증 요청 생성 | [`d85c2733…8e4d2b61`](https://explorer.preprod.midnight.network/transactions/d85c27339ab97969a2facbdee8b84cc0e4c9ac3cb672acf828f96cd78e4d2b61) (웹 `/verifier`, Lace) |
| 홀더 증명 → VERIFIED | [`a8498d4b…0a92012a`](https://explorer.preprod.midnight.network/transactions/a8498d4bbf12a5839a4d11105de0f1835fc0bbda3ef83bc3ab9a6bfa0a92012a) (웹 `/holder/verify`, 브라우저 증명 약 28초 + Lace) |
| 영수증 | https://stateproof-demo.web.app/request/9361207d82adafcad3064fddf20ec813590f5d94d21df62e42a7ffdbb24f581a |
| 공개 슬롯 요청 생성 (직무 공개) | [`0af1b881…ed23ba74`](https://explorer.preprod.midnight.network/transactions/0af1b8816632de729d712035cbbfa55aa1d28beb1d85573eaee7f27aed23ba74) (CLI) |
| 공개 슬롯 증명 → VERIFIED, 공개 값 Job category = Engineering | [`dcb1464a…d46ad545`](https://explorer.preprod.midnight.network/transactions/dcb1464adbf98f17aaf4981ba28e3340b659a4cd1ac0d15e2927cec5d46ad545) (CLI, Node WASM 증명). 영수증: https://stateproof-demo.web.app/request/04788db0ef6d7653109ea0577ff909ab1f8a8a64150d714c093b5e085c9c972f |

배포 주소는 [config/deployments.json](config/deployments.json), 날짜별 실행 기록은 [docs/demo/2026-09-25-progress.md](docs/demo/2026-09-25-progress.md) 에 있다. 공개 슬롯 증명은 웹 + Lace 에서 먼저 시도했다가 DUST 문제로 실패해 CLI 로 제출했다.

## 실행 방법

### 사전 준비

| 항목 | 필요한 경우 | 버전 |
|---|---|---|
| Node.js | 항상 | 24.11 이상 (`.nvmrc`) |
| git, bash | 항상 (Windows 는 Git Bash) | |
| Compact 컴파일러 | 회로를 다시 컴파일할 때만 | **0.31.1** ([설치](https://docs.midnight.network/getting-started/installation), `compact update 0.31.1`) |
| Chrome + Lace | 웹에서 실제 tx 를 낼 때만 | Lace 2.4.0 에서 확인 |
| Docker | Lace 의 `localhost:6300` proof server 용 (또는 프록시 스크립트) | `midnightntwrk/proof-server:8.1.0` |

### 1. 설치와 테스트 (컴파일러 없이 가능)

```bash
git clone https://github.com/AHTTOH/stateproof.git && cd stateproof
npm ci
npm test          # 컨트랙트 시뮬레이터 33건 + core 15건
npm run typecheck
```

컴파일 산출물(`packages/contract/src/managed`)이 커밋돼 있어 Compact 컴파일러가 없어도 테스트와 웹 빌드가 된다. 다시 컴파일하려면 Compact **0.31.1** 이 필요하다(`compact update 0.31.1`, `npm run compile`). 다른 버전이면 스크립트가 멈춘다.

재현 확인 한 줄: `bash scripts/verify-repro.sh https://github.com/AHTTOH/stateproof.git`

### 2. 웹 앱

```bash
STATEPROOF_NETWORK=preprod npm run dev -w @stateproof/web
```

### 3. Lace 준비 (Chrome)

1. Lace 확장 설치 → 지갑 생성 시 **Midnight** 계정을 켠다.
2. Settings → Network → **Testnet** → Midnight 항목에서 **Preprod** 선택(기본값은 Preview).
3. Midnight Receive → Unshielded 주소로 [Preprod faucet](https://midnight-tmnight-preprod.nethermind.dev/) 에서 tNIGHT 받기.
4. 지갑의 DUST 버튼으로 tDUST 생성 지정.
5. tDUST 는 지정 뒤 시간에 비례해 쌓인다. **데모 전날 미리** 1~4 를 해 두는 것을 권한다. tx 를 연달아 낼 때는 앞 tx 가 확정되고 1~2분 기다린다(Preprod 에서 직전 수수료가 반영되기 전에 다음 tx 를 내면 노드가 수수료 증명을 거부했다).
6. Lace 는 수수료 증명을 `localhost:6300` 에서 만든다. 둘 중 하나를 띄운다.
   - 권장: `docker compose -f infra/proof-server/docker-compose.yml up -d`
   - Docker 가 없을 때: `node scripts/proof-server-proxy.mjs preprod` (6300 요청을 공용 proof server 로 전달. 지갑의 수수료 증명 입력이 공용 서버로 간다)

### 4. 운영자 CLI (자기 인스턴스를 새로 띄울 때만)

> 심사에는 필요 없다. 아래 명령은 **새 발급자 키와 새 컨트랙트를 만들고** `config/issuers.json`, `config/deployments.json`, `packages/web/src/state/demo-personas.json` 을 덮어쓴다. 실행하면 로컬 웹이 공개 데모 컨트랙트가 아니라 새 컨트랙트를 가리킨다.

`.env.example` 을 `.env` 로 복사해 채운 뒤(지갑 시드는 faucet 으로 tNIGHT 를 받은 지갑):

```bash
npm run issue -w @stateproof/issuer -- keygen --issuer issuer:acme-hr
npm run issue -w @stateproof/issuer -- keygen --issuer issuer:gov-id-demo
npm run issue -w @stateproof/issuer -- personas
npm run deploy -w @stateproof/cli
npm run register-issuer -w @stateproof/cli
npm run e2e -w @stateproof/cli
```

새 헤드리스 지갑은 Preprod 첫 동기화에 수 시간이 걸린다(DUST 지갑이 약 150만 이벤트를 재생). CLI 는 동기화 상태를 `WALLET_STATE_FILE` 에 저장하고 다음 실행에서 복원한다(복원 3~7분).

| 명령 | 하는 일 |
|---|---|
| `npm run status -w @stateproof/cli` | NIGHT·DUST 잔액과 DUST 코인 수 |
| `npm run operator -w @stateproof/cli` | 지갑을 한 번 복원해 두고 `curl -X POST 127.0.0.1:$OPERATOR_PORT/status`, `/register-issuer`, `/e2e`, `/exit` 로 작업을 받는다 |
| `npm run prove -w @stateproof/cli -- --request <id> --persona minji --schema employment` | 기존 요청에 데모 인물 증명 1건 제출 |
| `npm run demo-request -w @stateproof/cli -- --policy employment --ttl-days 30` | 심사용 대기 요청 생성 (`employment`, `identity`) |

## 데모 흐름 (Lace 로 실제 tx 까지, 화면 순서)

1. `/verifier`: 기본 정책 "Employment status is Active, Months employed at least 12" 확인 → [Create verification request] → Lace 승인 → 홀더 링크가 나온다.
2. 링크(`/holder/verify/<id>`)를 연다 → "The verifier will learn / They will NOT receive" 경계 확인 → **Use Minji Park (fictional)** 로 데모 크리덴셜을 불러온다.
3. [Verify privately] → 브라우저가 증명을 만들고 Lace 가 수수료를 승인받아 제출한다.
4. `/request/<id>` 영수증에 **Verified** 와 조건, 공개된 값(없으면 None), 공개되지 않은 항목이 나온다.
5. 대조군: 같은 요청을 **Sora Kim (6개월)** 으로 열면 "Not met: Months employed at least 12" 가 표시되고 증명도 트랜잭션도 만들어지지 않는다.

데모 인물과 발급자는 모두 가상이다.

## 구조

```
config/                 네트워크 엔드포인트, 발급자 공개키, 배포 기록
packages/contract       Compact 컨트랙트, 컴파일 산출물, 서명·API·증명 모듈, 시뮬레이터 테스트
packages/core           스키마, 클레임 인코딩, 정책 빌더, 크리덴셜 문서, 영수증
packages/issuer         발급자 키 생성, 데모 인물 발급
packages/cli            운영자 지갑(상태 저장), 배포, 발급자 등록, Preprod E2E
packages/web            Verifier / Holder / Issuer 웹 앱
scripts/                컴파일 버전 가드, 재현 검증, proof server 프록시
docs/                   계획서, 결정 기록(ADR), 데모 기록
```

## 한계 (해커톤 범위)

- 크리덴셜 커밋과 홀더 커밋에 `transientHash` 를 쓴다. 회로 비용을 줄이는 대신 컴파일러 업그레이드 사이에 값이 유지된다는 보장이 없다.
- 크리덴셜 유효기간은 요청의 `referenceTime`(검증자가 넣는 public 값) 기준이다. 크리덴셜 만료일을 체인 시간과 직접 비교하면 그 값이 공개 트랜스크립트에 남기 때문이다. 요청 만료는 체인 시간(`blockTimeLt`)으로 검사한다.
- 조건은 AND 만, 최대 4개. OR, Not In 은 없다.
- 발급자 취소(revocation)는 없다. 관리자가 같은 issuerId 로 키를 다시 등록하면 진행 중인 요청에도 새 키가 적용된다.
- 요청 링크는 bearer 방식이다. 조건을 만족하는 다른 홀더가 먼저 응답할 수 있다. 결과는 요청당 한 번만 기록된다.
- 데모 인물의 홀더 비밀값은 누구나 데모를 재현할 수 있도록 공개돼 있다.
- Preprod 수수료(DUST): 헤드리스 SDK 지갑은 한 세션에서 첫 지출 뒤 거스름 DUST 를 추적하지 못했고, Lace 도 연속 tx 뒤 DUST 표시가 0 이 된 적이 있다. 원인은 지갑 쪽으로 보이며 StateProof 회로와는 무관하다. 자세한 관찰은 [ADR](docs/decisions/2026-09-25-proving-strategy.md) 에 있다.

## 로드맵

[PRD.md](PRD.md) 의 API/SDK, 웹훅, 과금, 팀 관리, OR 조건, 추가 스키마(소득·학력·자격)는 이번 범위에서 뺐다. 계획과 범위 결정은 [docs/plan](docs/plan/2026-09-23-작업계획서.md) 에 있다.

## 라이선스

Apache-2.0. `create-mn-app` bboard 템플릿(Apache-2.0, Midnight Foundation)의 설정과 `in-memory-private-state-provider.ts` 를 가져와 썼다.
