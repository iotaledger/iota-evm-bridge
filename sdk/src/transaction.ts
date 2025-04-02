import { Transaction, TransactionObjectArgument } from '@iota/iota-sdk/transactions';
import * as isc from './isc';
import { ChainData } from './types';
import { IOTA_TYPE_ARG } from '@iota/iota-sdk/utils';
import { L2_GAS_BUDGET } from './constants';

export type Agent = {
    type: 'evm',
    address: string
}

export class IscTransaction {
    #finalized: boolean;
    #transaction: Transaction;
    #chainData: ChainData;

    constructor(chainData: ChainData, transaction = new Transaction()) {
        this.#finalized = false;
        this.#transaction = transaction;
        this.#chainData = chainData;
    }

    private validateFinalizedStatus(){
        if(this.#finalized){
            throw Error('Transaction is built.')
        }
    }

    /**
     * Getter for the IOTA MOVE Transaction.
     */
    transaction(): Transaction {
        return this.#transaction;
    }

    /**
     * Create a bag.
     */
    newBag(): TransactionObjectArgument {
        this.validateFinalizedStatus();
        return isc.newBag(this.#transaction, this.#chainData);
    }

    /**
     * Get some amount in a coin.
     */
    coinFromAmount({ amount }: { amount: number | bigint }) {
        this.validateFinalizedStatus();
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
        this.validateFinalizedStatus();
        isc.placeCoinInBag(this.#transaction, this.#chainData, bag, coinType, coin);
    }

    /**
     * Finally create and send the request.
     */
    createAndSend({
        bag,
        agent,
        transfers,
        gasBudget = L2_GAS_BUDGET,
    }: {
        agent: Agent,
        transfers: Array<[string, number | bigint]>;
        gasBudget?: number | bigint;
        bag: TransactionObjectArgument;
    }) {
        this.validateFinalizedStatus();
        const agentID = (() => {
            switch(agent.type){
                case 'evm':
                    return isc.agentIdForEVM(agent.address)
            }
        })();
        isc.createAndSend(this.#transaction, this.#chainData, bag, transfers, gasBudget, [agentID]);
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
        this.validateFinalizedStatus();
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
        this.validateFinalizedStatus();
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
        this.validateFinalizedStatus();
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
        this.validateFinalizedStatus();
        isc.placeAssetInBag(this.#transaction, this.#chainData, bag, coinType, asset);
    }

    /**
     * Take an asset from a bag.
     */
    takeAssetFromBag({
        bag,
        coinType,
    }: {
        bag: TransactionObjectArgument;
        coinType: string;
    }) {
        this.validateFinalizedStatus();
        isc.takeAssetFromBag(this.#transaction, this.#chainData, bag, coinType);
    }

    /**
     * Get the size of the bag.
     */
    getSizeOfBag({ bag }: { bag: TransactionObjectArgument }) {
        this.validateFinalizedStatus();
        return isc.getSizeOfBag(this.#transaction, this.#chainData, bag);
    }

    /**
     * Destroy the bag.
     */
    destroyBag({ bag }: { bag: TransactionObjectArgument }) {
        this.validateFinalizedStatus();
        return isc.destroyBag(this.#transaction, this.#chainData, bag);
    }

    startNewChain({ metadata, coin }: { metadata: Uint8Array; coin?: TransactionObjectArgument }) {
        this.validateFinalizedStatus();
        return isc.startNewChain(this.#transaction, this.#chainData, metadata, coin);
    }

    createAnchorWithAssetBag({ bag }: { bag: TransactionObjectArgument }) {
        this.validateFinalizedStatus();
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
        this.validateFinalizedStatus();
        return isc.updateAnchorStateForMigraton(
            this.#transaction,
            this.#chainData,
            anchor,
            metadata,
            stateIndex,
        );
    }

    destroyAnchor({ anchor }: { anchor: TransactionObjectArgument }) {
        this.validateFinalizedStatus();
        return isc.destroyAnchor(this.#transaction, this.#chainData, anchor);
    }

    borrowAssets({ anchor }: { anchor: TransactionObjectArgument }) {
        this.validateFinalizedStatus();
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
        this.validateFinalizedStatus();
        return isc.returnAssetsFromBorrow(this.#transaction, this.#chainData, anchor, bag, borrow);
    }

    receiveRequest({
        anchor,
        request,
    }: {
        anchor: TransactionObjectArgument;
        request: TransactionObjectArgument;
    }) {
        this.validateFinalizedStatus();
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
        this.validateFinalizedStatus();
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
        this.validateFinalizedStatus();
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
        this.validateFinalizedStatus();
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
        coinType,
        asset,
    }: {
        anchor: TransactionObjectArgument;
        coinType: string;
        asset: TransactionObjectArgument;
    }) {
        this.validateFinalizedStatus();
        return isc.placeAssetForMigration(
            this.#transaction,
            this.#chainData,
            anchor,
            coinType,
            asset,
        );
    }

    /**
     * Stop building this ISC Transaction and return the IOTA MOVE Transaction.
     * @returns IOTA MOVE Transaction.
     */
    build(): Transaction {
        this.validateFinalizedStatus();
        this.#finalized = true;
        return this.#transaction;
    }
}
