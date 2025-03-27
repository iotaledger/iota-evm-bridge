import { z } from 'zod';
import { envSchema, type Config } from '../../src/config/config.schema';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({
    path: [path.join(__dirname, '..', '..', '.env')],
});

export function loadConfig(): Config {
    const rawEvmToolkitConfig = process.env.VITE_EVM_TOOLKIT_CONFIG;

    if (rawEvmToolkitConfig === undefined) {
        throw new Error('Missing EVM Toolkit config JSON env var!');
    }

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

export const CONFIG = loadConfig();
