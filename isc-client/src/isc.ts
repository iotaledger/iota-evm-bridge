import { Transaction, TransactionResult } from '@iota/iota-sdk/transactions';
import { ChainData } from './types';
import { bcs } from '@iota/iota-sdk/bcs';
import { IOTA_COIN_TYPE } from './constants';
import { IscAgentID } from './bcs';

export function newBag(tx: Transaction, { packageId }: ChainData): TransactionResult {
    // Create a new empty AssetsBag. It will be used to attach coins/objects to the request
    const assetsBag = tx.moveCall({
        target: `${packageId}::assets_bag::new`,
        arguments: [],
    });

    return assetsBag;
}

export function placeCoinsInBag(
    tx: Transaction,
    { packageId }: ChainData,
    assetsBag: TransactionResult,
    amount: number | bigint,
) {
    // Split the senders Gas coin so we have a coin to transfer
    const [splitCoin] = tx.splitCoins(tx.gas, [tx.pure(bcs.U64.serialize(amount))]);

    tx.moveCall({
        target: `${packageId}::assets_bag::place_coin`,
        typeArguments: [IOTA_COIN_TYPE],
        arguments: [assetsBag, splitCoin],
    });
}

export function createAndSend(
    tx: Transaction,
    { packageId, chainId, accountsTransferAllowanceTo, coreContractAccounts }: ChainData,
    assetsBag: TransactionResult,
    amount: number | bigint,
    address: string,
    gasBudget: number,
) {
    const agentID = IscAgentID.serialize({
        EthereumAddressAgentID: {
            chainID: bcs.fixedArray(32, bcs.u8()).fromHex(chainId),
            eth: bcs.fixedArray(20, bcs.u8()).fromHex(address),
        },
    }).toBytes();

    /* Execute iscmove::requests::create_and_send_request. 
       This creates the Request Move object and sends it to the Anchor object of the Chain (ChainID == Anchor Object ID) 
        
        The required arguments are: 
        * AnchorID, AssetsBagID (created above), 
        * Contract call arguments (contract hnmae, function hname, an array of bcs encoded args) 
        * An allowance split into two fields instead of a map. (to make sending/parsing of the request easier, using a map would require creating a new Object) 
        * On chain Gas budget    
    */
    tx.moveCall({
        target: `${packageId}::request::create_and_send_request`,
        arguments: [
            tx.pure(bcs.Address.serialize(chainId)),
            tx.object(assetsBag),
            tx.pure(bcs.U32.serialize(coreContractAccounts)),
            tx.pure(bcs.U32.serialize(accountsTransferAllowanceTo)),
            tx.pure(bcs.vector(bcs.vector(bcs.u8())).serialize([agentID])),
            tx.pure(bcs.vector(bcs.string()).serialize([IOTA_COIN_TYPE])),
            tx.pure(bcs.vector(bcs.u64()).serialize([amount])),
            tx.pure(bcs.U64.serialize(gasBudget)),
        ],
    });

    return tx;
}
