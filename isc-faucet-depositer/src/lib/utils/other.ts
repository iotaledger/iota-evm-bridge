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
    const agentID = IscAgentID.serialize({
        AddressAgentID: {
            a: bcs.fixedArray(32, bcs.u8()).fromHex(receiverAddress),
        },
    }).toBytes();
    const parameters = [
        {
            // Receiver
            data: agentID,
        },
        {
            // Fungible Tokens
            // convert to 6 decimals as ISCMagic contract's send() function accepts only uint64
            baseTokens: [{ '0x2::iota::IOTA': parseInt(String(baseTokensToWithdraw / 10 ** 12)) }], // baseTokensToWithdraw,
            nativeTokens: [],
            nfts: [],
        },
        {
            // Metadata
            targetContract: 0,
            entrypoint: 0,
            gasBudget: 0,
            params: {
                items: [],
            },
            allowance: {
                baseTokens: 0,
                nativeTokens: [],
                nfts: [],
            },
        },
        {
            // Options
            timelock: 0,
            expiration: {
                time: 0,
                returnAddress: {
                    data: [],
                },
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
