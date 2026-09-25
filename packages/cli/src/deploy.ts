// Deploys StateProof and records the address in config/deployments.json.
//   npm run deploy -w @stateproof/cli
import { deployStateProof } from '@stateproof/contract';
import { fromHex32 } from '@stateproof/core';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { CONTRACT_MANAGED_DIR, requireEnv } from './config.js';
import { exitOnError, runSession, writeDeployment } from './session.js';

// The compiler that produced the committed artifacts, as recorded by compactc itself.
const compilerVersion = async (): Promise<string> => {
  const info = JSON.parse(await readFile(path.join(CONTRACT_MANAGED_DIR, 'compiler', 'contract-info.json'), 'utf8')) as Record<string, unknown>;
  const version = info['compiler-version'];
  if (typeof version !== 'string') throw new Error('contract-info.json has no compiler-version');
  return version;
};

exitOnError(
  runSession('deploy', async ({ config, logger, providers }) => {
    const adminSecret = fromHex32(requireEnv('STATEPROOF_ADMIN_SECRET'));
    const started = Date.now();
    const { address, receipt } = await deployStateProof(providers, adminSecret);
    logger.info(`Deployed StateProof at ${address} (tx ${receipt.txHash}, block ${receipt.blockHeight}) in ${Math.round((Date.now() - started) / 1000)}s`);
    await writeDeployment(config.network.networkId, {
      contractAddress: address,
      deployedAt: new Date().toISOString(),
      deployTxHash: receipt.txHash,
      compiler: await compilerVersion(),
    });
    logger.info('Recorded in config/deployments.json');
  }),
);
