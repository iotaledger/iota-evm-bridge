import { useQuery } from '@tanstack/react-query';
import { useEvmRpcClientContext } from '../contexts';

export function useAnchorBalanceBaseToken(address: string) {
    const { evmRpcClient } = useEvmRpcClientContext();

    return useQuery({
        queryKey: ['anchor-balance-base-token', address, evmRpcClient?.baseUrl],
        queryFn: async () => {
            if (!evmRpcClient?.baseUrl) return {};

            return await evmRpcClient.getBalanceBaseToken(address);
        },
        enabled: !!address,
        staleTime: 1000 * 60 * 5,
    });
}
