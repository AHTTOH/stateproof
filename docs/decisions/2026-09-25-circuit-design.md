# ADR: 회로 설계 확정 사항 (계획서 §5 대비 변경점)

> 작성: 2026-09-25 22:00 KST · 상태: 확정
> 소스: `packages/contract/src/stateproof.compact`, `src/modules/{constants,credential,policy}.compact`

## 계획서와 달라진 점

| 항목 | 계획서 §5 | 확정 | 이유 |
|---|---|---|---|
| 요청 만료 | 블록 시간을 못 읽는다고 보고 `referenceTime` 만 사용 | **`blockTimeLt(expiresAt)` 로 체인 시간 검증** | Compact 0.31.1 표준 라이브러리에 `blockTimeLt/Gte/Gt/Lte` 가 있다(컴파일로 확인). 크리덴셜 만료는 여전히 `referenceTime`(public) 기준. 크리덴셜 만료일을 체인 시간과 비교하면 그 값이 공개 트랜스크립트에 남기 때문 |
| 서명 스칼라 연산 | `sign` 을 Compact pure circuit 으로 두고 runtime 실행 (Brick Towers 방식) | **해시·곡선 연산만 pure circuit, `s = k + c·sk` 는 TS 에서 mod r_J** | 회로의 `Field` 는 BLS12-381 스칼라체(mod q)라 그 안에서 더하면 Jubjub 부분군 차수 r_J 와 법이 달라 검증식이 깨진다. 공식 `midnight-verifiable-credentials` 테스트도 같은 방식 |
| challenge | `transientHash(bodyRoot ‖ pk ‖ R)` | **`degradeToTransient(upgradeFromTransient(transientHash(...)))`** | `ecMul` 의 스칼라는 r_J 미만이어야 한다. 원시 해시값은 약 87.5% 확률로 r_J 를 넘어 런타임이 `failed to decode for built-in type EmbeddedFr` 로 거부했다(테스트로 발견). degradeToTransient 는 하위 248비트만 남겨 항상 r_J 미만 |
| holderCommit | `persistentHash(holderSecret)` (SHA-256) | **`transientHash` (Poseidon), 타입 `Field`** | 회로 비용. 도메인 태그 포함 |
| 관리자 | `ownPublicKey()` 해시 | **관리자 비밀값 witness 의 해시** | `ownPublicKey()` 는 지갑이 주는 값이라 호출자 인증에 쓸 수 없다. bboard 템플릿과 같은 방식 |
| 결과 레코드 | status·verifiedAt·disclosedValue·receipt | **`results[requestId] = { revealed: Maybe<Uint<64>> }`**, 존재 = VERIFIED | 실패한 증명은 체인에 오지 않으므로 status 가 한 값뿐이다. 영수증은 requestId + tx 해시로 오프체인에서 구성 |
| 공개 슬롯 | `discloseIndex: Uint<8>` | **`revealSlot: Maybe<Uint<8>>`** | "공개 안 함" 을 특수값(0·255)으로 표현하지 않는다 |
| 연산자 `none` | `Op.none` | **`Op.ignore`** | 표준 라이브러리 `none<T>()` 과 이름 충돌 회피 |
| 상수 파일 | `constants.compact` 에 CLAIM_SLOTS·MAX_CONDITIONS | **`constants.compact` 는 enum·도메인 태그만** | Compact 는 최상위 상수 선언이 없고 Vector 길이는 리터럴이어야 한다. 크기(8·4·4)는 구조체 정의에 있고 `packages/core/src/constants.ts` 와 테스트로 묶는다 |

## 크기 (전체 컴파일, 2026-09-25)

| 회로 | prover 키 | zkir |
|---|---|---|
| registerIssuer | 3.09MB | 3.9KB |
| createRequest | 1.08MB | 12.6KB |
| submitProof | 2.67MB | 29.7KB |

## 테스트

`packages/contract/test/stateproof.test.ts` 33건 (시뮬레이터, 증명 없이 회로 실행). 5회 반복 통과.
정상 1 · 공개 슬롯 1 · 서명 위조 1 · 클레임 변조 1 · 만료 1 · 발급 전 1 · 홀더 불일치 1 · 조건 불충족 1 · 중복 응답 1 · 요청 만료(블록 시간) 1 · 없는 요청 1 · 관리자 권한 1 · 미등록 발급자 1 · 과거 만료 요청 1 · 슬롯 범위 1 · between 역전 1 · 연산자 13 · ignore 1 · AND 1 · TS 서명 검증 2.
