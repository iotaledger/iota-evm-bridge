import { Transaction, TransactionObjectArgument } from '@iota/iota-sdk/transactions';
import * as isc from './isc';
import { ChainData } from './types';
import { IOTA_TYPE_ARG } from '@iota/iota-sdk/utils';

export class IscTransaction {
    #transaction: Transaction;
    #chainData: ChainData;

    constructor(chainData: ChainData, transaction = new Transaction()) {
        this.#transaction = transaction;
        this.#chainData = chainData;
    }

    /**
     * Getter for the L1 Transaction.
     */
    transaction(): Transaction {
        return this.#transaction;
    }

    /**
     * Create a bag.
     */
    newBag(): TransactionObjectArgument {
        return isc.newBag(this.#transaction, this.#chainData);
    }

    /**
     * Get some amount in a coin.
     */
    coinFromAmount({ amount }: { amount: number | bigint }) {
        return isc.coinFromAmount(this.#transaction, BigInt(amount));
    }

    /**
     * Place a coin in a bag.
     */
    placeCoinInBag({
        bag,
        coinType = IOTA_TYPE_ARG,
        coin,
    }: {
        coin: TransactionObjectArgument;
        coinType?: string;
        bag: TransactionObjectArgument;
    }) {
        isc.placeCoinInBag(this.#transaction, this.#chainData, bag, coinType, coin);
    }

    /**
     * Finally create and send the request.
     */
    createAndSend({
        bag,
        address,
        transfers,
        gasBudget,
    }: {
        address: string;
        transfers: Array<[string, number | bigint]>;
        gasBudget: number | bigint;
        bag: TransactionObjectArgument;
    }) {
        isc.createAndSend(this.#transaction, this.#chainData, bag, transfers, address, gasBudget);
    }

    /**
     * Take out the specified amount of coin from the bag.
     */
    takeCoinBalanceFromBag({
        bag,
        coinType = IOTA_TYPE_ARG,
        amount,
    }: {
        amount: number | bigint;
        coinType?: string;
        bag: TransactionObjectArgument;
    }) {
        return isc.takeCoinBalanceFromBag(
            this.#transaction,
            this.#chainData,
            bag,
            coinType,
            amount,
        );
    }

    /**
     * Take out all the coin from the bag.
     */
    takeAllCoinBalanceFromBag({
        bag,
        coinType = IOTA_TYPE_ARG,
    }: {
        bag: TransactionObjectArgument;
        coinType?: string;
    }) {
        return isc.takeAllCoinBalanceFromBag(this.#transaction, this.#chainData, bag, coinType);
    }

    /**
     * Place a coin balance in the bag.
     */
    placeCoinBalanceInBag({
        bag,
        coinType = IOTA_TYPE_ARG,
        balance,
    }: {
        balance: TransactionObjectArgument;
        coinType?: string;
        bag: TransactionObjectArgument;
    }) {
        isc.placeCoinBalanceInBag(this.#transaction, this.#chainData, bag, coinType, balance);
    }

    /**
     * Place an asset in the bag.
     */
    placeAssetInBag({
        bag,
        asset,
        coinType,
    }: {
        asset: TransactionObjectArgument;
        bag: TransactionObjectArgument;
        coinType: string;
    }) {
        isc.placeAssetInBag(this.#transaction, this.#chainData, bag, coinType, asset);
    }

    /**
     * Take an asset from a bag.
     */
    takeAssetFromBag({
        bag,
        coinType = IOTA_TYPE_ARG,
    }: {
        bag: TransactionObjectArgument;
        coinType?: string;
    }) {
        isc.takeAssetFromBag(this.#transaction, this.#chainData, bag, coinType);
    }

    /**
     * Get the size of the bag.
     */
    getSizeOfBag({ bag }: { bag: TransactionObjectArgument }) {
        return isc.getSizeOfBag(this.#transaction, this.#chainData, bag);
    }

    /**
     * Destroy the bag.
     */
    destroyBag({ bag }: { bag: TransactionObjectArgument }) {
        return isc.destroyBag(this.#transaction, this.#chainData, bag);
    }

    startNewChain({ metadata, coin }: { metadata: Uint8Array; coin?: TransactionObjectArgument }) {
        return isc.startNewChain(this.#transaction, this.#chainData, metadata, coin);
    }

    createAnchorWithAssetBag({ bag }: { bag: TransactionObjectArgument }) {
        return isc.createAnchorWithAssetBag(this.#transaction, this.#chainData, bag);
    }

    updateAnchorStateForMigraton({
        anchor,
        metadata,
        stateIndex,
    }: {
        anchor: TransactionObjectArgument;
        metadata: Uint8Array;
        stateIndex: number;
    }) {
        return isc.updateAnchorStateForMigraton(
            this.#transaction,
            this.#chainData,
            anchor,
            metadata,
            stateIndex,
        );
    }

    destroyAnchor({ anchor }: { anchor: TransactionObjectArgument }) {
        return isc.destroyAnchor(this.#transaction, this.#chainData, anchor);
    }

    borrowAssets({ anchor }: { anchor: TransactionObjectArgument }) {
        return isc.borrowAssets(this.#transaction, this.#chainData, anchor);
    }

    returnAssetsFromBorrow({
        anchor,
        bag,
        borrow,
    }: {
        anchor: TransactionObjectArgument;
        bag: TransactionObjectArgument;
        borrow: TransactionObjectArgument;
    }) {
        return isc.returnAssetsFromBorrow(this.#transaction, this.#chainData, anchor, bag, borrow);
    }

    receiveRequest({
        anchor,
        request,
    }: {
        anchor: TransactionObjectArgument;
        request: TransactionObjectArgument;
    }) {
        return isc.receiveRequest(this.#transaction, this.#chainData, anchor, request);
    }

    transition({
        anchor,
        newStateMetadata,
        receipts,
    }: {
        anchor: TransactionObjectArgument;
        newStateMetadata: Uint8Array;
        receipts: TransactionObjectArgument;
    }) {
        return isc.transition(
            this.#transaction,
            this.#chainData,
            anchor,
            newStateMetadata,
            receipts,
        );
    }

    placeCoinForMigration({
        anchor,
        coinType = IOTA_TYPE_ARG,
        coin,
    }: {
        anchor: TransactionObjectArgument;
        coinType?: string;
        coin: TransactionObjectArgument;
    }) {
        return isc.placeCoinForMigration(
            this.#transaction,
            this.#chainData,
            anchor,
            coinType,
            coin,
        );
    }

    placeCoinBalanceForMigration({
        anchor,
        coinType = IOTA_TYPE_ARG,
        balance,
    }: {
        anchor: TransactionObjectArgument;
        coinType?: string;
        balance: TransactionObjectArgument;
    }) {
        return isc.placeCoinBalanceForMigration(
            this.#transaction,
            this.#chainData,
            anchor,
            coinType,
            balance,
        );
    }

    placeAssetForMigration({
        anchor,
        coinType = IOTA_TYPE_ARG,
        asset,
    }: {
        anchor: TransactionObjectArgument;
        coinType?: string;
        asset: TransactionObjectArgument;
    }) {
        return isc.placeAssetForMigration(
            this.#transaction,
            this.#chainData,
            anchor,
            coinType,
            asset,
        );
    }

    /**
     * Return the IOTA Transaction.
     * @returns IOTA Transaction.
     */
    build(): Transaction {
        return this.#transaction;
    }
}
