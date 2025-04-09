// Copyright (c) 2025 IOTA Stiftung
// SPDX-License-Identifier: Apache-2.0

import { z } from 'zod';
import { config } from 'dotenv';

const HEX_REGEX = /^0x[0-9a-fA-F]+$/;

const envSchema = z.object({
    L1: z.object({
        networkName: z.string(),
        rpcUrl: z.string().url(),
        faucetUrl: z.string().url(),
        chainId: z.string(),
        packageId: z.string(),
        accountsContract: z
            .string()
            .regex(HEX_REGEX, 'Must be a valid hex string starting with 0x')
            .transform(x => Number(x)),
        accountsTransferAllowanceTo: z
            .string()
            .regex(HEX_REGEX, 'Must be a valid hex string starting with 0x')
            .transform(x => Number(x)),
    }),
    L2: z.object({
        chainName: z.string(),
        chainCurrency: z.string(),
        rpcUrl: z.string().url(),
        chainId: z.preprocess(
            (val) => (val !== undefined ? Number(val) : undefined),
            z.number().int().positive(),
        ),
        chainDecimals: z.preprocess(
            (val) => (val !== undefined ? Number(val) : undefined),
            z.number().int().positive(),
        ),
        chainExplorerName: z.string(),
        chainExplorerUrl: z.string(),
        wagmiAppName: z.string(),
        walletConnectProjectId: z.string(),
        iscContractAddress: z
            .string()
            .regex(
                HEX_REGEX,
                'Must be a valid hex string starting with 0x',
            ) as z.ZodType<`0x${string}`>,
        evmRpcUrl: z.string().url(),
    }),
});

type EnvConfig = z.infer<typeof envSchema>;

function loadEnv(): EnvConfig {
    config();
    const rawEvmToolkitConfig = process.env.VITE_EVM_BRIDGE_CONFIG as string;

    let evmToolkitConfig: Record<string, unknown> = {};

    try {
        evmToolkitConfig = JSON.parse(rawEvmToolkitConfig);
    } catch (error) {
        throw new Error(
            `Failed to parse EVM Toolkit config JSON env var! ${(error as Error)?.message}`,
        );
    }

    try {
        return envSchema.parse(evmToolkitConfig);
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
