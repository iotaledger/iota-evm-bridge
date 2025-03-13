import { Transaction } from '@iota/iota-sdk/transactions';
import { useCurrentAccount, useIotaClient } from '@iota/dapp-kit';
import { useQuery } from '@tanstack/react-query';
import { getGasSummary, parseAmount } from '../lib/utils';
import { IscTransaction } from 'isc-client';
import { IOTA_DECIMALS } from '@iota/iota-sdk/utils';
import { useNetworkVariables } from '../config/l1config';
import { useIsBridgingAllBalance } from './useIsBridgingAllBalance';
import { useBridgeStore } from '../lib/stores';

interface BuildL1DepositTransaction {
    receivingAddress: string;
    amount: string;
}
const GAS_BUDGET = 10000000n;

export function useBuildL1DepositTransaction({
    receivingAddress,
    amount,
}: BuildL1DepositTransaction) {
    const currentAccount = useCurrentAccount();
    const client = useIotaClient();
    const variables = useNetworkVariables();
    const senderAddress = currentAccount?.address as string;
    const isBridgingAllBalance = useIsBridgingAllBalance();
    const gasEstimation = useBridgeStore((state) => state.gasEstimation);

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
            const gasFormated = gasEstimation
                ? parseAmount(gasEstimation, IOTA_DECIMALS)
                : GAS_BUDGET;
            const amountToSend =
                isBridgingAllBalance && gasFormated
                    ? requestedAmount - gasFormated
                    : requestedAmount;

            const iscTx = new IscTransaction(variables.chain);
            const bag = iscTx.newBag();
            iscTx.placeCoinsInBag({ amount: amountToSend, bag });
            iscTx.createAndSend({ bag, address: receivingAddress, amount: amountToSend });
            const transaction = iscTx.build();

            transaction.setSender(senderAddress);
            const txBytes = await transaction.build({ client });
            const txDryRun = await client.dryRunTransactionBlock({
                transactionBlock: txBytes,
            });
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
