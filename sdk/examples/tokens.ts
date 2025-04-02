import { IscTransaction, L2_GAS_BUDGET } from '../src/index';
import { IOTA_TYPE_ARG } from '@iota/iota-sdk/utils';
import { Ed25519Keypair } from '@iota/iota-sdk/keypairs/ed25519';
import { IotaClient } from '@iota/iota-sdk/client';
import { CONFIG } from './config';
import { bcs } from '@iota/iota-sdk/bcs';

const { L1 } = CONFIG;

const client = new IotaClient({
    url: L1.rpcUrl,
});

const MNEMONIC =
    'mom program scrap easily doctor seed slender secret mad flat foam hospital cherry seek river you obscure column blood reflect arch pencil cat burst';
const TOKEN_COIN_TYPE =
    '0xe02c05fe78a112a045b9ab25794ad19fc8895155fa8ac9c057cd6a0f5a1f3c5a::box_coin::BOX_COIN';

const keypair = Ed25519Keypair.deriveKeypair(MNEMONIC);
const address = keypair.toIotaAddress();

// EVM Address
const recipientAddress = process.argv[2];

if (!recipientAddress) {
    console.error('Please provide a recipient address as an argument');
    process.exit(1);
}

// Amount to send (0.01 IOTAs)
const amountToSend = BigInt(1 * 1_000_000);
// Amount to send (1 Boxfish)
const tokenAmountToSend = BigInt(1);
// We also need to place a little more in the bag to cover the L2 gas
const amountToPlace = amountToSend + L2_GAS_BUDGET;

console.log('Sending...');

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
iscTx.placeCoinInBag({ coin: iotaCoin, bag, coinType: IOTA_TYPE_ARG });

// Place Token
const tokenCoin = tx.splitCoins(
    tx.object('0x75dff2c55d8bdba5dba85f2b3e464e2d26d1f6bc8e557c7efc46b63fdb30d322'),
    [tx.pure(bcs.U64.serialize(tokenAmountToSend))],
);
iscTx.placeCoinInBag({
    bag,
    coin: tokenCoin,
    coinType: TOKEN_COIN_TYPE,
});

iscTx.createAndSend({
    bag,
    transfers: [
        [IOTA_TYPE_ARG, amountToSend],
        [TOKEN_COIN_TYPE, tokenAmountToSend],
    ],
    agent: {
        type: 'evm',
        address: recipientAddress
    }
});

const transaction = iscTx.build();
transaction.setSender(address);

await transaction.build({ client });

const { digest } = await client.signAndExecuteTransaction({
    signer: keypair,
    transaction,
});

await client.waitForTransaction({
    digest,
});

console.log('Sent!');

const data = await fetch(
    `https://api.evm.lb-0.h.iota-rebased-alphanet.iota.cafe/v1/chain/core/accounts/account/${recipientAddress}/balance`,
).then((r) => r.json());
console.log(data);
