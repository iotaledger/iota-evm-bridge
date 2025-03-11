import { useFormContext, useWatch } from 'react-hook-form';
import { DepositFormData } from '../lib/schema/bridgeForm.schema';

export function useBridgeFormValues() {
    const { getValues } = useFormContext<DepositFormData>();
    return {
        ...useWatch(),
        ...getValues(),
    };
}
