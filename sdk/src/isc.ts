import { Transaction, TransactionObjectArgument } from '@iota/iota-sdk/transactions';
import { ChainData } from './types';
import { bcs } from '@iota/iota-sdk/bcs';
import { IscAgentID } from './bcs';

export function newBag(tx: Transaction, { packageId }: ChainData): TransactionObjectArgument {
    // Create a new empty AssetsBag. It will be used to attach coin/objects to the request
    const assetsBag = tx.moveCall({
        target: `${packageId}::assets_bag::new`,
        arguments: [],
    });

    return assetsBag;
}

export function coinFromAmount(tx: Transaction, amount: bigint): TransactionObjectArgument {
    // Split the senders Gas coin so we have a coin to transfer
    const [splitCoin] = tx.splitCoins(tx.gas, [tx.pure(bcs.U64.serialize(amount))]);

    return splitCoin;
}

export function placeCoinInBag(
    tx: Transaction,
    { packageId }: ChainData,
    assetsBag: TransactionObjectArgument,
    coinType: string,
    coin: TransactionObjectArgument,
) {
    tx.moveCall({
        target: `${packageId}::assets_bag::place_coin`,
        typeArguments: [coinType],
        arguments: [assetsBag, coin],
    });
}

export function agentIdForEVM(address: string): Uint8Array {
    const agentID = IscAgentID.serialize({
        EthereumAddressAgentID: {
            eth: bcs.fixedArray(20, bcs.u8()).fromHex(address),
        },
    });

    return agentID.toBytes();
}

export function createAndSendRequest(
    tx: Transaction,
    { packageId, chainId }: ChainData,
    contract: number,
    contractFunction: number, 
    assetsBag: TransactionObjectArgument,
    transfers: Array<[string, number | bigint]>,
    gasBudget: number | bigint,
    args: Uint8Array[],
) {
    // Execute requests::create_and_send_request.
    // This creates the Request Move object and sends it to the Anchor object of the Chain (ChainID == Anchor Object ID)
    tx.moveCall({
        target: `${packageId}::request::create_and_send_request`,
        arguments: [
            tx.pure(bcs.Address.serialize(chainId)),
            tx.object(assetsBag),
            tx.pure(bcs.U32.serialize(contract)),
            tx.pure(bcs.U32.serialize(contractFunction)),
            tx.pure(bcs.vector(bcs.vector(bcs.u8())).serialize(args)),
            tx.pure(bcs.vector(bcs.string()).serialize(transfers.map((transfer) => transfer[0]))),
            tx.pure(bcs.vector(bcs.u64()).serialize(transfers.map((transfer) => transfer[1]))),
            tx.pure(bcs.U64.serialize(gasBudget)),
        ],
    });
}

export function takeCoinBalanceFromBag(
    tx: Transaction,
    { packageId }: ChainData,
    assetsBag: TransactionObjectArgument,
    coinType: string,
    amount: number | bigint,
): TransactionObjectArgument {
    return tx.moveCall({
        target: `${packageId}::assets_bag::take_coin_balance`,
        typeArguments: [coinType],
        arguments: [assetsBag, tx.pure(bcs.U64.serialize(amount))],
    });
}

export function takeAllCoinBalanceFromBag(
    tx: Transaction,
    { packageId }: ChainData,
    assetsBag: TransactionObjectArgument,
    coinType: string,
): TransactionObjectArgument {
    return tx.moveCall({
        target: `${packageId}::assets_bag::take_all_coin_balance`,
        typeArguments: [coinType],
        arguments: [assetsBag],
    });
}

export function placeCoinBalanceInBag(
    tx: Transaction,
    { packageId }: ChainData,
    assetsBag: TransactionObjectArgument,
    coinType: string,
    balance: TransactionObjectArgument,
) {
    tx.moveCall({
        target: `${packageId}::assets_bag::place_coin_balance`,
        typeArguments: [coinType],
        arguments: [assetsBag, balance],
    });
}

export function placeAssetInBag(
    tx: Transaction,
    { packageId }: ChainData,
    assetsBag: TransactionObjectArgument,
    assetType: string,
    asset: TransactionObjectArgument,
) {
    tx.moveCall({
        target: `${packageId}::assets_bag::place_asset`,
        typeArguments: [assetType],
        arguments: [assetsBag, asset],
    });
}

export function takeAssetFromBag(
    tx: Transaction,
    { packageId }: ChainData,
    assetsBag: TransactionObjectArgument,
    assetType: string,
    asset: TransactionObjectArgument,
) {
    return tx.moveCall({
        target: `${packageId}::assets_bag::take_asset`,
        typeArguments: [assetType],
        arguments: [assetsBag, asset],
    });
}

export function getSizeOfBag(
    tx: Transaction,
    { packageId }: ChainData,
    assetsBag: TransactionObjectArgument,
): TransactionObjectArgument {
    return tx.moveCall({
        target: `${packageId}::assets_bag::get_size`,
        arguments: [assetsBag],
    });
}

export function destroyBag(
    tx: Transaction,
    { packageId }: ChainData,
    assetsBag: TransactionObjectArgument,
): TransactionObjectArgument {
    return tx.moveCall({
        target: `${packageId}::assets_bag::destroy_empty`,
        arguments: [assetsBag],
    });
}

export function startNewChain(
    tx: Transaction,
    { packageId }: ChainData,
    metadata: Uint8Array,
    coin?: TransactionObjectArgument,
): TransactionObjectArgument {
    return tx.moveCall({
        target: `${packageId}::anchor::start_new_chain`,
        arguments: [
            bcs.vector(bcs.u8()).serialize(metadata),
            coin ? coin : bcs.option(bcs.ObjectArg).serialize(null),
        ],
    });
}

export function createAnchorWithAssetBag(
    tx: Transaction,
    { packageId }: ChainData,
    assetsBag: TransactionObjectArgument,
): TransactionObjectArgument {
    return tx.moveCall({
        target: `${packageId}::anchor::create_anchor_with_assets_bag_ref`,
        arguments: [assetsBag],
    });
}

export function updateAnchorStateForMigraton(
    tx: Transaction,
    { packageId }: ChainData,
    anchor: TransactionObjectArgument,
    metadata: Uint8Array,
    stateIndex: number,
): TransactionObjectArgument {
    return tx.moveCall({
        target: `${packageId}::anchor::update_anchor_state_for_migration`,
        arguments: [
            anchor,
            bcs.vector(bcs.u8()).serialize(metadata),
            bcs.u32().serialize(stateIndex),
        ],
    });
}

export function destroyAnchor(
    tx: Transaction,
    { packageId }: ChainData,
    anchor: TransactionObjectArgument,
): TransactionObjectArgument {
    return tx.moveCall({
        target: `${packageId}::anchor::destroy`,
        arguments: [anchor],
    });
}

export function borrowAssets(
    tx: Transaction,
    { packageId }: ChainData,
    anchor: TransactionObjectArgument,
): TransactionObjectArgument {
    return tx.moveCall({
        target: `${packageId}::anchor::borrow_assets`,
        arguments: [anchor],
    });
}

export function returnAssetsFromBorrow(
    tx: Transaction,
    { packageId }: ChainData,
    anchor: TransactionObjectArgument,
    assetsBag: TransactionObjectArgument,
    borrow: TransactionObjectArgument,
): TransactionObjectArgument {
    return tx.moveCall({
        target: `${packageId}::anchor::return_assets_from_borrow`,
        arguments: [anchor, assetsBag, borrow],
    });
}

export function receiveRequest(
    tx: Transaction,
    { packageId }: ChainData,
    anchor: TransactionObjectArgument,
    request: TransactionObjectArgument,
): TransactionObjectArgument {
    return tx.moveCall({
        target: `${packageId}::anchor::receive_request`,
        arguments: [anchor, request],
    });
}

export function transition(
    tx: Transaction,
    { packageId }: ChainData,
    anchor: TransactionObjectArgument,
    newStateMetadata: Uint8Array,
    receipts: TransactionObjectArgument,
): TransactionObjectArgument {
    return tx.moveCall({
        target: `${packageId}::anchor::transition`,
        arguments: [anchor, bcs.vector(bcs.u8()).serialize(newStateMetadata), receipts],
    });
}

export function placeCoinForMigration(
    tx: Transaction,
    { packageId }: ChainData,
    anchor: TransactionObjectArgument,
    coinType: string,
    coin: TransactionObjectArgument,
): TransactionObjectArgument {
    return tx.moveCall({
        target: `${packageId}::anchor::place_coin_for_migration`,
        typeArguments: [coinType],
        arguments: [anchor, coin],
    });
}

export function placeCoinBalanceForMigration(
    tx: Transaction,
    { packageId }: ChainData,
    anchor: TransactionObjectArgument,
    coinType: string,
    balance: TransactionObjectArgument,
): TransactionObjectArgument {
    return tx.moveCall({
        target: `${packageId}::anchor::place_coin_balance_for_migration`,
        typeArguments: [coinType],
        arguments: [anchor, balance],
    });
}

export function placeAssetForMigration(
    tx: Transaction,
    { packageId }: ChainData,
    anchor: TransactionObjectArgument,
    assetType: string,
    asset: TransactionObjectArgument,
): TransactionObjectArgument {
    return tx.moveCall({
        target: `${packageId}::anchor::place_asset_for_migration`,
        typeArguments: [assetType],
        arguments: [anchor, asset],
    });
}
