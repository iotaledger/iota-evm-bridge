// Copyright (c) 2025 IOTA Stiftung
// SPDX-License-Identifier: Apache-2.0

import { Chain } from '@rainbow-me/rainbowkit';
import { CONFIG } from './config';

export const L2_CHAIN_CONFIG: Chain = {
    id: CONFIG.L2.chainId,
    name: CONFIG.L2.chainName,
    nativeCurrency: {
        name: CONFIG.L2.chainCurrency,
        symbol: CONFIG.L2.chainCurrency,
        decimals: CONFIG.L2.chainDecimals,
    },
    rpcUrls: {
        default: {
            http: [CONFIG.L2.rpcUrl],
        },
    },
    blockExplorers: {
        default: {
            name: CONFIG.L2.chainExplorerName,
            url: CONFIG.L2.chainExplorerUrl,
        },
    },
};

export const L2_WAGMI_CONFIG = {
    appName: CONFIG.L2.wagmiAppName,
    projectId: CONFIG.L2.walletConnectProjectId,
    ssr: true,
};
