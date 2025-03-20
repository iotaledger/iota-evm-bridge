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
const recipientAddress = '0xdEC684752A21Ea475972055c07e586A434328f4D';
// Amount to send (1 IOTAs)
const amountToSend = BigInt(1000000000);
// We also need to put a little more to cover the L2 gas
const L2_GAS_ESTIMATE = BigInt(1_000);
const amountToPlace = amountToSend + L2_GAS_ESTIMATE;

const iscTx = new IscTransaction({
    chainId: L1.chainId,
    packageId: L1.packageId,
    coreContractAccounts: Number(L1.coreContractAccounts),
    accountsTransferAllowanceTo: Number(L1.accountsTransferAllowanceTo),
});

const bag = iscTx.newBag();
iscTx.placeCoinsInBag({ amount: amountToPlace, bag });
iscTx.createAndSend({ bag, address: recipientAddress, amount: amountToSend });
const transaction = iscTx.build();

transaction.setSender(address);

await transaction.build({ client });

await client.signAndExecuteTransaction({
    signer: keypair,
    transaction
});

console.log('Sent!');
