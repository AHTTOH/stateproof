# Runbook: deploying StateProof v2 (JobProof) to Preprod

Status when this was written (2026-09-30): **v2 is not deployed on Preprod.** The `preprod`
entry in `config/deployments.json` is still the v1 contract (it has no `contractVersion`), and the
CLI refuses to use it for v2 commands. v2 has only run on the local devnet in CI
(`.github/workflows/devnet.yml`, record in `docs/devnet-run.json`).

These steps are for the owner, on a machine with a funded Preprod wallet. Run them in order.
Every command prints the transaction id and block height; nothing below is automatic.

## 0. Machine

- Node.js 24.11.1 or newer (`.nvmrc`), git. `gh` is only needed for step 4b.
- Network access to the Preprod endpoints in `config/networks.json` (`preprod`).
- StateProof circuits are proved locally with the zkir-v2 WASM prover, which downloads Midnight's
  public parameters from the S3 bucket in `config/networks.json` (`zkArtifacts`). Some corporate
  networks block that bucket (HTTP 403); step 4b works around it.
- No Docker and no Compact compiler are needed: the compiled contract is committed in
  `packages/contract/src/managed/stateproof` (compactc 0.31.1).

## 1. Code

```bash
git clone https://github.com/AHTTOH/stateproof.git
cd stateproof
git checkout v2-ops        # or v2 once v2-ops is merged
npm ci
npm test -w @stateproof/contract -w @stateproof/core -w @stateproof/issuer -w @stateproof/cli
```

## 2. `.env`

Copy `.env.example` to `.env` (git-ignored) and fill in every value:

| Variable | Value |
| --- | --- |
| `STATEPROOF_NETWORK` | `preprod` |
| `LOG_LEVEL` | `info` |
| `OPERATOR_WALLET_SEED` | 32-byte hex. Reuse the funded v1 operator seed if you still have it; otherwise generate one (below). |
| `STATEPROOF_ADMIN_SECRET` | New 32-byte hex. Its hash becomes the v2 contract admin. Keep it: only it can register schemas and issuers. |
| `WALLET_STATE_FILE` | A path **outside the repo**, e.g. `C:/stateproof-local/preprod-wallet.json`. Reuse the v1 file with the v1 seed: a restored wallet syncs in minutes instead of hours. |
| `ZK_PARAMS_CACHE_DIR` | `.zk-params` (git-ignored; step 4b can fill it) |
| `PRIVATE_STATE_DIR` | A path outside the repo, e.g. `C:/stateproof-local/private-state` |
| `PRIVATE_STATE_PASSWORD` | A long random password for the local private-state store |
| `ISSUER_V2_SECRET_ACME_HR`, `ISSUER_V2_SECRET_NOVA_HR`, `ISSUER_V2_SECRET_YOUTH_WORK_CENTER` | See step 3 |
| `STATEPROOF_PROOF_SERVER` | Leave empty unless you use step 4b option B |

Generate a 32-byte hex value:

```bash
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

## 3. Issuer keys

`config/issuers.json` (v2) holds three fictional demo issuers, one entry per on-chain
registration: `issuer:acme-hr` (career, slot 0), `issuer:nova-hr` (career, slot 1) and
`issuer:youth-work-center` (youth-work, slot 2). Their public keys were generated on 2026-09-30;
the matching secrets are in the git-ignored `.env` of the worktree they were generated in
(`C:\Users\OK\stateproof-ops\.env`). Choose one:

- **Keep the committed keys**: copy the three `ISSUER_V2_SECRET_*` lines from that `.env` into yours.
  `config/demo-personas.v2.json` already matches these keys.
- **New keys**: make sure your `.env` has none of the three `ISSUER_V2_SECRET_*` lines, then
  ```bash
  npm run issue -- keygen --issuer issuer:acme-hr
  npm run issue -- keygen --issuer issuer:nova-hr
  npm run issue -- keygen --issuer issuer:youth-work-center
  npm run issue -- personas        # re-signs config/demo-personas.v2.json with the new keys
  ```
  `keygen` writes the new public key to `config/issuers.json` and refuses to run while the issuer's
  secret is already in `.env`; remove that line first to replace a key.

Issuer secrets are never printed and never committed. A key cannot be changed after
`register-issuers` (the contract refuses a second registration of the same id).

## 4. Wallet, faucet and DUST

a) Print the operator wallet's unshielded address (derived from the seed, no sync):

```bash
npm run cli -- address --network preprod
```

Open the faucet URL in `config/networks.json` (`preprod.faucet`), paste the address and request
tNIGHT.

Then sync and check balances:

```bash
npm run cli -- status --network preprod
```

- The first sync of a new wallet replays the whole chain and takes **hours**; progress is logged
  every 30 s and the state is saved to `WALLET_STATE_FILE`, so later runs resume quickly.
- Fees are paid in DUST, which NIGHT generates only after the NIGHT UTXOs are registered for DUST
  generation. When the wallet has NIGHT but no DUST, the CLI submits that registration itself
  (testkit `waitForFunds`) and then waits up to 10 minutes for a spendable DUST coin. If it stops
  with "No spendable DUST", wait a few minutes and run `status` again until `dustBalance` is above 0.

b) Proving parameters, only if the S3 bucket is blocked on your network:

- Option A (preferred): `bash scripts/fetch-zk-params.sh` downloads the parameters mirrored by the
  `zk-params` workflow into `.zk-params/`; keep `ZK_PARAMS_CACHE_DIR=.zk-params`. If the prover then
  asks for a `midnight/...` key (also served from S3), run the remaining steps on an unrestricted
  network.
- Option B: run a local proof server (`docker compose -f infra/proof-server/docker-compose.yml up -d`),
  set `STATEPROOF_PROOF_SERVER=http://127.0.0.1:6300` and add `--prover proof-server` to every
  command below.

## 5. Deploy and register

```bash
npm run cli -- deploy --network preprod
npm run cli -- register-schemas --network preprod
npm run cli -- register-issuers --network preprod
```

- `deploy` writes the v2 record to `config/deployments.json` under `preprod`
  (`contractVersion: "v2"`, `contractAddress`, `deployTxId`, `deployTxHash`, `blockHeight`,
  `compiler`, `deployedAt`). This **replaces the v1 entry**; the v1 address stays in git history
  (commit 14c8827).
- `register-schemas` registers `career` and `youth-work` with the rules from
  `packages/core/src/schemas` (`schemaRule`: salary is protected with a 500만원 minimum width and grid,
  birth date with a 365-day minimum width).
- `register-issuers` registers every entry of `config/issuers.json` (id, schema, public key, slot).
  Both commands skip what is already on chain, so they can be re-run after an interruption.
- Look the contract up in the explorer (`preprod.explorer` in `config/networks.json`) with the address.

## 6. Demo postings and a first proof

```bash
npm run cli -- demo-requests --network preprod --ttl-days 30
npm run cli -- prove --network preprod --persona minji --schema career --request <career-open requestId>
```

- `demo-requests` opens a career posting (재직 중, 개발, 36개월 이상, 연봉 5,000만원 이상), a youth-work
  posting (만 19~24세, 서울·경기, 알바 6개월 이상) and a career request sealed to the persona `minji`, and
  records them in `config/demo-requests.v2.json` under `preprod` (request ids, tx ids, expiry, and for
  the sealed request the demo-only link nonce).
- `prove` submits one real proof with a demo persona from `config/demo-personas.v2.json` and prints
  the pseudonym and proving time. For the sealed request add `--nonce <sealNonce>`.

## 7. Optional: the full story on Preprod

```bash
npm run cli -- e2e --network preprod
```

This deploys a **separate throw-away contract** with fresh admin and issuer keys and runs the same
story as the devnet workflow (about 14 transactions, all paid in DUST), then writes
`docs/preprod-run.json`. It does not touch the deployment from step 5. It exits non-zero if any
expectation fails.

## 8. Commit the public records

Commit only public files:

- `config/deployments.json` (the v2 address)
- `config/demo-requests.v2.json`
- `config/issuers.json` and `config/demo-personas.v2.json` if step 3 created new keys, or after an
  epoch rotation
- `docs/preprod-run.json` if step 7 ran

Never commit `.env`, the wallet state file or the private-state directory.

## Later operations

- Revoke everything an issuer signed: `npm run cli -- rotate-epoch --network preprod --issuer issuer:acme-hr`.
  The issuer signs the rotation with its own key; `config/issuers.json` gets the new epoch. Re-issue
  what is still true (`npm run issue -- personas` for the demo people) and commit both files.
- Issue for a real holder: the holder sends an IssuanceRequest (`{ "schema", "holderCommit" }`, never
  the secret):
  `npm run issue -- issue --issuer issuer:acme-hr --request req.json --subject subject.json --out cred.json`
  with `subject.json` = `{ "name", "birthDate": "YYYY-MM-DD", "claims": { ... } }`.

## Troubleshooting

| Message | Meaning |
| --- | --- |
| `config/deployments.json preprod is a v1 deployment` | Run step 5 `deploy` first. |
| `Custom error: 170` | The node rejected a DUST fee proof built on a stale DUST tree; the CLI retries twice after 30 s. |
| `No spendable DUST after 600s` | Step 4a: NIGHT not yet funded or DUST not generated yet. |
| `GET https://midnight-s3-... -> 403` | S3 blocked: step 4b. |
| `... is registered with a different key` | That issuer id is taken on this contract; use a new id and slot in `config/issuers.json`. |
