// Registers every issuer from config/issuers.json whose on-chain key is missing or different.
//   npm run register-issuer -w @stateproof/cli
import { adminPrivateState, joinStateProof, readLedger, registerIssuer } from '@stateproof/contract';
import { fromHex32, labelToBytes32, publicKeyFromJson } from '@stateproof/core';
import { loadRegistry } from '@stateproof/issuer';
import { requireEnv } from './config.js';
import { exitOnError, requireDeployment, runSession } from './session.js';

exitOnError(
  runSession('register-issuer', async ({ config, logger, providers }) => {
    const { contractAddress } = await requireDeployment(config.network.networkId);
    const admin = await joinStateProof(providers, contractAddress, adminPrivateState(fromHex32(requireEnv('STATEPROOF_ADMIN_SECRET'))));
    const registry = await loadRegistry();
    for (const entry of registry.issuers) {
      if (entry.publicKey === null) throw new Error(`${entry.id} has no public key; run the issuer keygen first`);
      const id = labelToBytes32(entry.id);
      const key = publicKeyFromJson(entry.publicKey);
      const ledger = await readLedger(providers.publicDataProvider, contractAddress);
      if (ledger.issuers.member(id)) {
        const onChain = ledger.issuers.lookup(id);
        if (onChain.x === key.x && onChain.y === key.y) {
          logger.info(`${entry.id} already registered`);
          continue;
        }
      }
      const started = Date.now();
      const receipt = await registerIssuer(admin, id, key);
      logger.info(`Registered ${entry.id} (tx ${receipt.txId}) in ${Math.round((Date.now() - started) / 1000)}s`);
    }
  }),
);
