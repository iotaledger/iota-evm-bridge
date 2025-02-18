// Copyright (c) 2025 IOTA Stiftung
// SPDX-License-Identifier: Apache-2.0

import {
    useCurrentAccount,
    useSignAndExecuteTransaction,
    useIotaClient,
    useIotaClientQuery,
} from '@iota/dapp-kit';
import type { IotaObjectData } from '@iota/iota-sdk/client';
import { Button, Flex, Text, TextField } from '@radix-ui/themes';
import { requestIotaFromFaucetV0 } from '@iota/iota-sdk/faucet';
import { useState } from 'react';
import { IscTransaction } from 'isc-client';
import { useNetworkVariables } from './networkConfig';

export function FaucetBox() {
    const iotaClient = useIotaClient();
    const currentAccount = useCurrentAccount();
    const [address, setAddress] = useState('');
    const variables = useNetworkVariables();

    const { mutate: signAndExecute } = useSignAndExecuteTransaction({
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

    const { data, isPending, error, refetch } = useIotaClientQuery('getObject', {
        id: variables.chain.chainId,
        options: {
            showContent: true,
            showOwner: true,
        },
    });

    const sendFunds = async () => {
        const faucetResult = await requestIotaFromFaucetV0({
            host: variables.faucet,
            recipient: currentAccount?.address!,
        });

        const GAS_BUDGET = 10000000;
        const amount = faucetResult.transferredGasObjects[0].amount - GAS_BUDGET;

        const iscTx = new IscTransaction(variables.chain);
        const bag = iscTx.newBag();
        iscTx.placeCoinsInBag({ amount, bag });
        iscTx.createAndSend({ bag, address, amount });
        const tx = iscTx.build();

        signAndExecute(
            {
                transaction: tx,
            },
            {
                onSuccess: async (data) => {
                    console.log(data);
                    await refetch();
                },
            },
        );
    };

    if (isPending) return <Text>Loading...</Text>;

    if (error) return <Text>Error: {error.message}</Text>;

    if (!data.data) return <Text>Not found</Text>;

    return (
        <>
            <Flex direction="column" gap="2">
                <Flex direction="row" gap="2">
                    <TextField.Root
                        placeholder="EVM Address"
                        value={address}
                        onChange={(event) => setAddress(event.target.value)}
                    ></TextField.Root>
                    <Button onClick={() => sendFunds()}>Request funds</Button>
                </Flex>

                <Text>Block Index: {getAnchorFields(data.data)?.state_index}</Text>
            </Flex>
        </>
    );
}
function getAnchorFields(data: IotaObjectData) {
    if (data.content?.dataType !== 'moveObject') {
        return null;
    }

    return data.content.fields as { state_index: number; owner: string };
}
