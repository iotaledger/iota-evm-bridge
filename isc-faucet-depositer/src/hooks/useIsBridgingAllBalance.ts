import BigNumber from 'bignumber.js';
import { useGetCurrentAvailableBalance } from './useGetCurrentAvailableBalance';
import { useMemo } from 'react';
import { useBridgeStore } from '../lib/stores';
import { useBridgeFormValues } from './useBridgeFormValues';

export function useIsBridgingAllBalance(): boolean | null {
    const { isLoading: isLoadingAccountBalance, formattedAvailableBalance } =
        useGetCurrentAvailableBalance();
    const { depositAmount } = useBridgeFormValues();
    const gasEstimation = useBridgeStore((state) => state.gasEstimation);

    const isAmountValueMaxAmount = useMemo(() => {
        if (isLoadingAccountBalance || !gasEstimation) {
            return null;
        }

        if (!formattedAvailableBalance) {
            return false;
        }

        return new BigNumber(depositAmount).isGreaterThan(
            new BigNumber(formattedAvailableBalance).minus(gasEstimation),
        );
    }, [formattedAvailableBalance, depositAmount, isLoadingAccountBalance, gasEstimation]);

    return isAmountValueMaxAmount;
}
