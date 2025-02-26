// Copyright (c) 2025 IOTA Stiftung
// SPDX-License-Identifier: Apache-2.0

import { createNetworkConfig } from '@iota/dapp-kit';

const { networkConfig, useNetworkVariable, useNetworkVariables } = createNetworkConfig({
    alphanet: {
        url: 'https://api.iota-rebased-alphanet.iota.cafe',
        variables: {
            faucet: 'https://faucet.iota-rebased-alphanet.iota.cafe/gas',
            chain: {
                chainId: '0x2edd9b83931b8fde8b210c21ab5444b9c456e20935c855a6e8319e685a1b1014',
                packageId: '0xbdf426ba9f2df0fb84d28ea87395f0d353a3138ca72e37df51f15ac0d9a0325b',
                coreContractAccounts: 0x3c4b5e02,
                accountsTransferAllowanceTo: 0x23f4e3a1,
            },
        },
    },
});

export { useNetworkVariable, useNetworkVariables, networkConfig };
