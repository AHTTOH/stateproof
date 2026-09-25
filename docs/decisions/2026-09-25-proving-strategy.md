# ADR: 증명 생성 경로 (공용 Proof Server 는 DApp 회로에 쓸 수 없다)

> 작성: 2026-09-25 22:00 KST · 상태: 확정(CLI 경로 검증 진행 중, 아래 "남은 확인")
> 계획서 §4.2 D안("전부 외부, 증명은 공용 Proof Server")을 **수정**한다.

## 발견

2026-09-25 bboard 템플릿을 Preprod 에 올려 파이프라인을 검증했다.

| 단계 | 결과 |
|---|---|
| 노드·인덱서·공용 Proof Server·faucet 헬스체크 | 전부 정상 |
| faucet (Turnstile 캡차) | Playwright + 실제 Chrome 헤드풀로 자동 통과. 5000 tNIGHT ×2 수령 (tx `0031471759f7d857e7e2659fb12245c9171f13f2d4e0d6b9eff7227c707504ec31`) |
| DUST 생성 등록 tx | 성공 `002f94baaaed4ce4a46ba0e3239c2ab2bdd90721e38e49084d27cb13d3a84723d3` |
| bboard 컨트랙트 배포 | 성공, 주소 `84b2915ce5b6bc18865dd5c3a3213f902cc1a96971ecf0d086fda0cc12853153` (34초) |
| 회로 호출 `post` (ZK 증명 필요) | **실패**: `https://proof-server.preprod.midnight.network/prove` → **403 Forbidden** |

원인 실측: 공용 서버 `/prove` 는 요청 본문이 1KB 이면 처리(400, 형식 오류)하고 **8KB 이상이면 403** 을 돌려준다. IP 와 User-Agent 는 무관하다(로컬 PC·Hermes 동일). Midnight.js 의 `httpClientProofProvider` 는 증명 요청에 회로의 prover 키를 함께 싣는데, 우리 `submitProof.prover` 는 2.6MB 다. 공용 서버는 지갑 내장 키로 끝나는 작은 요청(DUST 등)만 받는 것으로 보인다. 배포 tx 가 성공한 이유도 회로 증명이 없어서다.

## 결정

1. **CLI(Node) 는 `@midnight-ntwrk/zkir-v2` WASM 증명기로 로컬에서 증명한다.** Docker·proof server 불필요.
   - `provingProvider({ lookupKey, getParams })` 를 만들고 `createProofProvider()`(midnight-js-types)로 감싼다.
   - `lookupKey(회로명)` → `packages/contract/src/managed/stateproof/{keys,zkir}` 의 prover·verifier·bzkir.
   - `lookupKey('midnight/...')` 와 `getParams(k)` → Midnight 공개 S3 (`bls_midnight_2p{k}`, wallet-sdk-prover-client 의 기본값과 동일 출처). 로컬 캐시.
2. **웹(브라우저)은 DApp Connector 4.0.1 의 `getProvingProvider(keyMaterialProvider)` 로 증명을 Lace 지갑에 위임한다.** `proverServerUri` 는 connector 에서 deprecated 다. Lace 가 위임을 지원하지 않는 경우의 대안은 같은 zkir-v2 WASM 증명기를 브라우저에서 돌리는 것이다(D1' 에 확인).
3. 지갑 자체 증명(DUST 수수료 등)은 지갑 설정의 공용 서버를 그대로 쓴다. 배포 tx 로 동작을 확인했다.
4. 이 결정으로 "홀더의 witness 가 공용 서버로 전송된다" 는 계획서의 개인정보 주의 사항은 사라진다. 증명은 홀더의 브라우저 또는 지갑 안에서 만들어진다.

## 지갑 동기화 비용

- 새 헤드리스 지갑(testkit `FluentWalletBuilder`)이 Preprod 를 처음부터 동기화하는 데 약 3시간 걸렸다(09:01 → 11:57 UTC). 두 번째 측정(12:53 UTC 시작): unshielded 1초, shielded 411초, DUST 는 인덱스 약 156만 개를 초당 약 100개로 처리해 약 4시간 예상. 병목은 DUST 지갑이다(수수료 지불용 DUST 머클 경로 때문에 전체 트리를 따라가야 한다).
- 대응: shielded·unshielded·dust 세 지갑 모두 `serializeState()` / `restore()` 를 지원한다. CLI 는 동기화가 끝난 상태를 로컬 파일로 저장하고 다음 실행에서 복원한다. 저장 파일은 커밋하지 않는다.

## faucet 리스크

- 두 번째 요청 직후 faucet 헬스가 `NOT_SERVING / WALLET_BALANCE_LOW` 로 바뀌었다. 심사자가 faucet 을 못 쓰는 상황에 대비해, README 에 "Lace 에 tNIGHT 가 없으면 데모 영상과 온체인 기록으로 확인" 경로를 둔다.

## Lace 실측 (2026-09-25 22:30~22:45 KST, Lace 2.4.0 Chrome 확장을 Playwright Chromium 에 올려 자동 조작)

| 항목 | 결과 |
|---|---|
| 새 지갑 생성 | 비밀번호 → 계정 선택(Cardano·Bitcoin·Midnight 토글) → 완료. 복구 문구 확인 단계 없음 |
| 네트워크 | Settings → Network → **Testnet** 을 고르면 체인별 선택지가 나온다. Midnight 기본값은 **Preview**(`DEFAULT_MIDNIGHT_TESTNET_NETWORK_ID`). 같은 화면에서 Midnight **Preprod** 를 따로 골라야 한다 |
| 동기화 | faucet 5000 tNIGHT 수령 후 1~2분 안에 잔액 표시. 헤드리스 SDK 지갑(수 시간)과 달리 새 Lace 지갑은 빠르다 |
| tDUST | 지갑 화면의 DUST 버튼 → 자기 DUST 주소로 지정(designation) → 비밀번호. 증명 서버 호출 없이 완료 |
| proof server | Settings → Midnight 의 선택지는 **Local `http://localhost:6300` 하나뿐**. 화면에도 "Midnight 에서 자산을 보내려면 Docker 로컬 proof server 가 필수" 라고 표시된다 |
| DApp `getProvingProvider` | 코드상 지갑의 proof server 주소로 `httpClientProvingProvider` 를 만든다. 즉 로컬 6300 필수 |

결정 보강:

5. **웹 앱은 Lace 의 `getProvingProvider` 를 쓰지 않는다.** StateProof 회로 증명은 브라우저 WASM 으로 만들고, Lace 에는 `balanceUnsealedTransaction`(DUST 수수료)과 `submitTransaction` 만 맡긴다. 회로 파라미터(k=12·13, 합계 2.4MB)는 S3 에 CORS 헤더가 없어 브라우저가 직접 받을 수 없으므로 앱과 같은 출처(`/zk/params`)로 함께 배포한다.
6. **Lace 사용자는 여전히 `localhost:6300` 이 필요하다**(Lace 자체의 수수료 증명용). 두 가지를 안내한다.
   - 권장: `docker compose -f infra/proof-server/docker-compose.yml up -d` (proof-server 8.1.0, 모든 입력이 내 PC 에 남음)
   - Docker 가 없을 때: `node scripts/proof-server-proxy.mjs preprod` 가 6300 요청을 공용 서버로 넘긴다. 수수료 증명 요청은 작아서 공용 서버가 받는다(배포 tx 로 확인). 대신 지갑의 수수료 증명 입력이 공용 서버로 간다는 점을 README 에 적는다.

## 남은 확인

- [ ] WASM 증명기로 Preprod 회로 호출 tx 1건 성공 (spike 실행 중, 지갑 동기화 대기)
- [ ] Lace + 웹 앱으로 createRequest·submitProof 성공 (컨트랙트 배포 후)
