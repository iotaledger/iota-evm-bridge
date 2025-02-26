// Copyright (c) 2025 IOTA Stiftung
// SPDX-License-Identifier: Apache-2.0

import { useCurrentAccount, useIotaClient, useSignAndExecuteTransaction } from '@iota/dapp-kit';
import { DepositForm } from '../DepositForm';
import toast from 'react-hot-toast';
import { IscTransaction } from 'isc-client';
import { parseAmount } from '../../../lib/utils';
import { IOTA_DECIMALS } from '@iota/iota-sdk/utils';
import { useNetworkVariables } from '../../../networkConfig';
import { useFormContext } from 'react-hook-form';
import { DepositFormData } from '../../../lib/schema/bridgeForm.schema';
import { useQuery } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';
import { useBalance } from '../../../hooks/useBalance';
import { L1_USER_REJECTED_TX_ERROR_TEXT } from '../../../lib/constants';
import { IotaClient } from '@iota/iota-sdk/client';

async function buildTransaction(
    senderAddress: string,
    recipientAddress: string,
    amount: string,
    variables: ReturnType<typeof useNetworkVariables>,
    client: IotaClient,
) {
    const GAS_BUDGET = BigInt(10000000);
    const requestedAmount = parseAmount(amount, IOTA_DECIMALS);
    if (!requestedAmount) {
        throw Error('Amount is too high');
    }
    const amountToSend = requestedAmount - GAS_BUDGET;

    const iscTx = new IscTransaction(variables.chain);
    const bag = iscTx.newBag();
    iscTx.placeCoinsInBag({ amount: amountToSend, bag });
    iscTx.createAndSend({ bag, address: recipientAddress, amount: amountToSend });
    const transaction = iscTx.build();

    transaction.setSender(senderAddress);
    await transaction.build({ client });

    return transaction;
}

export function DepositLayer1() {
    const client = useIotaClient();
    const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction();
    const variables = useNetworkVariables();
    const { watch } = useFormContext<DepositFormData>();
    const account = useCurrentAccount();
    const { depositAmount, receivingAddress } = watch();
    const { data: balance } = useBalance(account?.address || '');

    const { data: transaction } = useQuery({
        queryKey: [account?.address, depositAmount, receivingAddress, variables.chain],
        async queryFn() {
            if (!account?.address) {
                throw Error('Missing sender address');
            }
            return await buildTransaction(
                account?.address,
                receivingAddress,
                depositAmount,
                variables,
                client,
            );
        },
        enabled: !!client && !!account?.address,
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
        await signAndExecuteTransaction(
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
