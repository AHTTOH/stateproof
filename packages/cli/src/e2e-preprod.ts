// End-to-end on Preprod: verifier creates a request, a demo holder proves it, the
// receipt is read back from the ledger. A second holder who does not qualify must be
// stopped locally before any proof or transaction is produced.
//   npm run e2e -w @stateproof/cli
import { readFile } from 'node:fs/promises';
import { createRequest, emptyPrivateState, joinStateProof, readLedger, submitProof } from '@stateproof/contract';
import {
  buildPolicy,
  buildReceipt,
  fromHex32,
  randomBytes32,
  toContractCredential,
  toContractSignature,
  toHex,
  type PolicyInput,
} from '@stateproof/core';
import { DEMO_BUNDLE_FILE, type PersonaBundle } from '@stateproof/issuer';
import { exitOnError, requireDeployment, runSession } from './session.js';

const REQUEST_TTL_SECONDS = 86_400n;

const DEMO_POLICY: PolicyInput = {
  schema: 'employment',
  issuerId: 'issuer:acme-hr',
  conditions: [
    { claim: 'employmentStatus', op: 'eq', value: 'Active' },
    { claim: 'employmentMonths', op: 'gte', value: 12 },
  ],
  reveal: 'jobCategory',
};

const loadPersona = async (id: string): Promise<PersonaBundle> => {
  const { personas } = JSON.parse(await readFile(DEMO_BUNDLE_FILE, 'utf8')) as { personas: PersonaBundle[] };
  const persona = personas.find((p) => p.id === id);
  if (!persona) throw new Error(`Persona ${id} not found in ${DEMO_BUNDLE_FILE}`);
  return persona;
};

const proofInputsFor = (persona: PersonaBundle, schema: string) => {
  const doc = persona.credentials.find((c) => c.schema === schema);
  if (!doc) throw new Error(`${persona.id} has no ${schema} credential`);
  return { credential: toContractCredential(doc), signature: toContractSignature(doc), holderSecret: fromHex32(persona.holderSecret) };
};

exitOnError(
  runSession('e2e', async ({ config, logger, providers }) => {
    const { contractAddress } = await requireDeployment(config.network.networkId);
    const contract = await joinStateProof(providers, contractAddress, emptyPrivateState());

    const requestId = randomBytes32();
    const now = BigInt(Math.floor(Date.now() / 1000));
    let t = Date.now();
    const created = await createRequest(contract, requestId, buildPolicy(DEMO_POLICY), now, now + REQUEST_TTL_SECONDS);
    logger.info(`createRequest ${toHex(requestId)} tx ${created.txId} in ${Math.round((Date.now() - t) / 1000)}s`);

    const sora = await loadPersona('sora');
    try {
      await submitProof(providers, contract, requestId, proofInputsFor(sora, 'employment'));
      throw new Error('Sora (6 months) must not satisfy the policy');
    } catch (e) {
      if (!(e instanceof Error) || !/Policy conditions are not satisfied/.test(e.message)) throw e;
      logger.info('Sora rejected locally as expected: policy not satisfied, nothing sent on chain');
    }

    const minji = await loadPersona('minji');
    t = Date.now();
    const proved = await submitProof(providers, contract, requestId, proofInputsFor(minji, 'employment'));
    logger.info(`submitProof tx ${proved.txId} (block ${proved.blockHeight}) in ${Math.round((Date.now() - t) / 1000)}s`);

    const ledger = await readLedger(providers.publicDataProvider, contractAddress);
    const receipt = buildReceipt(requestId, ledger.requests.lookup(requestId), ledger.results.member(requestId) ? ledger.results.lookup(requestId) : null, BigInt(Math.floor(Date.now() / 1000)));
    logger.info(`Receipt: ${JSON.stringify({ ...receipt, policy: { conditions: receipt.policy.conditions, notDisclosed: receipt.policy.notDisclosed } })}`);
    if (receipt.status !== 'verified') throw new Error(`Expected verified, got ${receipt.status}`);
  }),
);
