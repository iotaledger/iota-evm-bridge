// Copyright (c) 2025 IOTA Stiftung
// SPDX-License-Identifier: Apache-2.0

import { useSignAndExecuteTransaction, useIotaClient } from '@iota/dapp-kit';
import { Button, Flex, Text, TextField } from '@radix-ui/themes';
import { useState } from 'react';
import { IscTransaction } from 'isc-client';
import { useNetworkVariables } from './networkConfig';
import { IOTA_DECIMALS } from '@iota/iota-sdk/utils';
import BigNumber from 'bignumber.js';

export function SendBox() {
    const iotaClient = useIotaClient();
    const [address, setAddress] = useState('');
    const [amount, setAmount] = useState(0);
    const variables = useNetworkVariables();

    const {
        mutate: signAndExecute,
        error,
        isPending,
    } = useSignAndExecuteTransaction({
        execute: async ({ bytes, signature }) =>
            await iotaClient.executeTransactionBlock({
                transactionBlock: bytes,
                signature,
                options: {
                    showRawEffects: true,
                    showEffects: true,
                },
            }),
    });

    const sendAmount = async () => {
        const GAS_BUDGET = BigInt(10000000);
        const amountToSend = parseAmount(amount, IOTA_DECIMALS) - GAS_BUDGET;

        const iscTx = new IscTransaction(variables.chain);
        const bag = iscTx.newBag();
        iscTx.placeCoinsInBag({ amount: amountToSend, bag });
        iscTx.createAndSend({ bag, address, amount: amountToSend });
        const transaction = iscTx.build();

        signAndExecute(
            {
                transaction,
            },
            {
                onSuccess: async (data) => {
                    console.log(data);
                },
            },
        );
    };

    return (
        <>
            <Flex direction="column" gap="2">
                <h1>Send</h1>
                {isPending ? (
                    <Text>Loading...</Text>
                ) : error ? (
                    <Text>Error: {error.message}</Text>
                ) : (
                    <>
                        <TextField.Root
                            placeholder="EVM Address"
                            value={address}
                            onChange={(event) => setAddress(event.target.value)}
                        ></TextField.Root>
                        <TextField.Root
                            type="number"
                            placeholder="Amount"
                            value={amount}
                            onChange={(event) => setAmount(Number(event.target.value))}
                        ></TextField.Root>
                        <Button onClick={() => sendAmount()}>Send</Button>
                    </>
                )}
            </Flex>
        </>
    );
}

export function parseAmount(amount: number, coinDecimals: number) {
    try {
        return BigInt(new BigNumber(amount).shiftedBy(coinDecimals).integerValue().toString());
    } catch {
        return BigInt(0);
    }
}
