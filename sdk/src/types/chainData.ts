import { z } from 'zod';

export const ChainDataSchema = z.object({
    packageId: z.string(),
    coreContractAccounts: z.number(),
    accountsTransferAllowanceTo: z.number(),
    chainId: z.string(),
});

export type ChainData = z.infer<typeof ChainDataSchema>;
