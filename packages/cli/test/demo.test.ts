// The e2e story's expectations, checked offline against the compiled pure circuits:
// who qualifies for which posting, and which verifier requests the circuit must refuse.
import { describe, expect, it } from 'vitest';
import { pureCircuits, unsafeGridForPolicy, gridForPolicy, type Policy } from '@stateproof/contract';
import { encodeSubject, getSchema, schemaRule } from '@stateproof/core';
import { loadPersonaSpec } from '@stateproof/issuer';
import { careerOpenPolicy, exactSalaryPolicy, narrowSalaryBandPolicy, offGridSalaryPolicy, youthWorkPolicy } from '../src/demo-policies.js';
import { loadCliConfig, loadNetwork } from '../src/config.js';

// 2026-09-30T00:00:00Z
const REFERENCE = 1_790_726_400n;

const claimsOf = async (personaId: string, schema: string): Promise<bigint[]> => {
  const spec = await loadPersonaSpec();
  const persona = spec.personas.find((p) => p.id === personaId)!;
  const c = persona.credentials.find((x) => x.schema === schema)!;
  return encodeSubject(getSchema(schema), c.claims);
};

const holds = async (personaId: string, schema: string, policy: Policy): Promise<boolean> =>
  pureCircuits.policyHolds(await claimsOf(personaId, schema), policy);

describe('demo postings vs demo personas', () => {
  it('career posting: minji and sora qualify, junho does not', async () => {
    expect(await holds('minji', 'career', careerOpenPolicy())).toBe(true);
    expect(await holds('sora', 'career', careerOpenPolicy())).toBe(true);
    expect(await holds('junho', 'career', careerOpenPolicy())).toBe(false);
  });

  it('youth-work posting (19-24, Seoul/Gyeonggi, 6+ months): haneul qualifies, woojin does not', async () => {
    expect(await holds('haneul', 'youth-work', youthWorkPolicy(REFERENCE))).toBe(true);
    expect(await holds('woojin', 'youth-work', youthWorkPolicy(REFERENCE))).toBe(false);
  });

  it('forged salary would pass the policy, so only the signature can stop it', async () => {
    const forged = await claimsOf('junho', 'career');
    forged[3] = 6_200n;
    expect(pureCircuits.policyHolds(forged, careerOpenPolicy())).toBe(true);
  });

  it('the honest postings respect the schema rules and sit on the grid', () => {
    const career = schemaRule(getSchema('career'));
    const youth = schemaRule(getSchema('youth-work'));
    expect(pureCircuits.respectsSensitiveSlots(careerOpenPolicy(), career)).toBe(true);
    expect(pureCircuits.boundsOnGrid(careerOpenPolicy(), career, gridForPolicy(careerOpenPolicy(), career))).toBe(true);
    expect(pureCircuits.respectsSensitiveSlots(youthWorkPolicy(REFERENCE), youth)).toBe(true);
    expect(() => gridForPolicy(youthWorkPolicy(REFERENCE), youth)).not.toThrow();
  });
});

describe('over-asking requests are refused by the circuit rules', () => {
  const career = schemaRule(getSchema('career'));

  it.each([
    ['exact salary', exactSalaryPolicy],
    ['salary band narrower than 500', narrowSalaryBandPolicy],
  ])('%s fails respectsSensitiveSlots', (_name, build) => {
    expect(pureCircuits.respectsSensitiveSlots(build(), career)).toBe(false);
  });

  it('off-grid salary bound passes the width rule but fails the grid rule', () => {
    const policy = offGridSalaryPolicy();
    expect(pureCircuits.respectsSensitiveSlots(policy, career)).toBe(true);
    expect(pureCircuits.boundsOnGrid(policy, career, unsafeGridForPolicy(policy, career))).toBe(false);
    expect(() => gridForPolicy(policy, career)).toThrow(/not a multiple of its grid step 500/);
  });
});

describe('network configuration', () => {
  it('the local devnet needs no secrets and proves with the local proof server', () => {
    const net = loadNetwork('undeployed');
    expect(net.prover).toBe('proof-server');
    expect(net.proofServer).toBe('http://127.0.0.1:6300');
    const config = loadCliConfig('undeployed');
    expect(config.walletStateFile).toBeNull();
    expect(config.operatorSeed).toBe(net.genesisWalletSeed);
  });

  it('remote networks prove with the WASM prover by default', () => {
    expect(loadNetwork('preprod').prover).toBe('wasm');
    expect(() => loadNetwork('mainnet')).toThrow(/not in config\/networks.json/);
  });
});
