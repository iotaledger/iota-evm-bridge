import { IscTransaction } from '../src/index';
import { Ed25519Keypair } from '@iota/iota-sdk/keypairs/ed25519';
import { requestIotaFromFaucetV0 } from '@iota/iota-sdk/faucet';
import { IotaClient } from '@iota/iota-sdk/client';
import { CONFIG } from './config';

const { L1 } = CONFIG;

const client = new IotaClient({
    url: L1.rpcUrl,
});

const keypair = new Ed25519Keypair();
const address = keypair.toIotaAddress();

console.log('Requesting faucet...');

await requestIotaFromFaucetV0({
    host: L1.faucetUrl,
    recipient: address,
});

console.log('Sending...');

// EVM Address
const recipientAddress = process.argv[2];
// Amount to send (1 IOTAs)
const amountToSend = BigInt(1 * 1000000000);
// We also need to place a little more in the bag to cover the L2 gas
const L2_GAS_ESTIMATE = BigInt(1_000);
const amountToPlace = amountToSend + L2_GAS_ESTIMATE;

const iscTx = new IscTransaction({
    chainId: L1.chainId,
    packageId: L1.packageId,
    coreContractAccounts: Number(L1.coreContractAccounts),
    accountsTransferAllowanceTo: Number(L1.accountsTransferAllowanceTo),
});

let bag = iscTx.newBag();

const bagCoins = iscTx.coinsFromAmount({ amount: amountToPlace });
iscTx.placeCoinsInBag({ coins: bagCoins, bag });
const anchor = iscTx.createAnchorWithAssetBag({ bag });
iscTx.updateAnchorStateForMigraton({
    anchor,
    metadata: new TextEncoder().encode('Something is going on here'),
    stateIndex: 0,
});
const migrationCoins = iscTx.coinsFromAmount({ amount: amountToPlace });
iscTx.placeCoinForMigration({ anchor, coins: migrationCoins });
bag = iscTx.destroyAnchor({ anchor });
iscTx.createAndSend({ bag, address: recipientAddress, amount: amountToSend });

const transaction = iscTx.build();
transaction.setSender(address);

await transaction.build({ client });

await client.signAndExecuteTransaction({
    signer: keypair,
    transaction,
});

console.log('Sent!');
