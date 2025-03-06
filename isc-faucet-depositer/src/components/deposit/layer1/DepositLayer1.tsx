// Copyright (c) 2025 IOTA Stiftung
// SPDX-License-Identifier: Apache-2.0

import { useCurrentAccount, useIotaClient, useSignAndExecuteTransaction } from '@iota/dapp-kit';
import { DepositForm } from '../DepositForm';
import toast from 'react-hot-toast';
import { IscTransaction } from 'isc-client';
import { parseAmount, withdrawParameters } from '../../../lib/utils';
import { IOTA_DECIMALS } from '@iota/iota-sdk/utils';
import { useNetworkVariables } from '../../../networkConfig';
import { useFormContext } from 'react-hook-form';
import { DepositFormData } from '../../../lib/schema/bridgeForm.schema';
import { useQuery } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';
import { useBalance } from '../../../hooks/useBalance';
import { iscAbi, iscContractAddress, L1_USER_REJECTED_TX_ERROR_TEXT } from '../../../lib/constants';
import { IotaClient } from '@iota/iota-sdk/client';
import { useReadContract, useWriteContract } from 'wagmi';

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

    const { writeContract } = useWriteContract();

    // test: read send function from contract
    const params = withdrawParameters(
        account?.address ?? '0xadafe7af204550ab15d0e080a3af2212e697074c74698e70c3a9351606ef3d64',
        Number(depositAmount),
    );
    const contract = useReadContract({
        abi: iscAbi,
        address: iscContractAddress,
        functionName: 'send',
        args: params,
    });
    console.log('contract send', contract);
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
    const withdraw = async () => {
        if (!account?.address) {
            throw Error('Transaction is missing');
        }
        console.log('withdraw');
        const address = account?.address;
        const params = await withdrawParameters(address, Number(depositAmount));

        writeContract({
            abi: iscAbi,
            address: iscContractAddress,
            functionName: 'send',
            args: params,
        });
    };

    return (
        <DepositForm
            send={send}
            withdraw={withdraw}
            gasEstimation={gasEstimation}
            isPayingAllBalance={isPayingAllBalance}
        />
    );
}
