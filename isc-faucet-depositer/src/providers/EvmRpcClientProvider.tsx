'use client';

import { EvmRpcClientContext, useEvmRpcClient } from '../contexts';

export type EvmRpcClientProviderProps = {
    baseUrl: string;
};
export const EvmRpcClientProvider: React.FC<React.PropsWithChildren<EvmRpcClientProviderProps>> = ({
    children,
    baseUrl,
}) => {
    const { evmRpcClient } = useEvmRpcClient(baseUrl);

    return (
        <EvmRpcClientContext.Provider value={{ evmRpcClient }}>
            {children}
        </EvmRpcClientContext.Provider>
    );
};
