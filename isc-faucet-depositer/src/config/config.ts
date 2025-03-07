// Copyright (c) 2025 IOTA Stiftung
// SPDX-License-Identifier: Apache-2.0

import { z } from 'zod';

const VITE_PREFIX = 'VITE_';
const HEX_REGEX = /^0x[0-9a-fA-F]+$/;

const envSchema = z.object({
    L1_NETWORK_NAME: z.string(),
    L1_RPC_URL: z.string().url(),
    L1_FAUCET_URL: z.string().url(),
    L1_CHAIN_ID: z.string(),
    L1_PACKAGE_ID: z.string(),
    L1_CORE_CONTRACT_ACCOUNTS: z
        .string()
        .regex(HEX_REGEX, 'Must be a valid hex string starting with 0x'),
    L1_ACCOUNTS_TRANSFER_ALLOWANCE_TO: z
        .string()
        .regex(HEX_REGEX, 'Must be a valid hex string starting with 0x'),
    L2_RPC_URL: z.string().url(),
    L2_CHAIN_ID: z.preprocess(
        (val) => (val !== undefined ? Number(val) : undefined),
        z.number().int().positive(),
    ),
    L2_CHAIN_NAME: z.string(),
    L2_CHAIN_CURRENCY: z.string(),
    L2_CHAIN_DECIMALS: z.preprocess(
        (val) => (val !== undefined ? Number(val) : undefined),
        z.number().int().positive().optional().default(3000),
    ),
    L2_CHAIN_EXPLORER_NAME: z.string(),
    L2_CHAIN_EXPLORER_URL: z.string(),
    L2_WAGMI_APP_NAME: z.string(),
    L2_WALLET_CONNECT_PROJECT_ID: z.string(),
});

type EnvConfig = z.infer<typeof envSchema>;

function loadEnv(): EnvConfig {
    const rawEnv = import.meta.env;

    const processedEnv: Record<string, unknown> = {};

    Object.entries(rawEnv).forEach(([key, value]) => {
        if (key.startsWith(VITE_PREFIX)) {
            const unprefixedKey = key.slice(VITE_PREFIX.length);
            processedEnv[unprefixedKey] = value;
        }
    });

    try {
        return envSchema.parse(processedEnv);
    } catch (error) {
        if (error instanceof z.ZodError) {
            const missingVars = error.issues
                .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
                .join('\n');
            throw new Error(`Missing required configuration:\n${missingVars}`);
        }

        throw error;
    }
}

export const CONFIG = loadEnv();

export type Config = typeof CONFIG;
