import { IOTA_DECIMALS } from '@iota/iota-sdk/utils';
import { parseAmount } from './parseAmount';

export function buildDepositL2Parameters(receiverAddress: string, baseTokensToWithdraw: string) {
    const convertedBaseToken = Number(parseAmount(baseTokensToWithdraw, IOTA_DECIMALS));
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
            // TODO: Magic number, replace with actual gas budget once we have a proper estimation
            gasBudget: 1000000000n,
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
