// Copyright (c) 2024 IOTA Stiftung
// SPDX-License-Identifier: Apache-2.0

import { useAccount, useChainId, usePublicClient, useWriteContract } from 'wagmi';
import { useEffect } from 'react';
import { DepositForm } from '../DepositForm';
import toast from 'react-hot-toast';
import { withdrawParameters } from '../../../lib/utils';
import { iscAbi, L2_USER_REJECTED_TX_ERROR_TEXT } from '../../../lib/constants';
import { useCurrentAccount } from '@iota/dapp-kit';
import { formatGwei } from 'viem';
import { useIsBridgingAllBalance } from '../../../hooks/useIsBridgingAllBalance';
import BigNumber from 'bignumber.js';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useFormContext } from 'react-hook-form';
import { DepositFormData } from '../../../lib/schema/bridgeForm.schema';
import { useNetworkVariables } from '../../../config/l1config';

export function DepositLayer2() {
    const layer2Account = useAccount();
    const client = usePublicClient();
    const chainId = useChainId();
    const variables = useNetworkVariables();

    const account = useCurrentAccount();
    const address = account?.address;
    const { watch } = useFormContext<DepositFormData>();
    const { depositAmount } = watch();
    const isPayingAllBalance = useIsBridgingAllBalance();

    const { data: hash, writeContract, isSuccess, isError, error } = useWriteContract();

    const { data: gasEstimation, isPending: isGasEstimationLoading } = useQuery({
        queryKey: ['l2-deposit-transaction-gas-estimate', address, depositAmount],
        async queryFn() {
            if (address && depositAmount) {
                const params = withdrawParameters(address, depositAmount);
                const gas = await client?.estimateContractGas({
                    address: variables.iscContractAddress,
                    abi: iscAbi,
                    functionName: 'send',
                    args: params,
                    account: layer2Account.address,
                });
                return gas ? formatGwei(gas) : null;
            }
            return null;
        },
    });

    useEffect(() => {
        if (isSuccess && hash) {
            toast('Deposit submitted!');
        }
    }, [isSuccess, hash]);

    useEffect(() => {
        if (isError && error) {
            if (import.meta.env.DEV) {
                console.error('Failed submitting transaction:', error.message);
            }

            if (error.message.startsWith(L2_USER_REJECTED_TX_ERROR_TEXT)) {
                toast.error('Transaction rejected by user.');
            } else {
                toast.error('Something went wrong while submitting deposit.');
            }
        }
    }, [isError, error]);

    const { mutate: deposit, isPending: isTransactionLoading } = useMutation({
        mutationKey: [
            'l2-deposit-transaction',
            address,
            depositAmount,
            isPayingAllBalance,
            gasEstimation,
        ],
        async mutationFn() {
            if (!address || !depositAmount) {
                throw Error('Transaction is missing');
            }
            const depositTotal =
                isPayingAllBalance && gasEstimation
                    ? new BigNumber(depositAmount).minus(gasEstimation).toString()
                    : depositAmount;
            const params = withdrawParameters(address, depositTotal);
            writeContract({
                abi: iscAbi,
                address: variables.iscContractAddress,
                functionName: 'send',
                args: params,
                chainId: chainId,
            });
        },
    });

    return (
        <DepositForm
            deposit={deposit}
            isTransactionLoading={isTransactionLoading || isGasEstimationLoading}
            gasEstimation={gasEstimation}
        />
    );
}
