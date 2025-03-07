// Copyright (c) 2025 IOTA Stiftung
// SPDX-License-Identifier: Apache-2.0

import { createNetworkConfig } from '@iota/dapp-kit';
import { CONFIG } from './config';

const { networkConfig, useNetworkVariable, useNetworkVariables } = createNetworkConfig({
    [CONFIG.L1_NETWORK_NAME]: {
        url: CONFIG.L1_RPC_URL,
        variables: {
            faucet: CONFIG.L1_FAUCET_URL,
            chain: {
                chainId: CONFIG.L1_CHAIN_ID,
                packageId: CONFIG.L1_PACKAGE_ID,
                coreContractAccounts: parseInt(CONFIG.L1_CORE_CONTRACT_ACCOUNTS, 16),
                accountsTransferAllowanceTo: parseInt(CONFIG.L1_ACCOUNTS_TRANSFER_ALLOWANCE_TO, 16),
            },
        },
    },
});

export { useNetworkVariable, useNetworkVariables, networkConfig };
