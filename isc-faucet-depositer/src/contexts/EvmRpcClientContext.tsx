import { useContext, createContext, useMemo } from 'react';
import { EvmRpcClient } from '../api';

type EvmRpcClientContextType = {
    evmRpcClient: EvmRpcClient | null;
};

export const EvmRpcClientContext = createContext<EvmRpcClientContextType | null>(null);

export function useEvmRpcClientContext(): EvmRpcClientContextType {
    const context = useContext(EvmRpcClientContext);
    if (!context) {
        throw new Error('useEvmRpcClient must be used within a EvmRpcClientProvider');
    }
    return context;
}

export function useEvmRpcClient(baseUrl: string) {
    const evmRpcClient = useMemo(() => {
        return new EvmRpcClient(baseUrl);
    }, [baseUrl]);

    return {
        evmRpcClient,
    };
}
