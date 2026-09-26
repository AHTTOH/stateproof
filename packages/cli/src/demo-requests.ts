// Long-lived demo requests that reviewers can open without a wallet: they show the
// disclosure boundary, the local "not met" check and a browser-only proof.
//   npm run demo-request -w @stateproof/cli -- --policy employment --ttl-days 30
import { parseArgs } from 'node:util';
import { createRequest, emptyPrivateState, joinStateProof } from '@stateproof/contract';
import { buildPolicy, randomBytes32, toHex, type PolicyInput } from '@stateproof/core';
import { exitOnError, requireDeployment, runSession } from './session.js';

const SECONDS_PER_DAY = 86_400n;

export const DEMO_POLICIES: Readonly<Record<string, PolicyInput>> = {
  employment: {
    schema: 'employment',
    issuerId: 'issuer:acme-hr',
    conditions: [
      { claim: 'employmentStatus', op: 'eq', value: 'Active' },
      { claim: 'employmentMonths', op: 'gte', value: 12 },
    ],
    reveal: 'jobCategory',
  },
  identity: {
    schema: 'identity',
    issuerId: 'issuer:gov-id-demo',
    conditions: [
      { claim: 'ageYears', op: 'gte', value: 19 },
      { claim: 'region', op: 'inSet', values: ['Seoul', 'Gyeonggi'] },
    ],
    reveal: 'region',
  },
};

const { values } = parseArgs({ options: { policy: { type: 'string' }, 'ttl-days': { type: 'string' } } });
const name = values.policy;
const ttlDays = values['ttl-days'];
if (!name || !ttlDays || !(name in DEMO_POLICIES) || !/^\d+$/.test(ttlDays)) {
  throw new Error(`usage: demo-request --policy <${Object.keys(DEMO_POLICIES).join('|')}> --ttl-days <n>`);
}

exitOnError(
  runSession('demo-request', async ({ config, logger, providers, wallet }) => {
    const { contractAddress } = await requireDeployment(config.network.networkId);
    const contract = await joinStateProof(providers, contractAddress, emptyPrivateState());
    const requestId = randomBytes32();
    const now = BigInt(Math.floor(Date.now() / 1000));
    const receipt = await wallet.runTx('createRequest', () =>
      createRequest(contract, requestId, buildPolicy(DEMO_POLICIES[name]), now, now + BigInt(ttlDays) * SECONDS_PER_DAY),
    );
    logger.info(`demo request ${name}: id ${toHex(requestId)} tx ${receipt.txHash} expires in ${ttlDays} days`);
  }),
);
