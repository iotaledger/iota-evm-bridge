// Copyright (c) 2025 IOTA Stiftung
// SPDX-License-Identifier: Apache-2.0

import { useIotaClient, useSignAndExecuteTransaction } from '@iota/dapp-kit';
import { DepositForm } from '../DepositForm';
import toast from 'react-hot-toast';

import { L1_USER_REJECTED_TX_ERROR_TEXT } from '../../../lib/constants';
import { useBridgeStore } from '../../../lib/stores';
import { useBuildL1DepositTransaction } from '../../../hooks/useBuildL1DepositTransaction';
import { useEffect } from 'react';
import { formatIOTAFromNanos } from '../../../lib/utils';
import { useBridgeFormValues } from '../../../hooks/useBridgeFormValues';

export function DepositLayer1() {
    const setIsTransactionLoading = useBridgeStore((state) => state.setIsTransactionLoading);
    const setGasEstimation = useBridgeStore((state) => state.setGasEstimation);

    const client = useIotaClient();
    const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction();
    const { depositAmount, receivingAddress } = useBridgeFormValues();

    const { data: transactionData } = useBuildL1DepositTransaction({
        receivingAddress,
        amount: depositAmount,
    });

    useEffect(() => {
        if (transactionData?.gasSummary?.totalGas) {
            setGasEstimation(
                formatIOTAFromNanos(BigInt(transactionData.gasSummary.totalGas)) ?? null,
            );
        }
    }, [transactionData, setGasEstimation]);

    const deposit = async () => {
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

    return <DepositForm deposit={deposit} />;
}
