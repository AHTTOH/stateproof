# StateProof

**Prove you meet a verifier's conditions without revealing the underlying personal data.**
원본 개인정보를 넘기지 않고, 상대가 요구한 조건을 충족한다는 사실만 증명한다. Midnight 위의 ZK 크리덴셜 검증.

> 작업 중(2026-09-25). 심사용 README 는 2026-09-27 에 최종화한다. 제품 정의는 [PRD.md](PRD.md), 계획은 [docs/plan](docs/plan/2026-09-23-작업계획서.md), 결정 기록은 [docs/decisions](docs/decisions/).

## 구조

```
config/networks.json        네트워크 엔드포인트 단일 출처
packages/contract           Compact 컨트랙트, 컴파일 산출물(managed/), 시뮬레이터 테스트
packages/core               스키마·정책·인코딩·서명 래퍼 (브라우저·Node 공용)
packages/issuer             발급자 키·크리덴셜 발급
packages/cli                배포·발급자 등록·Preprod E2E
packages/web                Verifier / Holder / Issuer 웹 앱
scripts/compile.sh          Compact 0.31.1 버전 가드 + 컴파일
infra/proof-server          (선택) 로컬 proof server
```

## 빠른 확인

```bash
npm install
npm test -w @stateproof/contract     # 컴파일러 없이 동작 (managed/ 커밋됨)
npm run compile                      # 선택: Compact 0.31.1 필요
```

License: Apache-2.0
