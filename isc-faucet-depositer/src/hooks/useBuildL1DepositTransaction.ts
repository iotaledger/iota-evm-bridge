import { Transaction } from '@iota/iota-sdk/transactions';
import { useCurrentAccount, useIotaClient } from '@iota/dapp-kit';
import { useQuery } from '@tanstack/react-query';
import { getGasSummary, parseAmount } from '../lib/utils';
import { IOTA_COIN_TYPE, IscTransaction } from 'isc-client';
import { IOTA_DECIMALS } from '@iota/iota-sdk/utils';
import { useNetworkVariables } from '../config/l1config';
import { useIsBridgingAllBalance } from './useIsBridgingAllBalance';

interface BuildL1DepositTransaction {
    receivingAddress: string;
    amount: string;
    gasEstimation?: string;
}

export const GAS_BUDGET = 10000000n;
export const L2_GAS_ESTIMATION = 1000n;

export function useBuildL1DepositTransaction({
    receivingAddress,
    amount,
    gasEstimation,
}: BuildL1DepositTransaction) {
    const currentAccount = useCurrentAccount();
    const client = useIotaClient();
    const variables = useNetworkVariables();
    const senderAddress = currentAccount?.address as string;
    const isBridgingAllBalance = useIsBridgingAllBalance();

    return useQuery({
        queryKey: [
            'l1-deposit-transaction',
            receivingAddress,
            amount,
            senderAddress,
            gasEstimation,
            isBridgingAllBalance,
        ],
        queryFn: async () => {
            const requestedAmount = parseAmount(amount, IOTA_DECIMALS);
            if (!requestedAmount) {
                throw Error('Amount is too high');
            }

            const amountToSend =
                isBridgingAllBalance && gasEstimation
                    ? requestedAmount - BigInt(gasEstimation) - L2_GAS_ESTIMATION
                    : requestedAmount;
            const amountToPlace = amountToSend + L2_GAS_ESTIMATION;

            const iscTx = new IscTransaction(variables.chain);
            const bag = iscTx.newBag();
            const coin = iscTx.coinFromAmount({ amount: amountToPlace });
            iscTx.placeCoinInBag({ coin, bag });
            iscTx.createAndSend({
                bag,
                address: receivingAddress,
                transfers: [[IOTA_COIN_TYPE, amountToSend]],
            });
            const transaction = iscTx.build();
            transaction.setSender(senderAddress);
            const txBytes = await transaction.build({ client });
            const txDryRun = await client.dryRunTransactionBlock({
                transactionBlock: txBytes,
            });
            if (txDryRun.effects.status.status !== 'success') {
                throw Error(`Tx dry run failed: ${txDryRun.effects.status?.error}`);
            }

            return {
                txBytes,
                txDryRun,
            };
        },
        enabled: !!receivingAddress && !!amount && !!senderAddress,
        gcTime: 0,
        select: ({ txBytes, txDryRun }) => {
            return {
                transaction: Transaction.from(txBytes),
                gasSummary: getGasSummary(txDryRun),
            };
        },
    });
}
