import { useAccount, useBalance as useBalanceL2 } from 'wagmi';
import { useBalance as useBalanceL1 } from './useBalance';
import { formatEther } from 'viem';
import { useCurrentAccount } from '@iota/dapp-kit';
import { useBridgeStore } from '../lib/stores';
import { formatIOTAFromNanos, parseAmount } from '../lib/utils';
import { useBuildL1DepositTransaction } from './useBuildL1DepositTransaction';
import { L1_BASE_GAS_BUDGET, L2_FROM_L1_GAS_BUDGET } from 'isc-client';
import { useL2GasEstimate } from './useL2GasEstimate';
import { MINIMUM_SEND_AMOUNT } from '../lib/constants';
import { IOTA_DECIMALS } from '@iota/iota-sdk/utils';

const GENERIC_EVM_ADDRESS = '0x1111111111111111111111111111111111111111';
const GENERIC_IOTA_ADDRESS = '0x1111111111111111111111111111111111111111111111111111111111111111';

export function useGetCurrentAvailableBalance(): {
    availableBalance: bigint;
    isLoading: boolean;
    formattedAvailableBalance: string;
} {
    const layer1Account = useCurrentAccount();
    const layer2Account = useAccount();
    const receivingAddress = useBridgeStore((state) => state.receivingAddress);
    const isFromLayer1 = useBridgeStore((state) => state.isFromLayer1);
    const isDepositAddressManualInput = useBridgeStore(
        (state) => state.isDepositAddressManualInput,
    );
    const layer1Address =
        isDepositAddressManualInput && !isFromLayer1 ? receivingAddress : layer1Account?.address;
    const layer2Address =
        isDepositAddressManualInput && isFromLayer1 ? receivingAddress : layer2Account?.address;

    const { data: layer1BalanceData, isLoading: isLoadingL1 } = useBalanceL1(
        layer1Address as `0x${string}`,
    );
    const layer1TotalBalance = layer1BalanceData?.totalBalance
        ? BigInt(layer1BalanceData?.totalBalance)
        : 0n;

    const { data: maxAmountDataL1, isLoading: isLoadingL1Transaction } =
        useBuildL1DepositTransaction({
            receivingAddress: layer2Address ?? GENERIC_EVM_ADDRESS,
            amount: layer1TotalBalance - L1_BASE_GAS_BUDGET,
        });
    const gasEstimationIOTA = BigInt(maxAmountDataL1?.gasSummary?.budget || 0);
    const isAvalableAmountLargerThanMinimumSendAmount =
        layer1TotalBalance > (parseAmount(MINIMUM_SEND_AMOUNT.toString(), IOTA_DECIMALS) ?? 0n);
    const layer1AvailableBalance = isAvalableAmountLargerThanMinimumSendAmount
        ? layer1TotalBalance - gasEstimationIOTA - L2_FROM_L1_GAS_BUDGET
        : layer1TotalBalance;

    const { data: layer2BalanceData, isLoading: isLoadingL2 } = useBalanceL2({
        address: layer2Address as `0x${string}`,
        query: {
            refetchInterval: 2000,
        },
    });
    const layer2TotalBalance = layer2BalanceData?.value ?? 0n;
    const { data: gasEstimationDataEVM, isLoading: isLoadingGasEstimationEVM } = useL2GasEstimate({
        address: layer1Address ?? GENERIC_IOTA_ADDRESS,
        amount: MINIMUM_SEND_AMOUNT.toString(),
    });
    const gasEstimationEVM = gasEstimationDataEVM ?? 0n;
    const layer2AvailableBalance =
        layer2TotalBalance >= gasEstimationEVM
            ? layer2TotalBalance - gasEstimationEVM
            : layer2TotalBalance;
    if (
        (isFromLayer1 && (isLoadingL1 || isLoadingL1Transaction)) ||
        (!isFromLayer1 && (isLoadingL2 || isLoadingGasEstimationEVM))
    ) {
        return { availableBalance: BigInt(0), isLoading: true, formattedAvailableBalance: '0' };
    }

    const availableBalance = isFromLayer1 ? layer1AvailableBalance : layer2AvailableBalance;

    return {
        availableBalance,
        isLoading: isFromLayer1 ? isLoadingL1 : isLoadingL2,
        formattedAvailableBalance: isFromLayer1
            ? formatIOTAFromNanos(availableBalance)
            : formatEther(availableBalance),
    };
}
