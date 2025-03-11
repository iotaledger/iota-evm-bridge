// Copyright (c) 2025 IOTA Stiftung
// SPDX-License-Identifier: Apache-2.0

import { create } from 'zustand';

interface BridgeState {
    isFromLayer1: boolean;
    toggleBridgeDirection: () => void;
    isDepositAddressManualInput: boolean;
    toggleIsDepositAddressManualInput: () => void;
    gasEstimation: string | null;
    setGasEstimation: (gasEstimation: string | null) => void;
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
