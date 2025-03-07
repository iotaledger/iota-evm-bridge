import { create } from 'zustand';
import type { Transaction } from '@iota/iota-sdk/transactions';

interface BridgeState {
    isFromLayer1: boolean;
    toggleBridgeDirection: () => void;
    isDepositAddressManualInput: boolean;
    toggleIsDepositAddressManualInput: () => void;
    layer1BridgeTransaction: Transaction | null;
    setLayer1BridgeTransaction: (value: Transaction) => void;
    gasEstimation: string | null;
    setGasEstimation: (gasEstimation: string) => void;
    isTransactionLoading: boolean;
    setIsTransactionLoading: (value: boolean) => void;
}

export const useBridgeStore = create<BridgeState>((set, get) => {
    return {
        isFromLayer1: true,
        toggleBridgeDirection: () => {
            set({
                isFromLayer1: !get().isFromLayer1,
                gasEstimation: null,
            });
        },

        isDepositAddressManualInput: false,
        toggleIsDepositAddressManualInput: () => {
            set({ isDepositAddressManualInput: !get().isDepositAddressManualInput });
        },

        layer1BridgeTransaction: null,
        setLayer1BridgeTransaction: (value: Transaction) => {
            set({ layer1BridgeTransaction: value });
        },

        gasEstimation: null,
        setGasEstimation: (value) => {
            set({ gasEstimation: value });
        },

        isTransactionLoading: false,
        setIsTransactionLoading: (value: boolean) => {
            set({ isTransactionLoading: value });
        },
    };
});
