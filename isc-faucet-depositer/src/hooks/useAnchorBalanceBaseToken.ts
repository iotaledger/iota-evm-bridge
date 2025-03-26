import { useQuery } from '@tanstack/react-query';
import { useEvmRpcClientContext } from '../contexts';

export function useAnchorBalanceBaseToken(address: string, chainId: string) {
    const { evmRpcClient } = useEvmRpcClientContext();

    return useQuery({
        queryKey: ['anchor-balance-base-token', address, chainId, evmRpcClient?.baseUrl],
        queryFn: async () => {
            if (!evmRpcClient?.baseUrl) return {};

            return await evmRpcClient.getBalanceBaseToken(address, chainId);
        },
        enabled: !!address,
        staleTime: 1000 * 60 * 5,
    });
}
