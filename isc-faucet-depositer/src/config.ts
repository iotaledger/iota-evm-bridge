// Copyright (c) 2025 IOTA Stiftung
// SPDX-License-Identifier: Apache-2.0

export const NETWORK_NAME = import.meta.env.VITE_NETWORK_NAME;
export const NETWORK_RPC_L2 = import.meta.env.VITE_NETWORK_RPC_L2;
export const WALLET_CONNECT_L2_PROJECT_ID = import.meta.env.VITE_WALLET_CONNECT_L2_PROJECT_ID;

export const L2_TESTNET = {
    id: 1075,
    name: 'IOTA EVM Testnet',
    nativeCurrency: {
        name: 'IOTA',
        symbol: 'IOTA',
        decimals: 18,
    },
    rpcUrls: {
        default: {
            http: [NETWORK_RPC_L2],
        },
    },
    blockExplorers: {
        default: {
            name: 'IOTA EVM Testnet explorer',
            url: 'https://explorer.evm.testnet.iotaledger.net',
        },
    },
};
export const L2_MAINNET = {
    id: 1072,
    name: 'IOTA EVM',
    nativeCurrency: {
        name: 'IOTA',
        symbol: 'IOTA',
        decimals: 18,
    },
    rpcUrls: {
        default: {
            http: [NETWORK_RPC_L2],
        },
    },
    blockExplorers: {
        default: {
            name: 'IOTA EVM explorer',
            url: 'https://explorer.evm.iota.org',
        },
    },
};
export const L2_DEFAULT_NETWORK = NETWORK_NAME === 'mainnet' ? L2_MAINNET : L2_TESTNET;

export const WAGMI_L2_CONFIG = {
    appName: 'IOTA Bridge',
    projectId: WALLET_CONNECT_L2_PROJECT_ID,
    ssr: true,
};
