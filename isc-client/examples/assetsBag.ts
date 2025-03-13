import { IscTransaction } from '../src/index'
import { CommonVariables } from './common';
import { Ed25519Keypair } from '@iota/iota-sdk/keypairs/ed25519';
import { requestIotaFromFaucetV0 } from '@iota/iota-sdk/faucet';
import { IotaClient } from '@iota/iota-sdk/client';

const { url, variables } = CommonVariables.alphanet; 

const client = new IotaClient({
    url
})


const keypair =  Ed25519Keypair.deriveKeypair("carbon cushion people lion curve small inch saddle useful spike cousin finger secret label spare exact build unfair okay state filter pink tortoise squirrel");
const address = keypair.toIotaAddress();

console.log("Requesting faucet...")
await requestIotaFromFaucetV0({
    host: variables.faucet,
    recipient: address,
})

console.log("Sending...")

// Amount to send (1 IOTAs)
const requestedAmount = BigInt(1000000000);
// EVM Address
const recipientAddress = "0xdEC684752A21Ea475972055c07e586A434328f4D";
const GAS_BUDGET = BigInt(10000000);
const amount = requestedAmount - GAS_BUDGET;

console.log(address, amount, recipientAddress, variables.chain)

const iscTx = new IscTransaction(variables.chain);

const bag = iscTx.newBag();

const coins = iscTx.coinsFromAmount({ amount })

iscTx.placeCoinsInBag({ coins, bag });

iscTx.createAndSend({ bag, address: recipientAddress, amount, gasBudget: GAS_BUDGET });

const transaction = iscTx.build();
transaction.setSender(address);

await transaction.build({ client });

await client.signAndExecuteTransaction({
    signer: keypair,
    transaction,
    options: {
        showEffects: true,
        showEvents: true,
        showObjectChanges: true,
    },
})

console.log('Sent!')