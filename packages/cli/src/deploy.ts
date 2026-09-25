// Deploys StateProof and records the address in config/deployments.json.
//   npm run deploy -w @stateproof/cli
import { deployStateProof } from '@stateproof/contract';
import { fromHex32 } from '@stateproof/core';
import { requireEnv } from './config.js';
import { exitOnError, runSession, writeDeployment } from './session.js';

const COMPILER_VERSION = '0.31.1';

exitOnError(
  runSession('deploy', async ({ config, logger, providers }) => {
    const adminSecret = fromHex32(requireEnv('STATEPROOF_ADMIN_SECRET'));
    const started = Date.now();
    const { address, receipt } = await deployStateProof(providers, adminSecret);
    logger.info(`Deployed StateProof at ${address} (tx ${receipt.txId}, block ${receipt.blockHeight}) in ${Math.round((Date.now() - started) / 1000)}s`);
    await writeDeployment(config.network.networkId, {
      contractAddress: address,
      deployedAt: new Date().toISOString(),
      deployTxId: receipt.txId,
      compiler: COMPILER_VERSION,
    });
    logger.info('Recorded in config/deployments.json');
  }),
);
