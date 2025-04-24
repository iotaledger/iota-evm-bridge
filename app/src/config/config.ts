// Copyright (c) 2025 IOTA Stiftung
// SPDX-License-Identifier: Apache-2.0

import { z } from 'zod';
import { Config, envSchema } from './config.schema';

function loadConfig(): Config {
    const rawEvmToolkitConfig = import.meta.env.VITE_EVM_BRIDGE_CONFIG;

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

export const CONFIG = getNetwork(getDefaultNetwork());

function getNetwork(network: string) {
    const config = loadConfig();
    return config[network]
}

export function getDefaultNetwork(): string {
    return import.meta.env.VITE_EVM_BRIDGE_DEFAULT_NETWORK
}