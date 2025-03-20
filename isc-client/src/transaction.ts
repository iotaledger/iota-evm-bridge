import {
    Transaction,
    TransactionObjectArgument,
    TransactionResult,
} from '@iota/iota-sdk/transactions';
import * as isc from './isc';
import { ChainData } from './types';

export class IscTransaction {
    #transaction: Transaction;
    #chainData: ChainData;

    constructor(chainData: ChainData, transaction = new Transaction()) {
        this.#transaction = transaction;
        this.#chainData = chainData;
    }

    /**
     * Create a bag.
     */
    newBag(): TransactionObjectArgument {
        return isc.newBag(this.#transaction, this.#chainData);
    }

    /**
     * Place some amount of coins in a bag.
     */
    placeCoinsInBag({ bag, amount }: { bag: TransactionObjectArgument; amount: number | bigint }) {
        const coins = isc.coinsFromAmount(this.#transaction, BigInt(amount));
        isc.placeCoinsInBag(this.#transaction, this.#chainData, bag, coins);
    }

    /**
     * Finally create and send the request.
     */
    createAndSend({
        bag,
        address,
        amount,
        gasBudget,
    }: {
        address: string;
        amount: number | bigint;
        gasBudget?: number | bigint;
        bag: TransactionObjectArgument;
    }) {
        isc.createAndSend(this.#transaction, this.#chainData, bag, amount, address, gasBudget);
    }

    /**
     * Take out the specied amount of coins from the bag.
     */
    takeCoinsBalanceFromBag({ bag, amount }: { amount: number | bigint; bag: TransactionResult }) {
        return isc.takeCoinsBalanceFromBag(this.#transaction, this.#chainData, bag, amount);
    }

    /**
     * Take out all the coins from the bag.
     */
    takeAllCoinsBalanceFromBag({ bag }: { bag: TransactionResult }) {
        return isc.takeAllCoinsBalanceFromBag(this.#transaction, this.#chainData, bag);
    }

    /**
     * Place a coins balance in the bag.
     */
    placeCoinsBalanceInBag({
        bag,
        balance,
    }: {
        balance: TransactionResult;
        bag: TransactionResult;
    }) {
        isc.placeCoinsBalanceInBag(this.#transaction, this.#chainData, bag, balance);
    }

    /**
     * Place an asset in the bag.
     */
    placeAssetInBag({ bag, asset }: { asset: TransactionResult; bag: TransactionResult }) {
        isc.placeAssetInBag(this.#transaction, this.#chainData, bag, asset);
    }

    /**
     * Take an asset from a bag.
     */
    takeAssetFromBag({ bag }: { bag: TransactionResult }) {
        isc.takeAssetFromBag(this.#transaction, this.#chainData, bag);
    }

    /**
     * Get the size of the bag.
     */
    getSizeOfBag({ bag }: { bag: TransactionResult }) {
        return isc.getSizeOfBag(this.#transaction, this.#chainData, bag);
    }

    /**
     * Destroy the bag.
     */
    destroyBag({ bag }: { bag: TransactionResult }) {
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
        coins,
    }: {
        anchor: TransactionObjectArgument;
        coins: TransactionObjectArgument;
    }) {
        return isc.placeCoinForMigration(this.#transaction, this.#chainData, anchor, coins);
    }

    placeCoinBalanceForMigration({
        anchor,
        balance,
    }: {
        anchor: TransactionObjectArgument;
        balance: TransactionObjectArgument;
    }) {
        return isc.placeCoinBalanceForMigration(
            this.#transaction,
            this.#chainData,
            anchor,
            balance,
        );
    }

    placeAssetForMigration({
        anchor,
        asset,
    }: {
        anchor: TransactionObjectArgument;
        asset: TransactionObjectArgument;
    }) {
        return isc.placeAssetForMigration(this.#transaction, this.#chainData, anchor, asset);
    }

    /**
     * Return the IOTA Transaction.
     * @returns IOTA Transaction.
     */
    build(): Transaction {
        return this.#transaction;
    }
}
