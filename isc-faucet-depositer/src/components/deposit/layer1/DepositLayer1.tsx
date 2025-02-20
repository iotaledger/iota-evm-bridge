// Copyright (c) 2025 IOTA Stiftung
// SPDX-License-Identifier: Apache-2.0

import { useCurrentAccount, useIotaClient, useSignAndExecuteTransaction } from '@iota/dapp-kit';
import { DepositForm } from '../DepositForm';
import toast from 'react-hot-toast';
import { IscTransaction } from 'isc-client';
import { parseAmount } from '../../../lib/utils';
import { IOTA_DECIMALS } from '@iota/iota-sdk/utils';
import { useNetworkVariables } from '../../../networkConfig';
import { useForm } from 'react-hook-form';
import { DepositFormData } from '../../../lib/schema/bridgeForm.schema';
import { useQuery } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';
import { useBalance } from '../../../hooks/useBalance';
import { L1_USER_REJECTED_TX_ERROR_TEXT } from '../../../lib/constants';

function buildTransaction(
    address: string,
    amount: string,
    variables: ReturnType<typeof useNetworkVariables>,
) {
    const GAS_BUDGET = BigInt(10000000);
    const amountToSend = parseAmount(amount, IOTA_DECIMALS) - GAS_BUDGET;

    const iscTx = new IscTransaction(variables.chain);
    const bag = iscTx.newBag();
    iscTx.placeCoinsInBag({ amount: amountToSend, bag });
    iscTx.createAndSend({ bag, address, amount: amountToSend });
    const transaction = iscTx.build();

    return transaction;
}

export function DepositLayer1() {
    const client = useIotaClient();
    const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction();
    const variables = useNetworkVariables();
    const { watch } = useForm<DepositFormData>();
    const account = useCurrentAccount();
    const { depositAmount, receivingAddress } = watch();
    const { data: balance } = useBalance(account?.address || '');

    const { data: transaction } = useQuery({
        queryKey: [depositAmount, receivingAddress, variables.chain],
        queryFn() {
            return buildTransaction(receivingAddress, depositAmount, variables);
        },
    });

    const gasBudget = transaction?.getData().gasData.budget;
    const gasEstimation = gasBudget ? Number(gasBudget) : null;

    const isPayingAllBalance = new BigNumber(depositAmount).isGreaterThan(
        new BigNumber(balance?.totalBalance ?? 0).minus(gasEstimation ?? 0),
    );

    const send = async () => {
        if (!transaction) {
            throw Error('Transaction is missing');
        }
        signAndExecuteTransaction(
            {
                transaction,
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
