// Copyright (c) 2025 IOTA Stiftung
// SPDX-License-Identifier: Apache-2.0

import { createNetworkConfig } from '@iota/dapp-kit';

const { networkConfig, useNetworkVariable, useNetworkVariables } = createNetworkConfig({
    alphanet: {
        url: 'https://api.iota-rebased-alphanet.iota.cafe',
        variables: {
            faucet: 'https://faucet.iota-rebased-alphanet.iota.cafe/gas',
            chain: {
                chainId: '0x36574ba3886c4fbb4b6523f3ce23a34c81ac2aa54dfa68a5f35b8410fceae8e6',
                packageId: '0x7b2fd27e09ad438c914fe2199cc78c174da92208384ac4341f61d2a15a588463',
                coreContractAccounts: 0x3c4b5e02,
                accountsTransferAllowanceTo: 0x23f4e3a1,
            },
        },
    },
});

export { useNetworkVariable, useNetworkVariables, networkConfig };
