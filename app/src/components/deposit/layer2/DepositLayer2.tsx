// Copyright (c) 2024 IOTA Stiftung
// SPDX-License-Identifier: Apache-2.0

import {
    useAccount,
    useChainId,
    usePublicClient,
    useWaitForTransactionReceipt,
    useWriteContract,
} from 'wagmi';
import { useEffect } from 'react';
import { DepositForm } from '../DepositForm';
import toast from 'react-hot-toast';
import { buildDepositL2Parameters } from '../../../lib/utils';
import { iscAbi, L2_USER_REJECTED_TX_ERROR_TEXT } from '../../../lib/constants';
import { useIsBridgingAllBalance } from '../../../hooks/useIsBridgingAllBalance';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useFormContext } from 'react-hook-form';
import { DepositFormData } from '../../../lib/schema/bridgeForm.schema';
import { L2Chain } from '../../../config';
import { getBalanceQueryKey } from 'wagmi/query';
import { formatGwei } from 'viem';

export function DepositLayer2() {
    const queryClient = useQueryClient();
    const layer2Account = useAccount();
    const client = usePublicClient();
    const chainId = useChainId();
    const iscContractAddress = (layer2Account?.chain as L2Chain)?.iscContractAddress;

    const { watch } = useFormContext<DepositFormData>();
    const { depositAmount, receivingAddress } = watch();
    const isPayingAllBalance = useIsBridgingAllBalance();

    const { data: hash, writeContractAsync, isSuccess, isError, error } = useWriteContract({});
    const {
        isSuccess: isTransactionSuccess,
        isError: isTransactionError,
        error: transactionError,
    } = useWaitForTransactionReceipt({
        hash: hash,
    });

    const { data: gasEstimation, isPending: isGasEstimationLoading } = useQuery({
        queryKey: [
            'l2-deposit-transaction-gas-estimate',
            receivingAddress,
            depositAmount,
            iscContractAddress,
        ],
        async queryFn() {
            if (receivingAddress && depositAmount && iscContractAddress) {
                const params = buildDepositL2Parameters(receivingAddress, depositAmount);
                const gas = await client?.estimateContractGas({
                    address: iscContractAddress,
                    abi: iscAbi,
                    functionName: 'transferToL1',
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

    useEffect(() => {
        if (isTransactionSuccess) {
            const blanceQueryKey = getBalanceQueryKey({
                chainId,
                address: layer2Account.address,
            });
            queryClient.invalidateQueries({ queryKey: blanceQueryKey });
        }
    }, [isTransactionSuccess]);

    useEffect(() => {
        if (isTransactionError && transactionError) {
            if (import.meta.env.DEV) {
                console.error('Error while waiting for transaction', transactionError.message);
            }
            toast.error('Something went wrong with deposit transaction.');
        }
    }, [isTransactionError, transactionError]);

    const { mutate: deposit, isPending: isTransactionLoading } = useMutation({
        mutationKey: [
            'l2-deposit-transaction',
            receivingAddress,
            depositAmount,
            isPayingAllBalance,
            iscContractAddress,
            chainId,
        ],
        async mutationFn() {
            if (!receivingAddress || !depositAmount || !iscContractAddress) {
                throw Error('Transaction is missing');
            }

            const params = buildDepositL2Parameters(receivingAddress, depositAmount);
            await writeContractAsync({
                abi: iscAbi,
                address: iscContractAddress,
                functionName: 'transferToL1',
                args: params,
                chainId,
            });
        },
    });

    return (
        <DepositForm
            deposit={deposit}
            isGasEstimationLoading={isGasEstimationLoading}
            isTransactionLoading={isTransactionLoading}
            gasEstimation={gasEstimation}
        />
    );
}
