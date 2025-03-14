import BigNumber from 'bignumber.js';
import { useGetCurrentAvailableBalance } from './useGetCurrentAvailableBalance';
import { useBridgeFormValues } from './useBridgeFormValues';

export function useIsBridgingAllBalance(): boolean | null {
    const { formattedAvailableBalance } = useGetCurrentAvailableBalance();
    const { depositAmount } = useBridgeFormValues();

    if (!formattedAvailableBalance) {
        return false;
    }

    return new BigNumber(depositAmount).isEqualTo(new BigNumber(formattedAvailableBalance));
}
