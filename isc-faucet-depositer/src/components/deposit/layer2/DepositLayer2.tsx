// Copyright (c) 2024 IOTA Stiftung
// SPDX-License-Identifier: Apache-2.0

import { useAccount, useChainId, useGasPrice, usePublicClient, useWriteContract } from 'wagmi';
import { useEffect } from 'react';
import { DepositForm } from '../DepositForm';
import toast from 'react-hot-toast';
import { useBridgeStore } from '../../../lib/stores';
import { withdrawParameters } from '../../../lib/utils';
import { iscAbi, iscContractAddress, L2_USER_REJECTED_TX_ERROR_TEXT } from '../../../lib/constants';
import { useCurrentAccount } from '@iota/dapp-kit';
import { formatEther } from 'viem';
import { useBridgeFormValues } from '../../../hooks/useBridgeFormValues';

export function DepositLayer2() {
    const setIsTransactionLoading = useBridgeStore((state) => state.setIsTransactionLoading);
    const setGasEstimation = useBridgeStore((state) => state.setGasEstimation);
    const layer2Account = useAccount();
    const client = usePublicClient();
    const chainId = useChainId();
    const gasPrice = useGasPrice();

    const account = useCurrentAccount();
    const address = account?.address;
    const { depositAmount } = useBridgeFormValues();

    const { data: hash, writeContract, isSuccess, isError, error } = useWriteContract();

    useEffect(() => {
        estimateL2DepositTransactionGas();
    }, [address, depositAmount]);

    useEffect(() => {
        if (isSuccess && hash) {
            setIsTransactionLoading(false);
            toast('Deposit submitted!');
        }
    }, [isSuccess, hash, setIsTransactionLoading]);

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

            setIsTransactionLoading(false);
        }
    }, [isError, error, setIsTransactionLoading]);

    const estimateL2DepositTransactionGas = async () => {
        if (address && depositAmount) {
            const params = withdrawParameters(address, depositAmount);
            const gas = await client?.estimateContractGas({
                address: iscContractAddress,
                abi: iscAbi,
                functionName: 'send',
                args: params,
                account: layer2Account.address,
            });
            if (gas && gasPrice.data) {
                setGasEstimation(formatEther(gas * gasPrice.data));
            }
        } else {
            setGasEstimation(null);
        }
    };

    const deposit = async () => {
        if (!address || !depositAmount) {
            throw Error('Transaction is missing');
        }
        setIsTransactionLoading(true);
        const params = withdrawParameters(address, depositAmount);

        writeContract({
            abi: iscAbi,
            address: iscContractAddress,
            functionName: 'send',
            args: params,
            // Added during testing, remove or change to your liking
            maxFeePerGas: 9999999n,
            chainId: chainId,
        });
    };

    return <DepositForm deposit={deposit} />;
}
