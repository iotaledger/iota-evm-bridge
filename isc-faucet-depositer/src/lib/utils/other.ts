import { bcs } from '@iota/iota-sdk/bcs';
import { IscAgentID, IscAssets } from 'isc-client';

export const shortenHash = (txHash: string) => {
    return `${txHash.slice(0, 6)}...${txHash.slice(-4)}`;
};

export function withdrawParameters(
    receiverAddress: string,
    baseTokensToWithdraw: number,
    // nativeTokens?: CoinStruct[],
    // nftID?: string,
) {
    // You need to decide for yourself if you want to use the lowest base token value like we did in the past evm-toolkit back then (1i instead of 1Mi)
    // Or if you want to use 1Mi equivalent. Then you have to multiply instead of divide.

    // This works for now based on the number in the text field. 1 IOTA in the field == 1 IOTA out to L1
    const convertedBaseToken = BigInt(baseTokensToWithdraw) * 10n ** 9n;

    // Use this if you use the lowest possible coin value (like 1i)
    // const convertedBaseToken = (BigInt(baseTokensToWithdraw) / (10n**9n));

    // The decmials were lowered from 12 to 9
    // I think that should do it.

    const parameters = [
        // No need to bcs serialize anything, it can take the address as is
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
            // Magic number, experiment with it. Maybe try setting it to 0 too and see what happens.
            gasBudget: 1000000000n,
        },
        {
            timelock: 0n,
            expiration: {
                time: 0,
                // This is bad, it should be possible to make it undefined instead of passing a zero'd address.
                // That's an ABI issue I guess. Keep it like this for now.
                returnAddress: '0x0000000000000000000000000000000000000000000000000000000000000000',
            },
        },
    ];

    return parameters;
}

export function withdrawParametersTest(address: string, amount: number) {
    // Define the assets object
    const coinsArray = [
        {
            coinType: '0x2::iota::IOTA',
            amount: amount,
        },
    ];

    // Convert the coins array to a Map
    const coinsMap = new Map<string, string | number | bigint>();
    coinsArray.forEach((coin) => {
        coinsMap.set(coin.coinType, coin.amount);
    });

    const assets = {
        coins: coinsMap,
    };

    // Serialize the assets object
    const serializedAssets = IscAssets.serialize(assets);

    // Define the metadata object
    const metadata = {
        message: {
            target: {
                contractHname: 0,
                entryPoint: 0,
            },
            params: [],
        },
        allowance: {
            coins: [],
            objects: [], // Empty array of type bytes32[]
        },
        gasBudget: 0, // Set appropriate gas budget
    };

    // Serialize the metadata object
    // const serializedMetadata = ISCSendMetadata.serialize(metadata);
    // const address = bcs.Address.serialize(addy).toBytes();
    const agentID = IscAgentID.serialize({
        AddressAgentID: {
            a: bcs.fixedArray(32, bcs.u8()).fromHex(address),
        },
    }).toBytes();

    const parameters = [
        {
            // Receiver
            targetAddress: agentID,
        },
        {
            assets: serializedAssets,
        },
        {
            metadata: metadata,
        },
        {
            sendOptions: {
                timelock: 0, // Set appropriate timelock
                expiration: {
                    time: 0, // Set appropriate expiration time
                    returnAddress: { data: [] },
                },
            },
        },
    ];

    return parameters;
}
