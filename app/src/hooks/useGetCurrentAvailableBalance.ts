import { useAccount, useBalance as useBalanceL2 } from 'wagmi';
import { useBalance as useBalanceL1 } from './useBalance';
import { formatEther } from 'viem';
import { useCurrentAccount } from '@iota/dapp-kit';
import { useBridgeStore } from '../lib/stores';
import { formatIOTAFromNanos } from '../lib/utils';
import { useBuildL1DepositTransaction } from './useBuildL1DepositTransaction';
import { L1_BASE_GAS_BUDGET, L2_FROM_L1_GAS_BUDGET } from 'isc-client';
import { useL2GasEstimate } from './useL2GasEstimate';

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
    const layer1TotalBalance = layer1Balance?.totalBalance
        ? BigInt(layer1Balance?.totalBalance)
        : BigInt(0);
    console.log('layer1TotalBalance:', layer1TotalBalance);
    const {
        data: maxAmountDataL1,
        isPending: isBuildingTransaction,
        error,
    } = useBuildL1DepositTransaction({
        receivingAddress: layer2Account?.address,
        amount: layer1TotalBalance - L1_BASE_GAS_BUDGET,
    });
    console.log('maxAmountDataL1:', maxAmountDataL1, error, isBuildingTransaction);
    const { data: layer2Balance, isLoading: isLoadingL2 } = useBalanceL2({
        address: layer2Account?.address,
        query: {
            refetchInterval: 2000,
        },
    });
    const layer2TotalBalance = layer2Balance?.value || BigInt(0);
    const { data: gasEstimationEVM, isPending: isGasEstimationLoading } = useL2GasEstimate({
        address: layer1Account?.address || '',
        amount: layer2TotalBalance.toString(),
    });
    // console.log('isFromLayer1:', isFromLayer1, isLoadingL1, layer1Balance, layer1TotalBalance);
    // console.log('layer2TotalBalance:', isLoadingL2, layer2Balance, layer2TotalBalance);
    console.log('isBuildingTransaction:', isBuildingTransaction, isGasEstimationLoading);
    if ((isFromLayer1 && isLoadingL1) || (!isFromLayer1 && isLoadingL2)) {
        return { availableBalance: BigInt(0), isLoading: true, formattedAvailableBalance: '0' };
    }
    const gasEstimationIOTA = BigInt(maxAmountDataL1?.gasSummary?.budget || 0);
    const layer1AvailableBalance = layer1TotalBalance - gasEstimationIOTA - L2_FROM_L1_GAS_BUDGET;

    const layer2AvailableBalance = layer2TotalBalance - (gasEstimationEVM ?? 0n);
    const availableBalance = isFromLayer1 ? layer1AvailableBalance : layer2AvailableBalance;

    return {
        availableBalance,
        isLoading: isFromLayer1 ? isLoadingL1 : isLoadingL2,
        formattedAvailableBalance: isFromLayer1
            ? formatIOTAFromNanos(availableBalance)
            : formatEther(availableBalance),
    };
}
