// Operator commands against the deployed StateProof v2 contract (config/deployments.json).
import { writeFile, readFile } from 'node:fs/promises';
import path from 'node:path';
import * as Rx from 'rxjs';
import {
  adminPrivateState,
  createRequest,
  deployStateProof,
  emptyPrivateState,
  joinStateProof,
  pureCircuits,
  readLedger,
  registerIssuer,
  registerSchema,
  rotateIssuerEpoch,
} from '@stateproof/contract';
import {
  SCHEMAS,

  fromHex32,
  getSchema,
  issuerKeyPairFromHex,
  labelToBytes32,
  publicKeyFromJson,
  schemaIdBytes,
  schemaRule,
  sealSubject,
  toHex,
} from '@stateproof/core';
import { findIssuer, issuerSecretHex, loadRegistry, saveRegistry, updateIssuer } from '@stateproof/issuer';
import { REPO_ROOT, requireEnv } from './config.js';
import { careerOpenPolicy, youthWorkPolicy } from './demo-policies.js';
import { findPersona, loadDemoPersonas, personaCredential, personaSecret, proofInputsFor, submitProofTx } from './holder.js';
import { compilerVersion, nowSeconds, requireDeployment, writeDeployment, type Session } from './session.js';

const SECONDS_PER_DAY = 86_400n;
// createRequest refuses a reference time ahead of the chain clock; stay a little behind it.
export const REFERENCE_LAG_SECONDS = 60n;

const adminSecret = (): Uint8Array => fromHex32(requireEnv('STATEPROOF_ADMIN_SECRET'));

export const deploy = async ({ config, logger, providers, wallet }: Session): Promise<void> => {
  const started = Date.now();
  const { address, receipt } = await wallet.runTx('deploy', () => deployStateProof(providers, adminSecret()));
  logger.info(`Deployed StateProof v2 at ${address} (tx ${receipt.txId}, block ${receipt.blockHeight}) in ${Math.round((Date.now() - started) / 1000)}s`);
  await writeDeployment(config.networkName, {
    contractVersion: 'v2',
    contractAddress: address,
    deployedAt: new Date().toISOString(),
    deployTxId: receipt.txId,
    deployTxHash: receipt.txHash,
    blockHeight: receipt.blockHeight,
    compiler: await compilerVersion(),
  });
  logger.info(`Recorded in config/deployments.json under "${config.networkName}"`);
};

export const registerSchemas = async ({ config, logger, providers, wallet }: Session): Promise<void> => {
  const { contractAddress } = await requireDeployment(config.networkName);
  const admin = await joinStateProof(providers, contractAddress, adminPrivateState(adminSecret()));
  for (const schema of SCHEMAS) {
    const id = schemaIdBytes(schema);
    if ((await readLedger(providers.publicDataProvider, contractAddress)).schemaRules.member(id)) {
      logger.info(`schema ${schema.id} already registered`);
      continue;
    }
    const receipt = await wallet.runTx(`registerSchema ${schema.id}`, () => registerSchema(admin, id, schemaRule(schema)));
    logger.info(`Registered schema ${schema.id} (tx ${receipt.txId}, block ${receipt.blockHeight})`);
  }
};

export const registerIssuers = async ({ config, logger, providers, wallet }: Session): Promise<void> => {
  const { contractAddress } = await requireDeployment(config.networkName);
  const admin = await joinStateProof(providers, contractAddress, adminPrivateState(adminSecret()));
  const registry = await loadRegistry();
  for (const entry of registry.issuers) {
    if (entry.publicKey === null) throw new Error(`${entry.id} has no public key; run the issuer keygen first`);
    const id = labelToBytes32(entry.id);
    const key = publicKeyFromJson(entry.publicKey);
    const ledger = await readLedger(providers.publicDataProvider, contractAddress);
    if (ledger.issuers.member(id)) {
      const onChain = ledger.issuers.lookup(id);
      if (onChain.publicKey.x !== key.x || onChain.publicKey.y !== key.y) {
        throw new Error(`${entry.id} is registered with a different key; a registration cannot be changed (use a new issuer id)`);
      }
      logger.info(`${entry.id} already registered (slot ${onChain.slot}, epoch ${onChain.epoch})`);
      continue;
    }
    const receipt = await wallet.runTx(`registerIssuer ${entry.id}`, () =>
      registerIssuer(admin, id, schemaIdBytes(getSchema(entry.schema)), key, BigInt(entry.slot)),
    );
    logger.info(`Registered ${entry.id} for ${entry.schema} in slot ${entry.slot} (tx ${receipt.txId}, block ${receipt.blockHeight})`);
  }
};

export const DEMO_REQUESTS_FILE = path.join(REPO_ROOT, 'config', 'demo-requests.v2.json');

interface DemoRequestRecord {
  readonly kind: 'career-open' | 'youth-work-open' | 'career-sealed';
  readonly schema: string;
  readonly requestId: string;
  readonly txId: string;
  readonly blockHeight: number;
  readonly referenceTime: string;
  readonly expiresAt: string;
  readonly sealedFor?: string;
  // Demo only: in real use the nonce travels only inside the private link sent to the applicant.
  readonly sealNonce?: string;
}

const readDemoRequests = async (): Promise<Record<string, unknown>> => {
  try {
    return JSON.parse(await readFile(DEMO_REQUESTS_FILE, 'utf8')) as Record<string, unknown>;
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === 'ENOENT') return {};
    throw e;
  }
};

export const demoRequests = async ({ config, logger, providers, wallet }: Session, options: { ttlDays: number; sealedFor: string }): Promise<void> => {
  const { contractAddress } = await requireDeployment(config.networkName);
  const contract = await joinStateProof(providers, contractAddress, emptyPrivateState());
  const personas = await loadDemoPersonas();
  const target = findPersona(personas, options.sealedFor);
  const ttl = BigInt(options.ttlDays) * SECONDS_PER_DAY;
  const records: DemoRequestRecord[] = [];
  const create = async (kind: DemoRequestRecord['kind'], schema: string, policy: ReturnType<typeof careerOpenPolicy>, seal?: { commitment: bigint; nonce: Uint8Array }) => {
    const requestId = crypto.getRandomValues(new Uint8Array(32));
    const reference = nowSeconds() - REFERENCE_LAG_SECONDS;
    const expiresAt = reference + ttl;
    const receipt = await wallet.runTx(`createRequest ${kind}`, () =>
      createRequest(contract, requestId, policy, schemaRule(getSchema(schema)), reference, expiresAt, seal ? { is_some: true, value: seal.commitment } : undefined),
    );
    records.push({
      kind,
      schema,
      requestId: toHex(requestId),
      txId: receipt.txId,
      blockHeight: receipt.blockHeight,
      referenceTime: new Date(Number(reference) * 1000).toISOString(),
      expiresAt: new Date(Number(expiresAt) * 1000).toISOString(),
      ...(seal ? { sealedFor: target.id, sealNonce: toHex(seal.nonce) } : {}),
    });
    logger.info(`${kind}: request ${toHex(requestId)} (tx ${receipt.txId}, block ${receipt.blockHeight})`);
  };
  await create('career-open', 'career', careerOpenPolicy());
  await create('youth-work-open', 'youth-work', youthWorkPolicy(nowSeconds() - REFERENCE_LAG_SECONDS));
  await create('career-sealed', 'career', careerOpenPolicy(), await sealSubject(target.name, target.birthDate));
  const all = await readDemoRequests();
  await writeFile(
    DEMO_REQUESTS_FILE,
    `${JSON.stringify(
      {
        ...all,
        $comment: 'JobProof v2 demo postings created by `npm run cli -- demo-requests`. DEMO ONLY: sealNonce would normally travel only in the private link to the named applicant.',
        demoOnly: true,
        [config.networkName]: { contractAddress, createdAt: new Date().toISOString(), requests: records },
      },
      null,
      2,
    )}\n`,
    'utf8',
  );
  logger.info(`Recorded ${records.length} requests in config/demo-requests.v2.json`);
};

export const prove = async (
  { config, logger, providers, proving, wallet }: Session,
  options: { request: string; persona: string; schema: string; nonce?: string },
): Promise<void> => {
  const { contractAddress } = await requireDeployment(config.networkName);
  const contract = await joinStateProof(providers, contractAddress, emptyPrivateState());
  const persona = findPersona(await loadDemoPersonas(), options.persona);
  const requestId = fromHex32(options.request);
  const ledger = await readLedger(providers.publicDataProvider, contractAddress);
  const inputs = proofInputsFor(personaCredential(persona, options.schema), personaSecret(persona), ledger, options.nonce ? fromHex32(options.nonce) : undefined);
  const started = Date.now();
  const { receipt, pseudonym } = await wallet.runTx('submitProof', () => submitProofTx(providers, contract, requestId, inputs));
  logger.info(
    `submitProof tx ${receipt.txId} (block ${receipt.blockHeight}): pseudonym ${toHex(pseudonym)}, proving ${proving.lastMs} ms, total ${Date.now() - started} ms`,
  );
  const after = await readLedger(providers.publicDataProvider, contractAddress);
  if (!after.answers.lookup(requestId).member(pseudonym)) throw new Error('The answer is not on the ledger');
  if (toHex(pureCircuits.pseudonymFor(requestId, inputs.holderSecret)) !== toHex(pseudonym)) throw new Error('Pseudonym mismatch');
};

export const rotateEpoch = async ({ config, logger, providers, wallet }: Session, options: { issuer: string }): Promise<void> => {
  const { contractAddress } = await requireDeployment(config.networkName);
  const contract = await joinStateProof(providers, contractAddress, emptyPrivateState());
  const registry = await loadRegistry();
  const entry = findIssuer(registry, options.issuer);
  const keyPair = issuerKeyPairFromHex(issuerSecretHex(entry));
  const id = labelToBytes32(entry.id);
  const receipt = await wallet.runTx(`rotateIssuerEpoch ${entry.id}`, () => rotateIssuerEpoch(providers, contract, id, keyPair.secretScalar));
  const epoch = Number((await readLedger(providers.publicDataProvider, contractAddress)).issuers.lookup(id).epoch);
  await saveRegistry(updateIssuer(registry, entry.id, { epoch }));
  logger.info(`${entry.id} is now at epoch ${epoch} (tx ${receipt.txId}, block ${receipt.blockHeight}); config/issuers.json updated. Re-issue the credentials that are still true.`);
};

export const walletStatus = async ({ logger, wallet }: Session): Promise<Record<string, unknown>> => {
  const state = await Rx.firstValueFrom(wallet.provider.wallet.state());
  const status = {
    unshieldedAddress: String((wallet.provider as unknown as { keystore?: { getBech32Address?: () => unknown } }).keystore?.getBech32Address?.() ?? 'n/a'),
    unshieldedBalances: Object.fromEntries(Object.entries(state.unshielded.balances).map(([k, v]) => [k, String(v)])),
    dustBalance: String(state.dust.balance(new Date())),
    dustCoins: { available: state.dust.availableCoins.length, pending: state.dust.pendingCoins.length, total: state.dust.totalCoins.length },
  };
  logger.info(`status ${JSON.stringify(status)}`);
  return status;
};

