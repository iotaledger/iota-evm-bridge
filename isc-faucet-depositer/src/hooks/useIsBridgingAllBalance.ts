import BigNumber from 'bignumber.js';
import { useGetCurrentAvailableBalance } from './useGetCurrentAvailableBalance';
import { useBridgeFormValues } from './useBridgeFormValues';

export function useIsBridgingAllBalance(gasEstimation?: string): boolean | null {
    const { isLoading: isLoadingAccountBalance, formattedAvailableBalance } =
        useGetCurrentAvailableBalance();
    const { depositAmount } = useBridgeFormValues();

    if (isLoadingAccountBalance || !gasEstimation) {
        return null;
    }

    if (!formattedAvailableBalance) {
        return false;
    }

    return new BigNumber(depositAmount).isGreaterThan(
        new BigNumber(formattedAvailableBalance).minus(gasEstimation),
    );
}
