import { IOTA_DECIMALS } from '@iota/iota-sdk/utils';
import { parseAmount } from './parseAmount';
import { L1_GAS_BUDGET } from 'isc-client';
import { parseGwei } from 'viem';

export function buildDepositL2Parameters(
    receiverAddress: string,
    baseTokensToWithdraw: string,
    gasEstimation?: string | null,
) {
    const convertedBaseToken = Number(parseAmount(baseTokensToWithdraw, IOTA_DECIMALS));
    const gasBudget = gasEstimation ? parseGwei(gasEstimation) : L1_GAS_BUDGET;
    const parameters = [
        receiverAddress,
        {
            coins: [
                {
                    coinType: '0x2::iota::IOTA',
                    amount: convertedBaseToken,
                },
                // Put additional native tokens here with the proper coin type and value
            ],
            objects: [
                // Place any objects in here you want to withdraw
            ],
        },
        {
            message: {
                target: {
                    contractHname: 0,
                    entryPoint: 0,
                },
                params: [],
            },
            allowance: {
                coins: [],
                objects: [],
            },
            gasBudget: gasBudget,
        },
        {
            timelock: 0n,
            expiration: {
                time: 0,
                // TODO: Change to undefined once the ABI gets updated to new version
                returnAddress: '0x0000000000000000000000000000000000000000000000000000000000000000',
            },
        },
    ];

    return parameters;
}
