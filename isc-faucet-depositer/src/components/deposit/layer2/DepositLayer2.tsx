// Copyright (c) 2024 IOTA Stiftung
// SPDX-License-Identifier: Apache-2.0

import { useAccount, useChainId, usePublicClient, useWriteContract } from 'wagmi';
import { useEffect } from 'react';
import { DepositForm } from '../DepositForm';
import toast from 'react-hot-toast';
import { buildDepositL2Parameters } from '../../../lib/utils';
import { iscAbi, L2_USER_REJECTED_TX_ERROR_TEXT } from '../../../lib/constants';
import { formatGwei } from 'viem';
import { useIsBridgingAllBalance } from '../../../hooks/useIsBridgingAllBalance';
import BigNumber from 'bignumber.js';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useFormContext } from 'react-hook-form';
import { DepositFormData } from '../../../lib/schema/bridgeForm.schema';
import { L2Chain } from '../../../config/l2config';

export function DepositLayer2() {
    const layer2Account = useAccount();
    const client = usePublicClient();
    const chainId = useChainId();
    const iscContractAddress = (layer2Account?.chain as L2Chain)?.iscContractAddress;

    const { watch } = useFormContext<DepositFormData>();
    const { depositAmount, receivingAddress } = watch();
    const isPayingAllBalance = useIsBridgingAllBalance();

    const { data: hash, writeContract, isSuccess, isError, error } = useWriteContract();

    const { data: gasEstimation, isPending: isGasEstimationLoading } = useQuery({
        queryKey: ['l2-deposit-transaction-gas-estimate', receivingAddress, depositAmount],
        async queryFn() {
            if (receivingAddress && depositAmount && iscContractAddress) {
                const params = buildDepositL2Parameters(receivingAddress, depositAmount);
                const gas = await client?.estimateContractGas({
                    address: iscContractAddress,
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
            receivingAddress,
            depositAmount,
            isPayingAllBalance,
            gasEstimation,
        ],
        async mutationFn() {
            if (!receivingAddress || !depositAmount || !iscContractAddress) {
                throw Error('Transaction is missing');
            }
            const depositTotal =
                isPayingAllBalance && gasEstimation
                    ? new BigNumber(depositAmount).minus(gasEstimation).toString()
                    : depositAmount;
            const params = buildDepositL2Parameters(receivingAddress, depositTotal, gasEstimation);
            writeContract({
                abi: iscAbi,
                address: iscContractAddress,
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
