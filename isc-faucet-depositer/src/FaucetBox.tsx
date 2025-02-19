// Copyright (c) 2025 IOTA Stiftung
// SPDX-License-Identifier: Apache-2.0

import { useCurrentAccount } from '@iota/dapp-kit';
import { Button, Flex, Text } from '@radix-ui/themes';
import { requestIotaFromFaucetV0 } from '@iota/iota-sdk/faucet';
import { useNetworkVariables } from './networkConfig';

export function FaucetBox() {
    const currentAccount = useCurrentAccount();
    const variables = useNetworkVariables();

    const requestFaucet = async () => {
        const faucetResult = await requestIotaFromFaucetV0({
            host: variables.faucet,
            recipient: currentAccount?.address,
        });
        console.log(faucetResult);
    };

    return (
        <>
            <Flex direction="column" gap="2">
                <h1>Faucet</h1>
                <Text>Request to {currentAccount?.address}</Text>
                <Button onClick={() => requestFaucet()}>Request funds</Button>
            </Flex>
        </>
    );
}
