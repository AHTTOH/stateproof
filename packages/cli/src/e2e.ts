// JobProof v2 end-to-end on a real network (local devnet or Preprod): real transactions, real
// proofs, the attacks refused by the circuit, and a leak scan of what the chain stores.
//
//   npm run devnet:e2e                                   (local devnet, writes docs/devnet-run.json)
//   npm run cli -- e2e --network preprod                 (writes docs/preprod-run.json)
//
// One fee-paying wallet acts for every role; the role is decided by the private state (admin
// secret, issuer secret, holder credential), not by the wallet key. Every run deploys a fresh
// contract with a fresh admin secret and fresh issuer keys, so nothing here touches the
// operator's .env secrets except the wallet seed on remote networks.
//
// The devnet-run record layout (per-step tx id / block height or refusal message, then a
// public-state leak scan) follows the idea of JustEnough's scripts/devnet-e2e.ts (Apache-2.0).
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import {
  NO_NONCE,
  NO_SUBJECT,
  STATEPROOF_PRIVATE_STATE_ID,
  adminPrivateState,
  deployStateProof,
  emptyPrivateState,
  generateIssuerKeyPair,
  gridForPolicy,
  issuerPrivateState,
  issuerWitnessFor,
  ledger as decodeLedger,
  pureCircuits,
  scanTokens,
  secretToken,
  tokensFromCallData,
  tokensFromStateDump,
  unsafeGridForPolicy,
  type DeployedStateProof,
  type HolderProofInputs,
  type IssuerKeyPair,
  type Ledger,
  type Policy,
  type Secret,
  type StateProofPrivateState,
} from '@stateproof/contract';
import {
  createHolderSecret,
  createIssuanceRequest,
  getSchema,
  labelToBytes32,
  publicKeyToJson,
  randomBytes32,
  schemaIdBytes,
  schemaRule,
  sealSubject,
  toContractCredential,
  toHex,
  type CredentialDocument,
  type SubjectSeal,
} from '@stateproof/core';
import { issueFromRequest, loadPersonaSpec, loadRegistry, type IssuerEntry, type PersonaSpec } from '@stateproof/issuer';
import { REPO_ROOT, type CliConfig } from './config.js';
import {
  CAREER_SALARY_THRESHOLD,
  careerOpenPolicy,
  exactSalaryPolicy,
  narrowSalaryBandPolicy,
  offGridSalaryPolicy,
  youthWorkPolicy,
} from './demo-policies.js';
import { callDataOf, proofInputsFor, receiptOf, type CallData, type CallTxLike } from './holder.js';
import { compilerVersion, nowSeconds, type Session } from './session.js';
import { REFERENCE_LAG_SECONDS } from './commands.js';

const DAY = 86_400n;
const DEVNET_COMPOSE = path.join(REPO_ROOT, 'infra', 'devnet', 'docker-compose.yml');

export const defaultRunFile = (networkName: string): string =>
  path.join(REPO_ROOT, 'docs', networkName === 'undeployed' ? 'devnet-run.json' : `${networkName}-run.json`);

interface Step {
  readonly step: string;
  readonly txId?: string;
  readonly blockHeight?: number;
  readonly provingMs?: number | null;
  readonly wallMs?: number;
  readonly [key: string]: unknown;
}

interface Refusal {
  readonly attack: string;
  readonly circuit: string;
  readonly expected: string;
  readonly message: string | null;
  readonly failedAtCircuit: boolean;
  readonly proofsGenerated: number;
  readonly ok: boolean;
}

interface Holder {
  readonly spec: PersonaSpec;
  readonly secret: Uint8Array;
  readonly credentials: CredentialDocument[];
}

const errorMessage = (e: unknown): string => (e instanceof Error ? e.message : String(e));
const oneLine = (s: string): string => s.replace(/\s+/g, ' ').trim().slice(0, 400);

const devnetImages = async (): Promise<string[]> => {
  const text = await readFile(DEVNET_COMPOSE, 'utf8');
  return [...text.matchAll(/image:\s*['"]?([^'"\s]+)/g)].map((m) => m[1]);
};

export const runE2E = async (session: Session, options: { outFile: string }): Promise<boolean> => {
  const { config, logger, providers, proving, wallet } = session;
  const started = Date.now();
  const steps: Step[] = [];
  const refusals: Refusal[] = [];
  const failures: string[] = [];
  const calls: { circuit: string; label: string; data: CallData }[] = [];
  const secrets: Secret[] = [];
  const publicOnPurpose: bigint[] = [];

  const setPrivateState = (state: StateProofPrivateState) => providers.privateStateProvider.set(STATEPROOF_PRIVATE_STATE_ID, state);

  // A transaction that must succeed. Records tx id, block, proving time and the call's data.
  const tx = async <T extends CallTxLike>(label: string, circuit: string, run: () => Promise<T>, extra: (r: T) => Record<string, unknown> = () => ({})): Promise<T> => {
    const proofsBefore = proving.count;
    const t0 = Date.now();
    const result = await wallet.runTx(label, run);
    const receipt = receiptOf(result);
    calls.push({ circuit, label, data: callDataOf(result) });
    const step: Step = {
      step: label,
      txId: receipt.txId,
      blockHeight: receipt.blockHeight,
      provingMs: proving.count > proofsBefore ? proving.lastMs : null,
      wallMs: Date.now() - t0,
      ...extra(result),
    };
    steps.push(step);
    logger.info(`OK ${label}: tx ${receipt.txId} block ${receipt.blockHeight} proving ${String(step.provingMs)} ms`);
    return result;
  };

  // An attempt that must be refused by the circuit itself: the local circuit run throws the
  // expected assertion, no proof is produced and nothing is submitted.
  const refuse = async (attack: string, circuit: string, expected: RegExp, run: () => Promise<unknown>): Promise<void> => {
    const proofsBefore = proving.count;
    let message: string | null = null;
    try {
      await run();
    } catch (e) {
      message = oneLine(errorMessage(e));
    }
    const proofsGenerated = proving.count - proofsBefore;
    const failedAtCircuit = message !== null && /failed assert/i.test(message) && proofsGenerated === 0;
    const ok = failedAtCircuit && expected.test(message ?? '');
    refusals.push({ attack, circuit, expected: expected.source, message, failedAtCircuit, proofsGenerated, ok });
    if (ok) logger.info(`REFUSED as expected, ${attack}: ${message}`);
    else {
      failures.push(`${attack}: expected a circuit refusal matching /${expected.source}/, got ${message === null ? 'acceptance' : message}`);
      logger.error(`UNEXPECTED ${attack}: ${message ?? 'accepted'}`);
    }
  };

  const expect = (condition: boolean, what: string): void => {
    if (!condition) {
      failures.push(what);
      logger.error(`EXPECTATION FAILED: ${what}`);
    }
  };

  let contractAddress = '';
  let fatal: string | null = null;
  try {
    // ---- 1. deploy (admin) ------------------------------------------------------------------
    const adminSecret = randomBytes32();
    secrets.push({ name: 'admin secret', value: adminSecret });
    const t0 = Date.now();
    const deployed = await wallet.runTx('deploy', () => deployStateProof(providers, adminSecret));
    const contract: DeployedStateProof = deployed.contract;
    contractAddress = deployed.address;
    providers.privateStateProvider.setContractAddress(deployed.address);
    steps.push({ step: 'deploy', txId: deployed.receipt.txId, blockHeight: deployed.receipt.blockHeight, wallMs: Date.now() - t0, contractAddress });
    logger.info(`Deployed at ${contractAddress}`);
    const readLedgerNow = async (): Promise<Ledger> => {
      const state = await providers.publicDataProvider.queryContractState(contractAddress);
      if (state === null) throw new Error('Contract state not found at the indexer');
      return decodeLedger(state.data);
    };

    // ---- 2. register both schemas (admin) ----------------------------------------------------
    for (const schemaId of ['career', 'youth-work']) {
      const schema = getSchema(schemaId);
      await setPrivateState(adminPrivateState(adminSecret));
      await tx(`registerSchema(${schemaId})`, 'registerSchema', () => contract.callTx.registerSchema(schemaIdBytes(schema), schemaRule(schema)));
    }

    // ---- 3. register issuers with fresh keys (admin) -----------------------------------------
    const registry = await loadRegistry();
    const issuerKeys = new Map<string, IssuerKeyPair>();
    const issuers = new Map<string, IssuerEntry>();
    for (const base of registry.issuers) {
      const keyPair = generateIssuerKeyPair();
      issuerKeys.set(base.id, keyPair);
      issuers.set(base.id, { ...base, epoch: 0, publicKey: publicKeyToJson(keyPair.publicKey) });
      secrets.push({ name: `issuer secret (${base.id})`, value: keyPair.secretScalar });
      publicOnPurpose.push(BigInt(base.slot));
      await setPrivateState(adminPrivateState(adminSecret));
      await tx(`registerIssuer(${base.id}, ${base.schema}, slot ${base.slot})`, 'registerIssuer', () =>
        contract.callTx.registerIssuer(labelToBytes32(base.id), schemaIdBytes(getSchema(base.schema)), keyPair.publicKey, BigInt(base.slot)),
      );
    }

    // ---- 4. issuance: holder sends an IssuanceRequest (commitment only), issuer signs ----------
    const spec = await loadPersonaSpec();
    const issuedAt = new Date(Number(nowSeconds() - DAY) * 1000).toISOString();
    const expiresAt = new Date(Number(nowSeconds() + 365n * DAY) * 1000).toISOString();
    const holders = new Map<string, Holder>();
    const issueFor = async (holder: Holder, issuerId: string, epoch: number): Promise<CredentialDocument> => {
      const c = holder.spec.credentials.find((x) => x.issuer === issuerId);
      if (!c) throw new Error(`${holder.spec.id} has no credential from ${issuerId}`);
      const request = createIssuanceRequest(c.schema, holder.secret); // holder side
      const issuer = issuers.get(issuerId)!;
      const doc = await issueFromRequest({
        issuer: { ...issuer, epoch },
        keyPair: issuerKeys.get(issuerId)!,
        request, // issuer side: only { schema, holderCommit } crosses over
        subject: { name: holder.spec.name, birthDate: holder.spec.birthDate, claims: c.claims },
        issuedAt,
        expiresAt,
      });
      steps.push({ step: `issue(${holder.spec.id}, ${issuerId}, epoch ${epoch})`, offChain: true, schema: c.schema });
      return doc;
    };
    for (const persona of spec.personas) {
      const holder: Holder = { spec: persona, secret: createHolderSecret(), credentials: [] };
      holders.set(persona.id, holder);
      for (const c of persona.credentials) holder.credentials.push(await issueFor(holder, c.issuer, 0));
    }
    const holder = (id: string): Holder => {
      const h = holders.get(id);
      if (!h) throw new Error(`persona ${id} missing from packages/issuer/src/issue/personas.json`);
      return h;
    };
    const docOf = (id: string, schema: string): CredentialDocument => {
      const d = holder(id).credentials.find((c) => c.schema === schema);
      if (!d) throw new Error(`${id} has no ${schema} credential`);
      return d;
    };

    // ---- 5. verifiers open postings (no private state needed) --------------------------------
    const rules = { career: schemaRule(getSchema('career')), youth: schemaRule(getSchema('youth-work')) };
    const reference = nowSeconds() - REFERENCE_LAG_SECONDS;
    const requestExpiry = reference + DAY;
    publicOnPurpose.push(reference, requestExpiry);
    const createRequestTx = async (label: string, policy: Policy, rule: typeof rules.career, seal?: SubjectSeal): Promise<Uint8Array> => {
      const requestId = randomBytes32();
      for (const c of policy.conditions) publicOnPurpose.push(c.claimIndex, c.value, c.value2, ...c.set);
      await setPrivateState(emptyPrivateState());
      await tx(label, 'createRequest', () =>
        contract.callTx.createRequest(requestId, policy, gridForPolicy(policy, rule), reference, requestExpiry, seal ? { is_some: true, value: seal.commitment } : NO_SUBJECT),
      );
      return requestId;
    };
    const careerOpen = await createRequestTx('createRequest(career open posting)', careerOpenPolicy(), rules.career);
    const youthOpen = await createRequestTx('createRequest(youth-work open posting)', youthWorkPolicy(reference), rules.youth);
    const minji = holder('minji');
    const seal = await sealSubject(minji.spec.name, minji.spec.birthDate);
    secrets.push({ name: 'sealed request nonce', value: seal.nonce });
    const sealedForMinji = await createRequestTx('createRequest(career, sealed to one applicant)', careerOpenPolicy(), rules.career, seal);

    // ---- 6. valid proofs -----------------------------------------------------------------------
    const submit = async (label: string, requestId: Uint8Array, inputs: HolderProofInputs): Promise<Uint8Array> => {
      await setPrivateState({ adminSecret: null, issuerSecret: null, proofInputs: inputs });
      const result = await tx(label, 'submitProof', () => contract.callTx.submitProof(requestId), (r) => ({ pseudonym: toHex(r.private.result) }));
      const pseudonym = result.private.result;
      expect(toHex(pseudonym) === toHex(pureCircuits.pseudonymFor(requestId, inputs.holderSecret)), `${label}: pseudonym differs from pseudonymFor(request, secret)`);
      expect((await readLedgerNow()).answers.lookup(requestId).member(pseudonym), `${label}: answer not found on the ledger`);
      return pseudonym;
    };
    const inputsFor = async (id: string, schema: string, nonce: Uint8Array = NO_NONCE): Promise<HolderProofInputs> =>
      proofInputsFor(docOf(id, schema), holder(id).secret, await readLedgerNow(), nonce);

    const minjiPseudonym = await submit('submitProof(minji -> career open posting)', careerOpen, await inputsFor('minji', 'career'));
    await submit('submitProof(sora -> career open posting, other issuer)', careerOpen, await inputsFor('sora', 'career'));
    await submit('submitProof(haneul -> youth-work open posting)', youthOpen, await inputsFor('haneul', 'youth-work'));
    const ledgerAfterAnswers = await readLedgerNow();
    expect(ledgerAfterAnswers.answerCounts.lookup(careerOpen).read() === 2n, 'career posting should have exactly 2 answers');
    expect(ledgerAfterAnswers.answerCounts.lookup(youthOpen).read() === 1n, 'youth-work posting should have exactly 1 answer');

    // ---- 7. refusals, each at the circuit ------------------------------------------------------
    const tryProof = async (requestId: Uint8Array, inputs: HolderProofInputs): Promise<unknown> => {
      await setPrivateState({ adminSecret: null, issuerSecret: null, proofInputs: inputs });
      return contract.callTx.submitProof(requestId);
    };
    // Not one of the attacks: an honest applicant who does not qualify is stopped too.
    await refuse('control: honest applicant below the salary bar (junho, 4,200만원)', 'submitProof', /Policy conditions are not satisfied/, async () =>
      tryProof(careerOpen, await inputsFor('junho', 'career')));
    await refuse('control: honest youth applicant outside the age/region bar (woojin)', 'submitProof', /Policy conditions are not satisfied/, async () =>
      tryProof(youthOpen, await inputsFor('woojin', 'youth-work')));

    // (1) forged salary: junho edits his signed salary from 4,200 to 6,200만원.
    await refuse('1. forged salary (claims edited after signing)', 'submitProof', /Invalid issuer signature/, async () => {
      const honest = await inputsFor('junho', 'career');
      const claims = [...honest.credential.claims];
      claims[Number(getSchema('career').claims.find((c) => c.key === 'annualSalary')!.slot)] = 6_200n;
      return tryProof(careerOpen, { ...honest, credential: { ...honest.credential, claims } });
    });
    // (2) stand-in: sora qualifies and got minji's private link (nonce), but she is not minji.
    await refuse('2. stand-in answer on a sealed request (sora uses minji\'s link)', 'submitProof', /different person/, async () =>
      tryProof(sealedForMinji, await inputsFor('sora', 'career', seal.nonce)));
    // (3) duplicate: minji answers the same posting again.
    await refuse('3. duplicate answer (minji, same posting)', 'submitProof', /already answered this request/, async () =>
      tryProof(careerOpen, await inputsFor('minji', 'career')));
    // (4) over-asking verifiers.
    const tryCreate = async (policy: Policy): Promise<unknown> => {
      await setPrivateState(emptyPrivateState());
      return contract.callTx.createRequest(randomBytes32(), policy, unsafeGridForPolicy(policy, rules.career), reference, requestExpiry, NO_SUBJECT);
    };
    await refuse('4a. over-asking: exact salary (= 5,210만원)', 'createRequest', /narrows a protected value/, () => tryCreate(exactSalaryPolicy()));
    await refuse('4b. over-asking: salary band narrower than 500만원 (5,000..5,100)', 'createRequest', /narrows a protected value/, () =>
      tryCreate(narrowSalaryBandPolicy()));
    // (6) repeated-query narrowing: ">= 5,100" after ">= 5,000" would split a grid cell.
    await refuse('6. repeated-query attack: off-grid salary bound (>= 5,100만원)', 'createRequest', /must sit on its grid/, () => tryCreate(offGridSalaryPolicy()));

    // (5) revocation: minji's epoch-0 inputs are prepared before the issuer rotates.
    const staleInputs = await inputsFor('minji', 'career', seal.nonce);
    const acme = issuers.get('issuer:acme-hr');
    if (!acme) throw new Error('issuer:acme-hr missing from config/issuers.json');
    await setPrivateState(issuerPrivateState(issuerKeys.get(acme.id)!.secretScalar));
    await tx('rotateIssuerEpoch(issuer:acme-hr) -> epoch 1', 'rotateIssuerEpoch', () => contract.callTx.rotateIssuerEpoch(labelToBytes32(acme.id)));
    const rotated = await readLedgerNow();
    expect(rotated.issuers.lookup(labelToBytes32(acme.id)).epoch === 1n, 'acme epoch should be 1 after rotation');
    await refuse('5. revoked credential (epoch 0 after the issuer rotated to epoch 1)', 'submitProof', /not in the current issuer set/, () =>
      tryProof(sealedForMinji, staleInputs));
    let holderAppMessage: string | null = null;
    try {
      issuerWitnessFor(rotated, toContractCredential(docOf('minji', 'career')));
    } catch (e) {
      holderAppMessage = oneLine(errorMessage(e));
    }
    expect(holderAppMessage !== null && /Ask for a re-issued credential/.test(holderAppMessage), 'holder app should refuse the stale credential before proving');
    steps.push({ step: 'holder app check on the stale credential (off-chain)', offChain: true, message: holderAppMessage });

    // Re-issue in epoch 1 from a fresh issuance request; the named applicant answers her sealed request.
    const reissued = await issueFor(minji, acme.id, 1);
    minji.credentials.push(reissued);
    await submit(
      'submitProof(minji re-issued epoch 1 -> sealed request)',
      sealedForMinji,
      proofInputsFor(reissued, minji.secret, await readLedgerNow(), seal.nonce),
    );

    // ---- 8. leak scan of what the chain stores -------------------------------------------------
    const state = await providers.publicDataProvider.queryContractState(contractAddress);
    if (state === null) throw new Error('Contract state not found at the indexer');
    const ledgerTokens = tokensFromStateDump(String(state.data));
    const finalLedger = decodeLedger(state.data);
    publicOnPurpose.push(0n, 1n, 2n, 3n, finalLedger.answerCounts.lookup(careerOpen).read());

    const publicTokens = new Set(publicOnPurpose.map((v) => secretToken(v)));
    const skipped: { name: string; reason: string }[] = [];
    const utf8 = (s: string) => new TextEncoder().encode(s);
    for (const h of holders.values()) {
      const who = h.spec.id;
      secrets.push({ name: `${who}: holder secret`, value: h.secret });
      secrets.push({ name: `${who}: name (UTF-8)`, value: utf8(h.spec.name) });
      secrets.push({ name: `${who}: birth date (text)`, value: utf8(h.spec.birthDate) });
      for (const doc of h.credentials) {
        const cred = toContractCredential(doc);
        const tag = `${who}/${doc.schema}/epoch ${doc.issuer.epoch}`;
        secrets.push({ name: `${tag}: holder commitment`, value: cred.holderCommit });
        secrets.push({ name: `${tag}: subject id`, value: cred.subjectId });
        secrets.push({ name: `${tag}: salt`, value: cred.salt });
        secrets.push({ name: `${tag}: issuedAt`, value: cred.issuedAt });
        secrets.push({ name: `${tag}: expiresAt`, value: cred.expiresAt });
        secrets.push({ name: `${tag}: signature s`, value: BigInt(doc.proof.s) });
        secrets.push({ name: `${tag}: signature r.x`, value: BigInt(doc.proof.r.x) });
        const schema = getSchema(doc.schema);
        for (const claim of schema.claims) {
          const value = cred.claims[claim.slot];
          const name = `${tag}: claim ${claim.key} = ${String(doc.credentialSubject[claim.key])}`;
          if (publicTokens.has(secretToken(value))) {
            skipped.push({ name, reason: 'equals a value that is public on purpose (policy constant, slot, epoch or count); an exact-token scan cannot tell them apart' });
          } else secrets.push({ name, value });
        }
      }
    }
    const callHits = calls.flatMap((c) => scanTokens(tokensFromCallData(c.data.publicData), secrets, `${c.label} (public call data)`));
    const ledgerHits = scanTokens(ledgerTokens, secrets, 'ledger state (indexer)');

    // Which issuer signed stays hidden in submitProof: no issuer id, key or leaf in its public data.
    const signerSecrets: Secret[] = [...issuers.values()].flatMap((i) => {
      const key = issuerKeys.get(i.id)!.publicKey;
      return [
        { name: `${i.id}: issuer id`, value: labelToBytes32(i.id) },
        { name: `${i.id}: public key x`, value: key.x },
        { name: `${i.id}: public key y`, value: key.y },
        ...[0n, 1n].map((epoch) => ({ name: `${i.id}: leaf epoch ${epoch}`, value: pureCircuits.issuerLeaf(labelToBytes32(i.id), schemaIdBytes(getSchema(i.schema)), key, epoch) })),
      ];
    });
    const submitCalls = calls.filter((c) => c.circuit === 'submitProof');
    const signerHits = submitCalls.flatMap((c) => scanTokens(tokensFromCallData(c.data.publicData), signerSecrets, `${c.label} (public call data)`));

    // Positive controls: the scanner must find what is public on purpose, and must find the
    // holder secret in the prover-only part of the same call.
    const minjiCall = submitCalls[0];
    const acmeKey = issuerKeys.get(acme.id)!.publicKey;
    const control = (name: string, tokens: string[], value: bigint | Uint8Array, source: string) => {
      const found = scanTokens(tokens, [{ name, value }], source).length > 0;
      expect(found, `positive control not found: ${name} in ${source}`);
      return { name, source, found };
    };
    const positiveControls = [
      control(`public threshold annualSalary >= ${CAREER_SALARY_THRESHOLD}`, ledgerTokens, CAREER_SALARY_THRESHOLD, 'ledger state (indexer)'),
      control('minji pseudonym for the career posting', ledgerTokens, minjiPseudonym, 'ledger state (indexer)'),
      control('issuer:acme-hr id (public registry)', ledgerTokens, labelToBytes32(acme.id), 'ledger state (indexer)'),
      control('issuer:acme-hr public key x (public registry)', ledgerTokens, acmeKey.x, 'ledger state (indexer)'),
      control('minji pseudonym', tokensFromCallData(minjiCall.data.publicData), minjiPseudonym, `${minjiCall.label} (public call data)`),
      control('minji holder secret', tokensFromCallData(minjiCall.data.privateData), minji.secret, `${minjiCall.label} (prover-only data)`),
      control('minji salary 6,200', tokensFromCallData(minjiCall.data.privateData), 6_200n, `${minjiCall.label} (prover-only data)`),
    ];
    expect(ledgerHits.length === 0, `ledger leak hits: ${ledgerHits.map((h) => h.name).join(', ')}`);
    expect(callHits.length === 0, `public call data leak hits: ${callHits.map((h) => `${h.name} @ ${h.source}`).join(', ')}`);
    expect(signerHits.length === 0, `signer identity visible in submitProof: ${signerHits.map((h) => h.name).join(', ')}`);

    const leakScan = {
      source: `indexer ${config.network.indexer} queryContractState(${contractAddress}) + public data of ${calls.length} calls`,
      ledgerTokens: ledgerTokens.length,
      secretsScanned: secrets.length,
      secretNames: secrets.map((s) => s.name),
      ledgerHits,
      publicCallDataHits: callHits,
      signerIdentityInSubmitProof: { submitProofCalls: submitCalls.length, secretsScanned: signerSecrets.length, hits: signerHits },
      notScannable: skipped,
      positiveControls,
    };
    await writeReport(config, options.outFile, { contractAddress, steps, refusals, failures, leakScan, started, fatal });
  } catch (e) {
    fatal = oneLine(errorMessage(e));
    failures.push(`fatal: ${fatal}`);
    logger.error(e instanceof Error ? (e.stack ?? e.message) : String(e));
    await writeReport(config, options.outFile, { contractAddress, steps, refusals, failures, leakScan: null, started, fatal });
  }
  const expectedRefusals = refusals.filter((r) => !r.attack.startsWith('control')).length;
  logger.info(`e2e ${failures.length === 0 ? 'PASSED' : 'FAILED'}: ${steps.filter((s) => s.txId).length} transactions, ${refusals.filter((r) => r.ok).length}/${refusals.length} refusals as expected (${expectedRefusals} attacks), ${failures.length} failure(s)`);
  for (const f of failures) logger.error(`  - ${f}`);
  return failures.length === 0;
};

const writeReport = async (
  config: CliConfig,
  outFile: string,
  r: {
    contractAddress: string;
    steps: Step[];
    refusals: Refusal[];
    failures: string[];
    leakScan: unknown;
    started: number;
    fatal: string | null;
  },
): Promise<void> => {
  const txSteps = r.steps.filter((s) => s.txId);
  const provingMs = Object.fromEntries(txSteps.filter((s) => typeof s.provingMs === 'number').map((s) => [s.step, s.provingMs]));
  const report = {
    format: 'stateproof-e2e-run/v2',
    ok: r.failures.length === 0,
    network: {
      name: config.networkName,
      networkId: config.network.networkId,
      ...(config.networkName === 'undeployed' ? { images: await devnetImages() } : { indexer: config.network.indexer, node: config.network.node }),
    },
    compiler: `compactc ${await compilerVersion()}`,
    prover: config.prover === 'proof-server' ? `proof server ${config.network.proofServer}` : 'zkir-v2 WASM prover (Node)',
    ranAt: new Date(r.started).toISOString(),
    finishedAt: new Date().toISOString(),
    totalSeconds: Math.round((Date.now() - r.started) / 1000),
    contractAddress: r.contractAddress,
    summary: {
      transactions: txSteps.length,
      refusalsExpected: r.refusals.length,
      refusalsAsExpected: r.refusals.filter((x) => x.ok).length,
      provingMs,
    },
    steps: r.steps,
    refusals: r.refusals,
    leakScan: r.leakScan,
    failures: r.failures,
    fatal: r.fatal,
  };
  const json = JSON.stringify(report, (_k, v: unknown) => (typeof v === 'bigint' ? v.toString() : v instanceof Uint8Array ? toHex(v) : v), 2);
  await writeFile(outFile, `${json}\n`, 'utf8');
};
