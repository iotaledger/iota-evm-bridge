// Copyright (c) 2025 IOTA Stiftung
// SPDX-License-Identifier: Apache-2.0

import { createNetworkConfig } from '@iota/dapp-kit';

const { networkConfig, useNetworkVariable, useNetworkVariables } = createNetworkConfig({
    alphanet: {
        url: 'https://api.iota-rebased-alphanet.iota.cafe',
        variables: {
            faucet: 'https://faucet.iota-rebased-alphanet.iota.cafe/gas',
            chain: {
                chainId: '0xabae5764fd5698f4e8a57f1ca2d5e2401088de7669c1abef79b2ba8257523128',
                packageId: '0xfb608841f6de951daa39444bba0227abdfedc5bdc130b975298fa4ef97fa04c0',
                coreContractAccounts: 0x3c4b5e02,
                accountsTransferAllowanceTo: 0x23f4e3a1,
            },
        },
    },
});

export { useNetworkVariable, useNetworkVariables, networkConfig };
