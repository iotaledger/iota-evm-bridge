// Copyright (c) 2025 IOTA Stiftung
// SPDX-License-Identifier: Apache-2.0

import { Chain } from '@rainbow-me/rainbowkit';
import { CONFIG } from './config';

export const L2_CHAIN_CONFIG: Chain = {
    id: CONFIG.L2_CHAIN_ID,
    name: CONFIG.L2_CHAIN_NAME,
    nativeCurrency: {
        name: CONFIG.L2_CHAIN_CURRENCY,
        symbol: CONFIG.L2_CHAIN_CURRENCY,
        decimals: CONFIG.L2_CHAIN_DECIMALS,
    },
    rpcUrls: {
        default: {
            http: [CONFIG.L2_RPC_URL],
        },
    },
    blockExplorers: {
        default: {
            name: CONFIG.L2_CHAIN_EXPLORER_NAME,
            url: CONFIG.L2_CHAIN_EXPLORER_URL,
        },
    },
};

export const L2_WAGMI_CONFIG = {
    appName: CONFIG.L2_WAGMI_APP_NAME,
    projectId: CONFIG.L2_WALLET_CONNECT_PROJECT_ID,
    ssr: true,
};
