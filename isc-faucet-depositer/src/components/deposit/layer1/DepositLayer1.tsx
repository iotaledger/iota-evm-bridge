// Copyright (c) 2025 IOTA Stiftung
// SPDX-License-Identifier: Apache-2.0

import { useCurrentAccount, useIotaClient, useSignAndExecuteTransaction } from '@iota/dapp-kit';
import { DepositForm } from '../DepositForm';
import toast from 'react-hot-toast';
import { useFormContext } from 'react-hook-form';
import { DepositFormData } from '../../../lib/schema/bridgeForm.schema';
import BigNumber from 'bignumber.js';
import { useBalance } from '../../../hooks/useBalance';
import { L1_USER_REJECTED_TX_ERROR_TEXT } from '../../../lib/constants';
import { useBridgeStore } from '../../../lib/stores';
import { useBuildL1DepositTransaction } from '../../../hooks/useBuildL1DepositTransaction';

export function DepositLayer1() {
    const setIsTransactionLoading = useBridgeStore((state) => state.setIsTransactionLoading);
    const client = useIotaClient();
    const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction();
    const { watch } = useFormContext<DepositFormData>();
    const account = useCurrentAccount();
    const { depositAmount, receivingAddress } = watch();
    const { data: balance } = useBalance(account?.address || '');

    const { data: transactionData } = useBuildL1DepositTransaction({
        receivingAddress,
        amount: depositAmount,
    });
    const gasBudget = transactionData?.gasSummary?.totalGas;
    const gasEstimation = gasBudget ? Number(gasBudget) : null;

    const isPayingAllBalance = new BigNumber(depositAmount).isGreaterThan(
        new BigNumber(balance?.totalBalance ?? 0).minus(gasEstimation ?? 0),
    );

    const send = async () => {
        if (!transactionData?.transaction) {
            throw Error('Transaction is missing');
        }
        setIsTransactionLoading(true);
        await signAndExecuteTransaction(
            {
                transaction: transactionData.transaction,
                options: {
                    showEffects: true,
                    showEvents: true,
                    showObjectChanges: true,
                },
            },
            {
                onSuccess: (tx) => {
                    toast('Deposit submitted!');
                    client
                        .waitForTransaction({
                            digest: tx.digest,
                        })
                        .catch((err) => {
                            if (import.meta.env.DEV) {
                                console.error('Error while waiting for transaction', err.message);
                            }
                        });
                },
                onError: (err) => {
                    if (import.meta.env.DEV) {
                        console.error('Failed submitting transaction:', err.message);
                    }

                    if (err.message.startsWith(L1_USER_REJECTED_TX_ERROR_TEXT)) {
                        toast.error('Transaction rejected by user.');
                    } else {
                        toast.error('Something went wrong while submitting deposit.');
                    }
                },
                onSettled: () => {
                    setIsTransactionLoading(false);
                },
            },
        );
    };

    return (
        <DepositForm
            send={send}
            gasEstimation={gasEstimation}
            isPayingAllBalance={isPayingAllBalance}
        />
    );
}
