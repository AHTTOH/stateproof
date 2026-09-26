# 제출 폼 문구 (Midnight Korea Hackathon 2026)

> 작성: 2026-09-26 13:30 KST · 제출 마감 2026-09-28 00:00 KST (목표 09-27 21:00)
> 프로젝트명과 한 줄 설명은 README 첫 두 줄과 글자 단위로 같아야 한다(심사 기준 §2.3). README 를 고치면 이 문서도 같이 고친다.

## 프로젝트명

StateProof

## 한 줄 설명

원본 개인정보를 넘기지 않고, 상대가 요구한 조건을 충족한다는 사실만 증명하는 Midnight 기반 ZK 크리덴셜 검증 서비스.

## 공개 GitHub 저장소

https://github.com/AHTTOH/stateproof

## 데모

https://stateproof-demo.web.app (Midnight Preprod)

## 실행 방법 / 데모 흐름

**지갑 없이 확인 (브라우저만):** https://stateproof-demo.web.app/holder/verify/08da5a24a5528086cd5ca5079e641c2dae79238dbb27eb0bbfeaad5a5f40d91e 에서 Use Minji Park, Try the proof without a wallet(브라우저에서 실제 ZK 증명 생성, 제출 안 함), Use a different persona, Use Sora Kim(조건 불충족으로 증명 없이 차단) 순서로 누른다. 신원 조건(19세 이상, 거주지 서울·경기) 요청도 같은 방식으로 확인할 수 있다: https://stateproof-demo.web.app/holder/verify/5d21cc83a45e9552ad1b447cd0c6677654cb9c692d4e33ee381cdb28260c6073 . 자세한 단계는 README 첫 절.

**Lace 로 실제 트랜잭션까지:**

1. 저장소를 받아 `npm ci`, `npm test` (컨트랙트 시뮬레이터 33건 + core 15건, Compact 컴파일러 없이 동작).
2. 데모 사이트 `/verifier` 에서 조건(예: 재직 상태 = Active, 근속 12개월 이상)을 고르고 검증 요청을 만든다. Lace 가 수수료를 내고 요청이 온체인에 기록된다.
3. 홀더 링크 `/holder/verify/<id>` 를 열면 "검증자가 알게 되는 것 / 받지 못하는 것" 이 나뉘어 보인다. 가상 인물 Minji 의 크리덴셜을 불러와 [Verify privately] 를 누르면 브라우저 안에서 ZK 증명이 만들어지고 Lace 가 제출한다.
4. `/request/<id>` 영수증에 VERIFIED 와 증명된 조건, 공개되지 않은 항목이 표시된다.
5. 같은 요청을 조건 미달 인물(Sora, 근속 6개월)로 열면 증명도 트랜잭션도 만들어지지 않고 어떤 조건이 안 맞는지 보여 준다.

실제로 이 흐름을 Preprod 에서 끝까지 실행한 기록(tx 해시)은 README 의 "Preprod 기록" 표에 있다.

## Midnight 사용 방식

- Compact 0.31.1 컨트랙트 하나(`registerIssuer`, `createRequest`, `submitProof`). 정책(조건 최대 4개, 연산자 6종)은 요청 생성 시점의 **public 입력**이고, 크리덴셜·발급자 서명·홀더 비밀값은 **witness** 다.
- `submitProof` 회로 안에서 Jubjub Schnorr 발급자 서명 검증, 크리덴셜 유효기간, 홀더 바인딩, 모든 조건 평가를 수행한다. 요청 만료는 `blockTimeLt` 로 체인 시간 기준으로 검사한다.
- ledger 에는 요청(정책 공개)과 결과(VERIFIED, 검증자가 요청한 경우 공개 값 1개)만 남는다. 생년월일, 근속 개월 수, 주소 같은 원본 값은 어디에도 기록되지 않는다.
- 회로 증명은 `@midnight-ntwrk/zkir-v2` WASM 으로 브라우저(Web Worker)와 Node 에서 직접 만든다. 크리덴셜이 어떤 서버로도 전송되지 않는다. Lace 는 DApp Connector 로 수수료(DUST) 균형과 제출만 맡는다.

## 데모 영상 (선택)

https://github.com/AHTTOH/stateproof/blob/main/docs/demo/2026-09-26-walkthrough.mp4 (약 107초, 자막 포함. 정책 작성, 경계 화면, 브라우저 안 실제 증명 생성, 조건 미달 인물 차단, 온체인 영수증. Lace 승인 단계는 없으며 그 단계를 포함한 실제 온체인 실행 기록은 README 의 Preprod 기록 표에 있다)
