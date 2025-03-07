// Copyright (c) 2024 IOTA Stiftung
// SPDX-License-Identifier: Apache-2.0

import { useWriteContract } from 'wagmi';
import { useEffect } from 'react';
import { DepositForm } from '../DepositForm';
import toast from 'react-hot-toast';
import { useBridgeStore } from '../../../lib/stores';
import { withdrawParameters } from '../../../lib/utils';
import { iscAbi, iscContractAddress, L2_USER_REJECTED_TX_ERROR_TEXT } from '../../../lib/constants';
import { useFormContext } from 'react-hook-form';
import { DepositFormData } from '../../../lib/schema/bridgeForm.schema';
import { useCurrentAccount } from '@iota/dapp-kit';

export function DepositLayer2() {
    const setIsTransactionLoading = useBridgeStore((state) => state.setIsTransactionLoading);
    const account = useCurrentAccount();
    const { watch } = useFormContext<DepositFormData>();
    const { depositAmount } = watch();

    const {
        data: hash,
        writeContract,
        isSuccess,
        isError,
        error,
    } = useWriteContract({
        mutation: {
            onError: (a, b) => {
                console.log('ERROR', a, b);
            },
        },
    });

    const GAS_BUDGET = BigInt(10000000);
    const gasBudget = GAS_BUDGET;
    const gasEstimation = gasBudget ? Number(gasBudget) : null;
    const isPayingAllBalance = false;

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

    const send = async () => {
        if (!account?.address) {
            throw Error('Transaction is missing');
        }
        setIsTransactionLoading(true);
        const params = await withdrawParameters(account.address, Number(depositAmount));

        console.log(params);

        writeContract({
            abi: iscAbi,
            address: iscContractAddress,
            functionName: 'send',
            args: params,
            // Added during testing, remove or change to your liking
            maxFeePerGas: 9999999n,
            chainId: 1074,
        });
    };

    return (
        <DepositForm
            send={send}
            gasEstimation={gasEstimation}
            isPayingAllBalance={isPayingAllBalance}
        />
    );
}
