import { EvmRpcClient } from 'isc-client';
import { useContext, createContext } from 'react';

type EvmRpcClientContextType = {
    evmRpcClient: EvmRpcClient | null;
};

export const EvmRpcClientContext = createContext<EvmRpcClientContextType | null>(null);

export function useEvmRpcClient(): EvmRpcClientContextType {
    const context = useContext(EvmRpcClientContext);
    if (!context) {
        throw new Error('useEvmRpcClient must be used within a EvmRpcClientProvider');
    }
    return context;
}
