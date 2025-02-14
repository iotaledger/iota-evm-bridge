import { Transaction } from "@iota/iota-sdk/transactions";
import { BaseTokenType } from "./constants";
import { bcs } from "@iota/iota-sdk/bcs";
import { IscAgentID } from "./bcs";
import { ChainData } from "./types";

interface IscTransactionParams {
  amount: number;
  gas: number;
}

export class IscTransaction<Params> {
  #params: Params;

  constructor(params: Params) {
    this.#params = params;
  }

  static create() {
    return new IscTransaction({});
  }

  withAmount(amount: number) {
    return new IscTransaction({ ...this.#params, amount });
  }

  withGasBudget(gas: number) {
    return new IscTransaction({ ...this.#params, gas });
  }

  build(
    this: IscTransaction<IscTransactionParams>,
    address: string,
    {
      chainId,
      accountsTransferAllowanceTo,
      coreContractAccounts,
      packageId,
    }: ChainData,
  ): Transaction {
    const tx = new Transaction();

    // Create a new empty AssetsBag. It will be used to attach coins/objects to the request
    const assetsBag = tx.moveCall({
      target: `${packageId}::assets_bag::new`,
      arguments: [],
    });

    const amountToSend = this.#params.amount - 10000000;

    // Split the senders Gas coin so we have a coin to transfer
    const [splitCoin] = tx.splitCoins(tx.gas, [
      tx.pure(bcs.U64.serialize(amountToSend)),
    ]);

    tx.moveCall({
      target: `${packageId}::assets_bag::place_coin`,
      typeArguments: [BaseTokenType],
      arguments: [assetsBag, splitCoin],
    });

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
        tx.pure(bcs.vector(bcs.string()).serialize([BaseTokenType])),
        tx.pure(bcs.vector(bcs.u64()).serialize([this.#params.amount])),
        tx.pure(bcs.U64.serialize(this.#params.gas.toString())),
      ],
    });

    return tx;
  }
}
