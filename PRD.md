
# StateProof

## 1. 제품 정의

**StateProof는 개인의 원본 개인정보를 상대방에게 전달하지 않고도, 상대방이 요구하는 조건을 충족하는지 증명할 수 있는 프라이버시 검증 플랫폼이다.**

서비스의 핵심 개념은 **Proof of State**다.

기존 서비스가 데이터를 전달한다면,

`내 정보 → 상대방에게 전달 → 상대방이 직접 판정`

StateProof는 판정 결과를 전달한다.

`내 정보 → 비공개 검증 → 조건 충족 여부만 전달`

예를 들어 상대방은 사용자의 정확한 생년월일, 소득, 주소, 재직정보를 보지 않고도 다음과 같은 사실을 검증할 수 있다.

* 특정 연령 조건 충족
* 특정 소득 조건 충족
* 현재 재직 상태
* 특정 지역 거주
* 특정 자격 보유
* 특정 회원 자격 보유
* Credential의 유효기간 충족

조건값은 StateProof에 고정하지 않는다.

**검증자가 필요한 조건을 직접 정의한다.**

---

# 2. 해결하려는 문제

온라인 자격 검증은 대부분 과도한 개인정보 제공을 전제로 한다.

예를 들어 어떤 서비스가 원하는 것이 단순히:

> “이 사용자가 가입 조건을 충족하는가?”

라는 사실 하나뿐이어도 현재는 신분증, 재직증명서, 급여자료, 자격증 등의 원본을 제출해야 하는 경우가 있다.

이 구조에는 세 가지 문제가 있다.

### 과도한 정보 수집

검증 목적에 필요하지 않은 정보까지 전달된다.

### 개인정보 보관 위험

서비스 사업자가 원본 문서를 수집하고 저장하면서 유출 위험과 개인정보 관리 부담을 떠안는다.

### 반복 제출

사용자는 서비스마다 동일한 문서를 반복 제출해야 한다.

StateProof는 **원본 데이터를 교환하는 방식 자체를 바꾼다.**

---

# 3. 제품의 세 주체

StateProof는 세 주체로 구성된다.

## Issuer

정보의 진위를 보증하는 기관.

예:

* 회사
* 학교
* 금융기관
* 정부기관
* 자격증 발급기관
* 인증된 데이터 제공업체

Issuer는 사용자에게 서명된 Credential을 발급한다.

---

## Holder

Credential의 소유자인 사용자.

Credential은 사용자의 private 영역에 보관한다.

사용자는 검증 요청을 받을 때 **원본 정보를 공개할지 선택하는 것이 아니라, 해당 조건을 증명할지 여부만 결정**한다.

---

## Verifier

어떤 조건의 충족 여부를 알고 싶은 조직 또는 서비스.

Verifier가 StateProof에서 검증 조건을 만든다.

Verifier는 사용자의 원본 데이터 대신 **검증 결과와 암호학적 proof**를 받는다.

---

# 4. 핵심 제품 경험

## 4.1 Verifier가 Verification Request 생성

StateProof Dashboard에서 검증할 조건을 만든다.

예:

**Credential**

Employment Credential

**Trusted Issuer**

승인된 기업 또는 데이터 제공업체

**Conditions**

Employment status = Active

Employment duration ≥ [Verifier 입력값]

**Disclosure**

원본 정보 공개 안 함

Verifier는 조건을 저장한 뒤 다음 중 하나로 요청한다.

* Verification Link
* QR Code
* API Request
* SDK

즉 StateProof에는 특정 숫자나 조건이 미리 하드코딩되지 않는다.

---

# 5. Dynamic Policy Builder

StateProof의 핵심 기능이다.

Verifier는 코드를 작성하지 않고 개인정보 검증 규칙을 만든다.

### 지원 연산자

숫자:

`>`
`>=`
`<`
`<=`
`=`
`Between`

문자/범주:

`Equals`
`Not Equals`
`In`
`Not In`

상태:

`Active`
`Valid`
`Expired 여부`

날짜:

`Before`
`After`
`기간 이상/이하`

Boolean:

`True / False`

여러 조건은:

`AND`
`OR`

조합을 지원한다.

예를 들어 Verifier가:

**Age Credential**

`age >= [입력값]`

AND

**Residence Credential**

`region IN [선택 지역]`

이라는 정책을 만들 수 있다.

이 조건은 검증 요청마다 달라질 수 있다.

---

# 6. Holder 경험

사용자가 StateProof Verification Link를 열면 요청 내용을 먼저 확인한다.

예:

## Verification Request

Example Service wants to verify:

✓ You meet the required age condition
✓ You reside in an eligible region

### They will NOT receive

Your date of birth
Your exact address
Your identity document

[Continue]

StateProof는 사용자가 보유한 Credential 중 조건을 증명할 수 있는 Credential을 찾는다.

사용자는:

[Verify privately]

를 누른다.

이후 자신의 private credential을 이용해 proof를 생성한다.

---

# 7. 검증 결과

Verifier에게 반환되는 기본 결과는 단순하다.

## VERIFIED

All requested conditions were satisfied.

Credential issuer
Verified

Credential validity
Valid

Verification time
2026-XX-XX

Underlying personal data
**Not disclosed**

Verifier는 원본 Credential을 받지 않는다.

---

# 8. Selective Disclosure

모든 검증이 완전히 TRUE/FALSE일 필요는 없다.

Verifier가 필요하면 사용자가 동의한 일부 claim만 함께 공개할 수 있다.

예를 들어:

**공개**

직업군: Developer

**비공개**

회사명
연봉
사번
정확한 근속기간

처럼 구성할 수 있다.

따라서 StateProof는 단순한 익명 인증 서비스가 아니라:

**무엇은 증명하고 무엇은 공개할 것인지 통제하는 데이터 최소화 레이어**

로 동작한다.

---

# 9. Credential

StateProof는 사용자가 직접 작성한 값을 신뢰하지 않는다.

예:

사용자가 자신의 소득을 직접 입력하고

> “내 소득은 조건을 충족한다.”

라고 ZK Proof를 만들어도 원본값 자체의 진위를 보장할 수 없다.

따라서 StateProof의 검증 가능한 정보는 **Issuer가 서명한 Credential**을 기반으로 한다.

제품에서는 W3C Verifiable Credentials 형태를 기본 credential 모델로 지원하고, 외부 데이터 제공자가 다른 형식을 사용할 경우 Adapter를 통해 내부 Credential Schema로 정규화한다.

Credential 예시:

EmploymentCredential

* employmentStatus
* jobCategory
* employmentStartDate
* issuer
* expirationDate

IncomeCredential

* income
* currency
* referencePeriod
* issuer
* expirationDate

IdentityCredential

* birthDate
* nationality
* residency
* issuer

Credential의 모든 필드가 공개된다는 뜻은 아니다.

실제 claim은 private state에 존재하며, 필요한 predicate만 증명한다.

---

# 10. Credential Wallet

사용자는 StateProof에서 자신이 보유한 Credential을 관리할 수 있다.

## My Credentials

Employment
Verified

Income
Verified

Identity
Verified

Education
Verified

Professional License
Verified

각 Credential에서:

* Issuer
* 발급일
* 만료일
* 상태

등을 확인할 수 있다.

민감한 raw value는 사용자가 명시적으로 확인할 때만 보여준다.

---

# 11. Verifier Console

기업 고객이 사용하는 핵심 SaaS 화면이다.

### Verification Policies

반복적으로 사용하는 검증조건을 저장한다.

예:

Premium Eligibility
Employee Access
Community Membership
Rental Qualification
Partner Verification

### Verification Requests

발급된 검증 요청과 상태를 확인한다.

Pending
Verified
Rejected
Expired

### Verification Records

어떤 검증 요청이 언제 성공했는지를 확인한다.

단, 정책상 수집하지 않기로 한 원본 개인정보는 StateProof에도 저장하지 않는다.

---

# 12. API / SDK

StateProof는 자체 웹사이트에서만 사용하는 서비스가 아니다.

다른 서비스가 자기 서비스 안에 검증 기능을 삽입할 수 있어야 한다.

예:

```text
POST /verification-requests
```

Verifier가 policy를 지정한다.

StateProof가 Verification Session을 발급한다.

사용자가 proof를 제출하면:

```text
VERIFIED
FAILED
EXPIRED
```

등의 상태를 반환한다.

Webhook으로 기존 서비스에 결과를 전달할 수도 있다.

이를 통해:

* 커뮤니티
* 채용 플랫폼
* 금융 서비스
* 렌탈 서비스
* 이벤트
* 교육 서비스
* 회원제 서비스

등이 StateProof를 인증 인프라처럼 사용할 수 있다.

---

# 13. Midnight의 역할

StateProof는 Midnight를 단순 데이터 저장 블록체인으로 사용하지 않는다.

핵심 기능은 **Programmable Privacy**다.

Verifier가 만든 Policy가 public condition이 되고,

사용자의 credential claim은 private input으로 처리한다.

개념적으로:

```text
Verifier Policy

        +

Private Credential

        ↓

Midnight / Compact

        ↓

Predicate Evaluation

        ↓

Zero-Knowledge Proof

        ↓

Verification Result
```

Verifier는 proof가 올바른 계산 결과임을 검증할 수 있지만 private input은 알 수 없다.

---

# 14. Generic Proof Engine

StateProof가 매 검증 유형마다 별도 서비스를 만드는 구조가 되어서는 안 된다.

공통 Proof Engine을 만든다.

Engine이 처리하는 입력은:

**Credential Schema**

어떤 종류의 데이터인가.

**Issuer**

누가 발급했는가.

**Claim**

어떤 필드를 검증할 것인가.

**Operator**

어떤 조건을 적용할 것인가.

**Value**

Verifier가 설정한 기준값.

예:

```text
Credential: EmploymentCredential

Claim:
employmentDuration

Operator:
GREATER_THAN_OR_EQUAL

Value:
Verifier-defined value
```

`Value`는 contract 코드에 고정하지 않는다.

Verification Request의 public parameter로 전달한다.

따라서 동일한 검증 엔진으로 서로 다른 서비스와 조건을 처리한다.

단, 완전히 임의의 프로그램을 실행시키는 구조는 아니다.

StateProof가 지원하는 **Credential Schema + Predicate Operator** 범위 안에서 자유롭게 정책을 생성한다.

새로운 데이터 유형은 Schema 또는 Adapter를 추가해 확장한다.

---

# 15. 실제 사용 사례

StateProof 자체는 특정 산업에 종속되지 않는다.

## Membership

조건을 만족하는 사용자에게만 멤버십 제공.

## Employment

현재 재직 여부 또는 근속 조건 검증.

## Rental

임대인이 요구하는 경제적 조건만 확인하고 원본 급여자료는 받지 않음.

## Community

특정 학교·회사·지역·자격 보유자만 참여할 수 있는 커뮤니티.

## Events

연령 또는 회원 자격에 따라 입장 허용.

## Professional Services

특정 면허나 자격이 유효한지 확인.

## Financial Pre-qualification

정확한 금융정보를 전달하기 전에 최소 자격조건만 사전 확인.

StateProof는 이 모든 서비스를 직접 운영하는 것이 아니라 **이들이 사용할 검증 레이어를 제공한다.**

---

# 16. 개인정보 설계 원칙

StateProof의 제품 원칙은 다음과 같다.

### Collect Less

필요하지 않은 원본정보를 받지 않는다.

### Prove Instead of Share

데이터 자체보다 데이터에 관한 사실을 증명한다.

### Request-Based Disclosure

Verifier가 무엇을 요구하는지 사용자가 검증 전에 명확히 볼 수 있어야 한다.

### User Consent

사용자가 요청을 승인해야 proof가 생성된다.

### Minimum Disclosure

조건 검증에 필요하지 않은 claim은 공개하지 않는다.

### Expiring Verification

검증 결과에는 유효기간을 둘 수 있다.

과거의 proof가 현재 상태를 영구적으로 보증하지 않게 한다.

---

# 17. Verification Receipt

검증 성공 시 StateProof는 Verification Receipt를 만든다.

Receipt에는:

* Policy ID
* Proof status
* Trusted Issuer
* Verification timestamp
* Expiration
* 선택적으로 공개된 claims

가 포함된다.

포함하지 않는 정보:

* 검증에 사용한 private raw values
* Credential 원문
* 사용자가 공개에 동의하지 않은 개인정보

Receipt는 링크 또는 QR로 공유할 수도 있다.

---

# 18. 제품 포지셔닝

StateProof는 다음 제품이 아니다.

**신분증 보관 앱이 아니다.**

**단순 DID Wallet이 아니다.**

**블록체인 탐색기가 아니다.**

**연봉 인증 서비스가 아니다.**

StateProof는:

> **Verifier가 개인정보를 받지 않고도 사용자의 조건 충족 여부를 확인할 수 있도록 하는 Privacy Verification Infrastructure**

다.

핵심 고객은 자신의 사용자를 검증해야 하는 서비스 사업자다.

---

# 19. 비즈니스 모델

Holder에게 기본 검증 기능은 무료로 제공한다.

Verifier 기업에게 과금한다.

### Starter

소규모 서비스

* 기본 Policy Builder
* Verification Link
* 월간 검증 한도

### Business

* API
* SDK
* Custom Credential Schema
* Webhook
* Team Management
* Verification Analytics

### Enterprise

* 자체 Issuer 연결
* Private deployment
* Custom policy
* Compliance logging
* SLA

기본적인 과금 단위는:

**월 구독료 + Verification 사용량**

형태로 설계한다.

---

# 20. 초기 제품 범위

제품의 첫 버전에서는 모든 세상의 개인정보를 지원하려 하지 않는다.

먼저 다음 구조를 완성한다.

### Verifier

Policy Builder
Verification Request
Verification Result
Verification History

### Holder

Credential Wallet
Verification Request 확인
Proof 생성
Verification History

### Issuer

Credential 발급
Credential 서명
Credential 만료/취소

### Infrastructure

Credential Schema
Generic Predicate Engine
Midnight ZK Proof
Issuer verification
Verification Receipt
API

이 구조가 완성되면 새로운 산업별 서비스는 **새 제품을 만드는 것이 아니라 Credential Schema와 Policy를 추가하는 방식**으로 확장한다.

---

# 21. 제품의 핵심 화면

StateProof의 메인 화면은 ZK 기술 설명 화면이 아니다.

Verifier에게는:

## What do you need to verify?

[ Select Credential ]

[ Select Claim ]

[ Select Condition ]

[ Set Requirement ]

[ Create Verification ]

이 화면이 핵심이다.

Holder에게는:

## Someone wants to verify something about you.

They want to know:

✓ Whether you satisfy this condition

They will not receive:

× Your underlying personal data

[Verify privately]

가 핵심이다.

기술은 사용자 경험 뒤에 숨긴다.

---

# 22. 핵심 가치 제안

기업 입장:

> **Verify users without collecting the data you don't need.**

사용자 입장:

> **Prove what is true without revealing everything behind it.**

StateProof의 대표 문구:

# Prove your state.

# Not your data.

---

# 23. 장기 제품 방향

StateProof의 최종 목표는 웹사이트 하나가 아니다.

다른 서비스에서:

**“Sign in with Google”**

을 붙이듯,

향후:

**“Verify with StateProof”**

를 붙이는 형태가 목표다.

사용자는 원본 개인정보를 반복적으로 업로드하는 대신 자신의 Credential을 가지고 다니고,

서비스 사업자는 필요한 조건만 요청한다.

StateProof는 그 사이에서:

**Credential → Policy → Private Computation → Proof → Verification**

전체 과정을 제공한다.
