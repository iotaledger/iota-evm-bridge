import { z } from 'zod';
import { parseAmount } from '../utils';
import BigNumber from 'bignumber.js';
import { isAddress } from 'viem';

export function createBridgeFormSchema(totalAccountBalance: bigint, coinDecimals: number) {
    return z
        .object({
            depositAmount: z
                .string()
                .trim()
                .refine(
                    (value) => {
                        return new BigNumber(value).isGreaterThanOrEqualTo(1);
                    },
                    {
                        message: 'Invalid amount',
                    },
                )
                .refine(
                    (value) => {
                        const amount = parseAmount(value, coinDecimals);
                        return amount ? amount <= totalAccountBalance : false;
                    },
                    {
                        message: 'Insufficient balance',
                    },
                ),
            receivingAddress: z
                .string()
                .trim()
                .refine((address) => isAddress(address) as boolean, {
                    message: 'Invalid address',
                }),
        })
        .required();
}

export type DepositFormData = z.infer<ReturnType<typeof createBridgeFormSchema>>;
