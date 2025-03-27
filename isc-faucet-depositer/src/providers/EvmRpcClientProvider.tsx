'use client';

import { useMemo } from 'react';
import { EvmRpcClientContext } from '../contexts';
import { EvmRpcClient } from 'isc-client';

export type EvmRpcClientProviderProps = {
    baseUrl: string;
};
export const EvmRpcClientProvider: React.FC<React.PropsWithChildren<EvmRpcClientProviderProps>> = ({
    children,
    baseUrl,
}) => {
    const evmRpcClient = useMemo(() => {
        return new EvmRpcClient(baseUrl);
    }, [baseUrl]);

    return (
        <EvmRpcClientContext.Provider value={{ evmRpcClient }}>
            {children}
        </EvmRpcClientContext.Provider>
    );
};
