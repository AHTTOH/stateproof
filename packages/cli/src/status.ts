// Operator wallet status: NIGHT balance, DUST balance and DUST coins (available / pending).
//   npm run status -w @stateproof/cli
import * as Rx from 'rxjs';
import { exitOnError, isMain, runSession, type Session } from './session.js';

export interface WalletStatus {
  readonly unshieldedBalances: Record<string, string>;
  readonly dustBalance: string;
  readonly dustCoins: { readonly available: number; readonly pending: number; readonly total: number };
}

export const walletStatus = async ({ logger, wallet }: Session): Promise<WalletStatus> => {
  const state = await Rx.firstValueFrom(wallet.provider.wallet.state());
  const status: WalletStatus = {
    unshieldedBalances: Object.fromEntries(Object.entries(state.unshielded.balances).map(([k, v]) => [k, String(v)])),
    dustBalance: String(state.dust.balance(new Date())),
    dustCoins: {
      available: state.dust.availableCoins.length,
      pending: state.dust.pendingCoins.length,
      total: state.dust.totalCoins.length,
    },
  };
  logger.info(`status ${JSON.stringify(status)}`);
  return status;
};

if (isMain(import.meta.url)) exitOnError(runSession('status', async (s) => void (await walletStatus(s))));
