// Copyright (c) 2025 IOTA Stiftung
// SPDX-License-Identifier: Apache-2.0

import { useCurrentAccount, useIotaClient, useSignAndExecuteTransaction } from '@iota/dapp-kit';
import { DepositForm } from '../DepositForm';
import toast from 'react-hot-toast';

import { L1_USER_REJECTED_TX_ERROR_TEXT } from '../../../lib/constants';
import { useBuildL1DepositTransaction } from '../../../hooks/useBuildL1DepositTransaction';
import { formatIOTAFromNanos } from '../../../lib/utils';
import { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { DepositFormData } from '../../../lib/schema/bridgeForm.schema';
import { L2_FROM_L1_GAS_BUDGET } from 'isc-client';
import { useL2BalanceBaseToken } from '../../../hooks/useL2BalanceBaseToken';

export function DepositLayer1() {
    const client = useIotaClient();
    const { mutateAsync: signAndExecuteTransaction, isPending: isTransactionLoading } =
        useSignAndExecuteTransaction();
    const { watch } = useFormContext<DepositFormData>();
    const { depositAmount, receivingAddress } = watch();

    const address = useCurrentAccount()?.address as string;
    const { data: l1BalanceInL2 } = useL2BalanceBaseToken(address);
    console.log('l1BalanceInL2:', l1BalanceInL2);

    const [gasEstimation, setGasEstimation] = useState<string>(L2_FROM_L1_GAS_BUDGET.toString());

    const { data: transactionData, isPending: isBuildingTransaction } =
        useBuildL1DepositTransaction({
            receivingAddress,
            amount: depositAmount,
            gasEstimation,
        });
    const gasSummary = transactionData?.gasSummary;
    const formattedGasEstimation = gasSummary?.totalGas
        ? formatIOTAFromNanos(BigInt(gasSummary.totalGas))
        : undefined;

    useEffect(() => {
        const gasBudget = transactionData?.gasSummary?.budget;
        if (gasBudget) {
            setGasEstimation(gasBudget);
        }
    }, [transactionData?.gasSummary?.budget, setGasEstimation]);

    const deposit = async () => {
        if (!transactionData?.transaction) {
            throw Error('Transaction is missing');
        }
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
                    if (err.message) {
                        if (err.message.startsWith(L1_USER_REJECTED_TX_ERROR_TEXT)) {
                            toast.error('Transaction rejected by user.');
                        } else {
                            toast.error(err.message);
                        }
                    } else {
                        toast.error('Something went wrong while submitting deposit.');
                    }
                },
            },
        );
    };

    return (
        <DepositForm
            deposit={deposit}
            isGasEstimationLoading={isBuildingTransaction}
            isTransactionLoading={isTransactionLoading}
            gasEstimation={formattedGasEstimation}
        />
    );
}
