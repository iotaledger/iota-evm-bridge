import { Transaction, TransactionResult } from '@iota/iota-sdk/transactions';
import * as isc from './isc';
import { ChainData } from './types';

export class IscTransaction {
    #transaction: Transaction;
    #chainData: ChainData;

    constructor(chainData: ChainData) {
        this.#transaction = new Transaction();
        this.#chainData = chainData;
    }

    /**
     * Create a bag.
     */
    newBag(): TransactionResult {
        return isc.newBag(this.#transaction, this.#chainData);
    }

    /**
     * Place some coins in a bag.
     */
    placeCoinsInBag({ bag, amount }: { amount: number | bigint; bag: TransactionResult }) {
        isc.placeCoinsInBag(this.#transaction, this.#chainData, bag, amount);
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
     * Return the IOTA Transaction.
     * @returns IOTA Transaction.
     */
    build(): Transaction {
        return this.#transaction;
    }
}
