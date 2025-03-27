import { IotaClient } from '@iota/iota-sdk/client';
import { requestIotaFromFaucetV0 } from '@iota/iota-sdk/faucet';
import { Ed25519Keypair } from '@iota/iota-sdk/keypairs/ed25519';
import { CONFIG } from './config';
import { EvmRpcClient, IscTransaction } from '../src';

const { L1, L2 } = CONFIG;

const client = new IotaClient({
    url: L1.rpcUrl,
});
const evmRpcClient = new EvmRpcClient(L2.evmRpcUrl);

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
if (!recipientAddress) {
    console.error('Recipient address is required as the first argument.');
    process.exit(1);
}
// Amount to send (2 IOTAs)
const amountToSend = 2000000000n;
const amountForBag = 1000000000n; // amount for the bag is lower than the amount to send so that the amountForBag funds remain in the anchor on the L1 address
const L2_GAS_BUDGET = BigInt(1_000);

const iscTx = new IscTransaction({
    chainId: L1.chainId,
    packageId: L1.packageId,
    coreContractAccounts: Number(L1.coreContractAccounts),
    accountsTransferAllowanceTo: Number(L1.accountsTransferAllowanceTo),
});
const bag = iscTx.newBag();

const bagCoins = iscTx.coinsFromAmount({ amount: amountForBag });
iscTx.placeCoinsInBag({ coins: bagCoins, bag });

iscTx.createAndSend({
    bag,
    address: recipientAddress,
    amount: amountToSend,
    gasBudget: L2_GAS_BUDGET,
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

const anchorBalance = await evmRpcClient.getBalanceBaseToken(address);

console.log(`L2 balance of the L1 address ${address}: ${JSON.stringify(anchorBalance)}`);
