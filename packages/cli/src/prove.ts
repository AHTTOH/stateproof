// Submits one holder proof for an existing request (a demo persona's credential).
//   npm run prove -w @stateproof/cli -- --request <hex> --persona minji --schema employment
import { parseArgs } from 'node:util';
import { emptyPrivateState, joinStateProof, readLedger, submitProof } from '@stateproof/contract';
import { buildReceipt, fromHex32 } from '@stateproof/core';
import { loadPersona, proofInputsFor } from './e2e-preprod.js';
import { exitOnError, requireDeployment, runSession } from './session.js';

const { values } = parseArgs({ options: { request: { type: 'string' }, persona: { type: 'string' }, schema: { type: 'string' } } });
if (!values.request || !values.persona || !values.schema) {
  throw new Error('usage: prove --request <hex> --persona <id> --schema <employment|identity>');
}
const { request, persona, schema } = values;

exitOnError(
  runSession('prove', async ({ config, logger, providers, wallet }) => {
    const { contractAddress } = await requireDeployment(config.network.networkId);
    const contract = await joinStateProof(providers, contractAddress, emptyPrivateState());
    const requestId = fromHex32(request);
    const holder = await loadPersona(persona);
    const started = Date.now();
    const proved = await wallet.runTx('submitProof', () => submitProof(providers, contract, requestId, proofInputsFor(holder, schema)));
    logger.info(`submitProof tx ${proved.txHash} (block ${proved.blockHeight}) in ${Math.round((Date.now() - started) / 1000)}s`);
    const ledger = await readLedger(providers.publicDataProvider, contractAddress);
    const receipt = buildReceipt(requestId, ledger.requests.lookup(requestId), ledger.results.member(requestId) ? ledger.results.lookup(requestId) : null, BigInt(Math.floor(Date.now() / 1000)));
    logger.info(`Receipt: status=${receipt.status} revealed=${JSON.stringify(receipt.revealed)} conditions=${JSON.stringify(receipt.policy.conditions)}`);
    if (receipt.status !== 'verified') throw new Error(`Expected verified, got ${receipt.status}`);
  }),
);
