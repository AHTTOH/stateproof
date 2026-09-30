# 수용 기준 (Acceptance Criteria)

> 각 기준은 테스트 이름에 같은 번호로 붙어 있다. 번호로 검색하면 증거가 나온다.
> 테스트 위치: `packages/contract/test/stateproof.test.ts`, `packages/contract/test/leak.test.ts`, `packages/core/test/*.test.ts`

| AC | 약속 | 막는 공격 | 증거 (테스트) |
|---|---|---|---|
| AC-1 | 같은 사람은 같은 요청에 한 번만 답한다. 한 공고에 여러 사람이 답할 수 있다 | 중복 응답, 제3자의 요청 소진 | `AC-1 refuses a second answer...`, `AC-1 lets many different holders...` |
| AC-2 | 같은 사람의 가명은 요청마다 다르다 | 공고 간 지원 이력 추적 | `AC-2 gives the same holder a different pseudonym...` |
| AC-3 | 한 명을 위한 봉인 요청에는 그 사람만 답할 수 있다. 링크를 받은 지인이나 짜고 대신 답하는 사람은 거절된다. nonce 없이는 봉인값을 이름 추측으로 시험할 수 없다 | 대리 응답 | `AC-3 subject seal` 블록 4건 |
| AC-4 | 발급자는 홀더 비밀값을 받지도 만들지도 않는다. 발급 요청과 발급 문서에 비밀값이 없다 | 발급기관의 영수증-신원 연결 | core `issuance (AC-4...)` 블록 |
| AC-5 | 등록된 발급자 중 누가 서명했는지 공개 데이터에 남지 않는다. 집합 밖의 키, 다른 스키마 발급자, 비활성 발급자는 거절된다 | 발급자로 신원 추정, 가짜 발급자 | `AC-5 anonymous issuer set` 블록, leak `does not reveal which issuer signed` |
| AC-6 | 발급자가 epoch를 올리면 이전 epoch 크리덴셜은 즉시 거절되고, 재발급본은 통과한다 | 퇴사 후 재사용, 정정 전 값 사용 | `AC-6` 2건 |
| AC-7 | epoch 회전은 그 발급자의 서명키를 가진 사람만 할 수 있다 | 제3자의 대량 취소 | `AC-7` 2건 |
| AC-8 | 민감 항목(연봉, 생년월일)에 정확값·제외·집합 조건, 공개, 최소 폭 미만의 구간을 묻는 요청은 체인에 올라가지 않는다 | 회사의 과잉 질문 | `AC-8 refuses ...` 8건, core `refuses what the chain would refuse` |
| AC-9 | 허용되는 질문(연봉 ≥ X, 500만원 이상 폭의 구간, 민감하지 않은 항목의 정확값)은 통과한다. 규칙은 전수 정의와 일치한다 | 과잉 차단(쓸 수 없는 제품) | `AC-9 accepts ...` 4건, `AC-9 minimal-disclosure rule matches a brute-force definition` (784조합) |
| AC-10 | 요청의 기준 시각은 체인 시계 기준 과거 1시간 이내여야 한다 | 기준 시각 조작으로 만료 크리덴셜 통과 | `AC-10` 3건 |
| AC-11 | 민감 항목 경계값은 격자(연봉 500만원)의 배수여야 한다. 격자 위치를 속여도 거절된다. 몇 번을 물어도 한 칸 이상이 남는다 | 반복 질문(이분 탐색) | `AC-11` 5건, core `protectedOffGrid`, 격자 차등 테스트 |
| AC-12 | 체인이 보는 데이터(원장, 모든 호출의 공개 부분)에 크리덴셜 값, 홀더 비밀값, 주체 id, 서명, nonce가 없다. 스캐너는 비공개 부분에서 같은 값을 모두 찾아낸다(대조군) | 구현 실수로 인한 누출 | `leak.test.ts` 4건 |
| AC-13 | TS 판정기(지원자·회사 화면의 즉시 판정)와 컴파일된 회로가 무작위·경계값 입력에서 일치한다 | 화면과 증명의 불일치 | `differential.test.ts` 4종, 48,000건 |
| AC-14 | 만 나이 조건은 2027~2028년 모든 날짜에서 정의와 일치한다(2월 29일 포함) | 나이 경계 오판 | core `matches the definition for every reference date` (731일) |

## 여기서 다루지 않는 것 (위협 모델의 남은 위험)

- 생년월일은 날짜 단위 격자(step=1)라서 반복 질문 방어가 약하다.
- 발급자가 사실과 다른 값을 서명하는 경우. 발급자 신뢰는 전제다.
- 수수료 트랜잭션과 지갑 사이의 연결성. relayer는 로드맵이다.

자세한 내용은 [THREAT-MODEL.md](THREAT-MODEL.md)에 있다.
