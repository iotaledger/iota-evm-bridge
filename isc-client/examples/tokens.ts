import { IOTA_COIN_TYPE, IscTransaction } from '../src/index';
import { Ed25519Keypair } from '@iota/iota-sdk/keypairs/ed25519';
import { IotaClient } from '@iota/iota-sdk/client';
import { CONFIG } from './config';
import { bcs } from '@iota/iota-sdk/bcs';

const { L1 } = CONFIG;

const client = new IotaClient({
    url: L1.rpcUrl,
});

const keypair = Ed25519Keypair.deriveKeypair(
    'mom program scrap easily doctor seed slender secret mad flat foam hospital cherry seek river you obscure column blood reflect arch pencil cat burst',
);
const address = keypair.toIotaAddress();

// console.log('Requesting faucet...');

// await requestIotaFromFaucetV0({
//     host: L1.faucetUrl,
//     recipient: address,
// });

console.log('Sending...');

// EVM Address
const recipientAddress = process.argv[2];
// Amount to send (1 IOTAs)
const amountToSend = BigInt(1 * 1_000_000_000);
// Amount to send (1 Boxfish)
const tokenAmountToSend = BigInt(1);
// We also need to place a little more in the bag to cover the L2 gas
const L2_GAS_ESTIMATE = BigInt(10_000);
const amountToPlace = amountToSend + L2_GAS_ESTIMATE;

const BOXFISH_COIN_TYPE =
    '0xe02c05fe78a112a045b9ab25794ad19fc8895155fa8ac9c057cd6a0f5a1f3c5a::box_coin::BOX_COIN';

const iscTx = new IscTransaction({
    chainId: L1.chainId,
    packageId: L1.packageId,
    coreContractAccounts: Number(L1.coreContractAccounts),
    accountsTransferAllowanceTo: Number(L1.accountsTransferAllowanceTo),
});

const tx = iscTx.transaction();

const bag = iscTx.newBag();

// Place IOTA
const iotaCoin = iscTx.coinFromAmount({ amount: amountToPlace });
iscTx.placeCoinInBag({ coin: iotaCoin, bag, coinType: IOTA_COIN_TYPE });

// Place Token
let tokenCoin = tx.splitCoins(
    tx.object('0x75dff2c55d8bdba5dba85f2b3e464e2d26d1f6bc8e557c7efc46b63fdb30d322'),
    [tx.pure(bcs.U64.serialize(100))],
);
iscTx.placeCoinInBag({
    bag,
    coin: tokenCoin,
    coinType: BOXFISH_COIN_TYPE,
});

iscTx.createAndSend({
    bag,
    address: recipientAddress,
    transfers: [
        [IOTA_COIN_TYPE, amountToSend],
        [BOXFISH_COIN_TYPE, tokenAmountToSend],
    ],
});

const transaction = iscTx.build();
transaction.setSender(address);

await transaction.build({ client });

await client.signAndExecuteTransaction({
    signer: keypair,
    transaction,
});

console.log('Sent!');
