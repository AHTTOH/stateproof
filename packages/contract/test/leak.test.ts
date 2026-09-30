// "What the chain sees": after a full hiring flow, no credential value, holder secret or
// signer identity appears in the ledger or in the public part of any call. The positive
// controls prove the scanner reads real data: it must find every one of those secrets in
// the prover-only part of the same call, and the values that are public on purpose.
import { describe, expect, it } from 'vitest';
import { pureCircuits } from '../src/managed/stateproof/contract/index.js';
import {
  privateCallData,
  publicCallData,
  scanTokens,
  tokensFromCallData,
  tokensFromStateDump,
  type Secret,
} from '../src/leak-scan.js';
import { ACME_ISSUER, DAY, NOW, holderCredential, randomBytes32, salaryPolicy, subjectDigest, world } from './fixtures.js';

const run = () => {
  const w = world();
  const nonce = randomBytes32();
  const subject = 'kim-minji|19940302';
  const fx = holderCredential(w, {}, { subject, nonce });
  const requestId = randomBytes32();
  const subjectCommit = pureCircuits.subjectCommitment(pureCircuits.subjectIdOf(subjectDigest(subject)), nonce);
  w.sim.asVerifier().createRequest(requestId, salaryPolicy(), NOW, NOW + DAY, { is_some: true, value: subjectCommit });
  const pseudonym = w.sim.asHolder(fx.inputs).submitProof(requestId);
  const credential = fx.credential;
  const holderSecrets: Secret[] = [
    { name: 'salary', value: credential.claims[3] },
    { name: 'career months', value: credential.claims[2] },
    { name: 'holder secret', value: fx.holderSecret },
    { name: 'holder commitment', value: credential.holderCommit },
    { name: 'subject id', value: credential.subjectId },
    { name: 'credential salt', value: credential.salt },
    { name: 'credential issuedAt', value: credential.issuedAt },
    { name: 'credential expiresAt', value: credential.expiresAt },
    { name: 'signature s', value: fx.inputs.signature.s },
    { name: 'signature r.x', value: fx.inputs.signature.r.x },
    { name: 'request nonce', value: nonce },
  ];
  const record = w.sim.getLedger().issuers.lookup(ACME_ISSUER);
  const signerSecrets: Secret[] = [
    { name: 'issuer id', value: ACME_ISSUER },
    { name: 'issuer key x', value: record.publicKey.x },
    { name: 'issuer key y', value: record.publicKey.y },
    { name: 'issuer leaf', value: pureCircuits.issuerLeaf(ACME_ISSUER, record.schemaId, record.publicKey, record.epoch) },
  ];
  const submit = w.sim.calls.filter((call) => call.circuit === 'submitProof');
  return { w, pseudonym, record, holderSecrets, signerSecrets, submit };
};

describe('leak scan', () => {
  it('finds no credential value or holder secret in the ledger or any public call data', () => {
    const { w, holderSecrets } = run();
    const hits = [
      ...scanTokens(tokensFromStateDump(w.sim.stateDump()), holderSecrets, 'ledger'),
      ...w.sim.calls.flatMap((call) => scanTokens(tokensFromCallData(publicCallData(call.transcript)), holderSecrets, call.circuit)),
    ];
    expect(hits).toEqual([]);
  });

  it('does not reveal which issuer signed: no issuer id, key or leaf in public submitProof data', () => {
    const { submit, signerSecrets } = run();
    expect(submit).toHaveLength(1);
    expect(scanTokens(tokensFromCallData(publicCallData(submit[0].transcript)), signerSecrets, 'submitProof')).toEqual([]);
  });

  it('positive control: every scanned secret is found in the prover-only part of submitProof', () => {
    const { submit, holderSecrets, signerSecrets } = run();
    const privateTokens = tokensFromCallData(privateCallData(submit[0].transcript));
    const found = scanTokens(privateTokens, [...holderSecrets, ...signerSecrets.filter((s) => s.name !== 'issuer id' && s.name !== 'issuer leaf')], 'private');
    // issuer id and leaf are recomputed in-circuit, not passed as witnesses.
    expect(found.map((h) => h.name).sort()).toEqual(
      [...holderSecrets.map((s) => s.name), 'issuer key x', 'issuer key y'].sort(),
    );
  });

  it('positive control: the scanner finds values that are public on purpose', () => {
    const { w, pseudonym, record, submit } = run();
    const ledgerTokens = tokensFromStateDump(w.sim.stateDump());
    const createTokens = tokensFromCallData(publicCallData(w.sim.calls.find((c) => c.circuit === 'createRequest')!.transcript));
    const submitTokens = tokensFromCallData(publicCallData(submit[0].transcript));
    expect(scanTokens(ledgerTokens, [{ name: 'threshold', value: 5_000n }], 'ledger')).toHaveLength(1);
    expect(scanTokens(createTokens, [{ name: 'threshold', value: 5_000n }], 'createRequest')).toHaveLength(1);
    expect(scanTokens(ledgerTokens, [{ name: 'pseudonym', value: pseudonym }], 'ledger')).toHaveLength(1);
    expect(scanTokens(submitTokens, [{ name: 'pseudonym', value: pseudonym }], 'submitProof')).toHaveLength(1);
    expect(scanTokens(ledgerTokens, [{ name: 'issuer id (public registry)', value: ACME_ISSUER }], 'ledger')).toHaveLength(1);
    expect(scanTokens(ledgerTokens, [{ name: 'issuer key x (public registry)', value: record.publicKey.x }], 'ledger')).toHaveLength(1);
  });
});
