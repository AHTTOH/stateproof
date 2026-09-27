# 제출 폼 문구 (Midnight Korea Hackathon 2026)

> 작성: 2026-09-26 13:30 KST, 갱신: 2026-09-27 14:00 KST. 제출 마감 2026-09-28 00:00 KST.
> 실제 제출 폼은 Tally https://tally.so/r/Np20VW (허브의 Submit 버튼). 아래 순서가 폼 항목 순서다.
> 프로젝트명과 한 줄 설명은 README 와 글자 단위로 같아야 한다.

## 팀/프로젝트명 (필수)

StateProof

## 참가 형태 (필수)

개인

## 소속/이름 (필수, Luma 신청 정보와 같게)

(Luma 등록 후 그 정보 그대로 기입. 신영환 확인 필요)

## 대표자 연락처 (필수)

ai.antton.ai@gmail.com (Discord: antton7282)

## GitHub Repository 링크 (필수)

https://github.com/AHTTOH/stateproof

## 'midnightntwrk' 토픽 추가 여부 (필수)

확인했습니다. (2026-09-27 저장소 About Topics 에 midnightntwrk 추가 완료)

## 프로젝트 소개 (필수)

원본 개인정보를 넘기지 않고, 상대가 요구한 조건을 충족한다는 사실만 증명하는 Midnight 기반 ZK 크리덴셜 검증 서비스.

채용 담당자는 "재직 중이고 근속 12개월 이상인가"만 알면 되는데 지금은 재직증명서 원본을 통째로 받습니다. 생년월일, 입사일, 주소처럼 필요 없는 정보까지 넘어갑니다. StateProof 는 검증자가 조건을 골라 요청을 체인에 올리면 홀더가 자기 브라우저 안에서 발급자 서명 크리덴셜로 영지식 증명을 만들어 조건 충족 여부만 넘기는 흐름입니다.

- 검증자: 항목과 연산자(이상, 이하, 같음, 제외, 범위, 다음 중 하나)로 조건을 조합하고 요청을 올립니다. 값 하나를 공개해 달라고 선택적으로 요청할 수 있습니다.
- 홀더: 크리덴셜은 브라우저에만 있습니다. 요청을 열면 항목마다 "이 브라우저 값, 봉인선, 검증자가 아는 것"이 한 줄로 보이고 증명은 브라우저 Web Worker 에서 만들어집니다. 조건을 못 채우면 같은 회로가 먼저 로컬에서 돌아 증명도 트랜잭션도 만들지 않습니다.
- 누구나: 영수증 페이지에서 체인에 기록된 결과를 지갑 없이 확인합니다.
- 지갑 없이 체험: https://stateproof-demo.web.app/demo 에서 홀더 박민지를 고르고 "지갑 없이 증명해 보기"를 누르면 실제 submitProof 트랜잭션의 영지식 증명이 브라우저에서 만들어집니다(제출하지 않음).

## Midnight 구현 포인트 (필수)

- Compact 0.31.1 컨트랙트 하나(registerIssuer, createRequest, submitProof).
- 증명하는 것: submitProof 회로 안에서 발급자 Jubjub Schnorr 서명 검증, 크리덴셜 유효기간, 홀더 바인딩(비밀값 커밋), 정책의 모든 조건. 정책은 요청 생성 시점의 public 입력이고 회로 하나가 임의의 정책을 평가합니다(8개 슬롯과 6개 연산자를 모두 계산한 뒤 선택).
- 공개하는 것: ledger 에는 요청(정책)과 결과(VERIFIED, 검증자가 요청한 값 하나)만 남습니다. 크리덴셜 8개 슬롯, 서명, 홀더 비밀값은 witness 로만 쓰이고 disclose() 는 9곳이 전부입니다.
- 왜 프라이버시가 필요한가: 재직, 나이, 거주지 같은 조건 확인에 원본 문서를 넘기는 관행이 과잉 수집과 유출을 만듭니다. 결과는 누구나 확인할 수 있게 체인에 남기면서 원본 값은 어디에도 남기지 않는 구조는 Midnight 의 선택적 공개로 가능합니다.
- 회로 증명은 @midnight-ntwrk/zkir-v2 WASM 으로 브라우저(Web Worker)와 Node 에서 직접 만들어 크리덴셜이 어떤 서버로도 가지 않습니다. Lace 는 DApp Connector 로 수수료(DUST)와 제출만 맡습니다.
- Preprod 컨트랙트 4ab5b848ababb8471f395bdc00a5a750c9b500833bbb3b983008868ceca47fa3. 실제 tx 기록은 README 의 Preprod 기록 표.

## 프로젝트 참고자료 (선택, Google Slides)

(작성 예정)

## 데모 영상 링크 (선택, 3분 이내)

https://stateproof-demo.web.app/media/walkthrough.mp4

## 데모 URL (선택)

https://stateproof-demo.web.app

## Midnight Academy 수료증 (선택, 1단계와 2단계 각 +1점)

(신영환이 이수하면 파일 첨부)
