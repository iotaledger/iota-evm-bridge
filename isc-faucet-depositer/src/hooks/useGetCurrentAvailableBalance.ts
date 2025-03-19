import { useAccount, useBalance as useBalanceL2 } from 'wagmi';
import { useBalance as useBalanceL1 } from './useBalance';
import { formatEther } from 'viem';
import { useCurrentAccount } from '@iota/dapp-kit';
import { useBridgeStore } from '../lib/stores';
import { formatIOTAFromNanos } from '../lib/utils';

export function useGetCurrentAvailableBalance(): {
    availableBalance: bigint;
    isLoading: boolean;
    formattedAvailableBalance: string;
} {
    const layer1Account = useCurrentAccount();
    const layer2Account = useAccount();
    const isFromLayer1 = useBridgeStore((state) => state.isFromLayer1);

    const { data: layer1Balance, isLoading: isLoadingL1 } = useBalanceL1(
        layer1Account?.address || '',
    );
    const { data: layer2Balance, isLoading: isLoadingL2 } = useBalanceL2({
        address: layer2Account?.address,
    });

    if ((isFromLayer1 && isLoadingL1) || (!isFromLayer1 && isLoadingL2)) {
        return { availableBalance: BigInt(0), isLoading: true, formattedAvailableBalance: '0' };
    }

    const availableBalance = isFromLayer1
        ? layer1Balance?.totalBalance
            ? BigInt(layer1Balance?.totalBalance)
            : BigInt(0)
        : layer2Balance?.value || BigInt(0);

    return {
        availableBalance,
        isLoading: isFromLayer1 ? isLoadingL1 : isLoadingL2,
        formattedAvailableBalance: isFromLayer1
            ? formatIOTAFromNanos(availableBalance)
            : formatEther(availableBalance),
    };
}
