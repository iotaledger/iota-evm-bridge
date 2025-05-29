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

interface useGetCurrentAvailableBalanceProps {
    receivingAddress?: string;
}

export function useGetCurrentAvailableBalance({
    receivingAddress = undefined,
}: useGetCurrentAvailableBalanceProps = {}): {
    availableBalance: bigint;
    isLoading: boolean;
    formattedAvailableBalance: string;
} {
    const layer1Account = useCurrentAccount();
    const layer2Account = useAccount();
    const isFromLayer1 = useBridgeStore((state) => state.isFromLayer1);

    const layer1Address =
        receivingAddress && !isFromLayer1 ? receivingAddress : layer1Account?.address;
    const layer2Address =
        receivingAddress && isFromLayer1 ? receivingAddress : layer2Account?.address;

    // Layer 1 balance
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

    // Check if the available amount is larger than the minimum send amount
    const isLayer1BalanceAboveMinimumSendAmount =
        layer1TotalBalance > (parseAmount(MINIMUM_SEND_AMOUNT.toString(), IOTA_DECIMALS) ?? 0n);

    // Calculate the Layer 1 available balance, subtracting gas costs if the amount is valid
    const layer1AvailableBalance = isLayer1BalanceAboveMinimumSendAmount
        ? layer1TotalBalance - gasEstimationIOTA - L2_FROM_L1_GAS_BUDGET
        : layer1TotalBalance;

    // Layer 2 balance
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

    // Calculate the Layer 2 available balance, subtracting gas costs if the amount is valid
    const layer2AvailableBalance =
        layer2TotalBalance >= gasEstimationEVM
            ? layer2TotalBalance - gasEstimationEVM
            : layer2TotalBalance;

    const availableBalance = isFromLayer1 ? layer1AvailableBalance : layer2AvailableBalance;

    const isLoading = isFromLayer1
        ? isLoadingL1 || isLoadingL1Transaction
        : isLoadingL2 || isLoadingGasEstimationEVM;

    const formattedAvailableBalance = isFromLayer1
        ? formatIOTAFromNanos(availableBalance)
        : formatEther(availableBalance);
    return {
        availableBalance,
        isLoading,
        formattedAvailableBalance,
    };
}
