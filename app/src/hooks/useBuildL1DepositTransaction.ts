import { Transaction } from '@iota/iota-sdk/transactions';
import { useCurrentAccount, useIotaClient } from '@iota/dapp-kit';
import { useQuery } from '@tanstack/react-query';
import { getGasSummary, parseAmount } from '../lib/utils';
import { IscTransaction } from 'isc-client';
import { IOTA_TYPE_ARG } from '@iota/iota-sdk/utils';
import { IOTA_DECIMALS } from '@iota/iota-sdk/utils';
import { useNetworkVariables } from '../config';
import { useIsBridgingAllBalance } from './useIsBridgingAllBalance';
import { L2_FROM_L1_GAS_BUDGET } from 'isc-client';

interface BuildL1DepositTransaction {
    receivingAddress: string;
    amount: string;
    gasEstimation?: string;
}

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
                    ? requestedAmount - BigInt(gasEstimation) - L2_FROM_L1_GAS_BUDGET
                    : requestedAmount;
            const amountToPlace = amountToSend + L2_FROM_L1_GAS_BUDGET;

            const iscTx = new IscTransaction(variables.chain);
            const bag = iscTx.newBag();
            const coin = iscTx.coinFromAmount({ amount: amountToPlace });
            iscTx.placeCoinInBag({ coin, bag });
            iscTx.createAndSendToEvm({
                bag,
                transfers: [[IOTA_TYPE_ARG, amountToSend]],
                address: receivingAddress,
                accountsContract: variables.chain.accountsContract,
                accountsFunction: variables.chain.accountsTransferAllowanceTo,
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
        refetchInterval: 2000,
    });
}
