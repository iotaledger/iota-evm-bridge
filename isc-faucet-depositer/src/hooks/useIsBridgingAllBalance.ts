import BigNumber from 'bignumber.js';
import { useGetCurrentAvailableBalance } from './useGetCurrentAvailableBalance';
import { useFormContext } from 'react-hook-form';
import { DepositFormData } from '../lib/schema/bridgeForm.schema';

export function useIsBridgingAllBalance(): boolean | null {
    const { formattedAvailableBalance } = useGetCurrentAvailableBalance();
    const { watch } = useFormContext<DepositFormData>();
    const { depositAmount } = watch();

    if (!formattedAvailableBalance) {
        return false;
    }

    return new BigNumber(depositAmount).isEqualTo(new BigNumber(formattedAvailableBalance));
}
