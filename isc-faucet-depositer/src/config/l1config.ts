// Copyright (c) 2025 IOTA Stiftung
// SPDX-License-Identifier: Apache-2.0

import { createNetworkConfig } from '@iota/dapp-kit';
import { CONFIG } from './config';

const { networkConfig, useNetworkVariable, useNetworkVariables } = createNetworkConfig({
    [CONFIG.L1.networkName]: {
        url: CONFIG.L1.rpcUrl,
        variables: {
            faucet: CONFIG.L1.faucetUrl,
            chain: {
                chainId: CONFIG.L1.chainId,
                packageId: CONFIG.L1.packageId,
                coreContractAccounts: parseInt(CONFIG.L1.coreContractAccounts, 16),
                accountsTransferAllowanceTo: parseInt(CONFIG.L1.accountsTransferAllowanceTo, 16),
            },
        },
    },
});

export { useNetworkVariable, useNetworkVariables, networkConfig };
