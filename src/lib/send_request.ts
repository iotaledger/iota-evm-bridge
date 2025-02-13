import { Transaction } from "@iota/iota-sdk/transactions";
import { bcs } from '@iota/iota-sdk/bcs';

export interface Message {
    contract: number;
    function: number;
    args: Array<Uint8Array>;
}

export interface CreateRequestParams {
    amountToSend: number;

    anchorId: string;
    packageID: string;
    message: Message;
    allowanceCoinTypes: string[];
    allowanceBalances: number[];
    onchainGasBudget: number;
}

export const BaseTokenType = '0x0000000000000000000000000000000000000000000000000000000000000002::iota::IOTA';

export function createRequest(
    params: CreateRequestParams
) {
    const tx = new Transaction();

    // Create a new empty AssetsBag. It will be used to attach coins/objects to the request
    const assetsBag = tx.moveCall({
        target: `${params.packageID}::assets_bag::new`,
        arguments: []
    });

    // Split the senders Gas coin so we have a coin to transfer
    const [splitCoin] = tx.splitCoins(tx.gas, [
        tx.pure(bcs.U64.serialize(params.amountToSend))
    ]);

    // Place the split coin into the created AssetsBag 
    tx.moveCall({
        target: `${params.packageID}::assets_bag::place_coin`,
        typeArguments: [BaseTokenType],
        arguments: [assetsBag, splitCoin]
    });

    /* Execute iscmove::requests::create_and_send_request. 
       This creates the Request Move object and sends it to the Anchor object of the Chain (ChainID == Anchor Object ID) 
        
        The required arguments are: 
        * AnchorID, AssetsBagID (created above), 
        * Contract call arguments (contract hnmae, function hname, an array of bcs encoded args) 
        * An allowance split into two fields instead of a map. (to make sending/parsing of the request easier, using a map would require creating a new Object) 
        * On chain Gas budget    
    */
    tx.moveCall({
        target: `${params.packageID}::request::create_and_send_request`,
        arguments: [
            tx.pure(bcs.Address.serialize(params.anchorId)),
            tx.object(assetsBag),
            tx.pure(bcs.U32.serialize(params.message.contract)),
            tx.pure(bcs.U32.serialize(params.message.function)),
            tx.pure(bcs.vector(bcs.vector(bcs.u8())).serialize(params.message.args)),
            tx.pure(bcs.vector(bcs.string()).serialize(params.allowanceCoinTypes)),
            tx.pure(bcs.vector(bcs.u64()).serialize(params.allowanceBalances)),
            tx.pure(bcs.U64.serialize(params.onchainGasBudget.toString()))
        ]
    });

    return tx;
}
