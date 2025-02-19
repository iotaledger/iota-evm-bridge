// Copyright (c) 2025 IOTA Stiftung
// SPDX-License-Identifier: Apache-2.0

import { ConnectButton, useCurrentAccount } from '@iota/dapp-kit';
import { Box, Container, Flex, Heading } from '@radix-ui/themes';
import { FaucetBox } from './FaucetBox';
import { SendBox } from './SendBox';

function App() {
    const currentAccount = useCurrentAccount();

    return (
        <>
            <Flex
                position="sticky"
                px="4"
                py="2"
                justify="between"
                style={{
                    borderBottom: '1px solid var(--gray-a2)',
                }}
            >
                <Box>
                    <Heading>ISC Faucet Depositer</Heading>
                </Box>

                <Box>
                    <ConnectButton />
                </Box>
            </Flex>
            <Container>
                <Container
                    mt="5"
                    pt="2"
                    px="4"
                    style={{ background: 'var(--gray-a2)', minHeight: 500 }}
                >
                    {currentAccount ? (
                        <>
                            <FaucetBox />
                            <SendBox />
                        </>
                    ) : (
                        <Heading>Please connect your wallet</Heading>
                    )}
                </Container>
            </Container>
        </>
    );
}

export default App;
