import { Transaction, TransactionObjectArgument, TransactionResult } from '@iota/iota-sdk/transactions';
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
    newBag(): TransactionResult {
        return isc.newBag(this.#transaction, this.#chainData);
    }

    /**
     * Get some amount of coins.
     */
    coinsFromAmount({ amount }: { amount: number | bigint }) {
        return isc.coinsFromAmount(this.#transaction, amount);
    }

    /**
     * Place some coins in a bag.
     */
    placeCoinsInBag({ bag, coins }: { coins: TransactionObjectArgument; bag: TransactionResult }) {
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
        bag: TransactionResult;
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

    /**
     * Return the IOTA Transaction.
     * @returns IOTA Transaction.
     */
    build(): Transaction {
        return this.#transaction;
    }
}
