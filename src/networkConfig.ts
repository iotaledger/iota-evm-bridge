// Copyright (c) Mysten Labs, Inc.
// Modifications Copyright (c) 2024 IOTA Stiftung
// SPDX-License-Identifier: Apache-2.0

import {
  NETWORK_URL,
  PACKAGE_ID,
} from "./constants.ts";

import { createNetworkConfig } from "@iota/dapp-kit";

const { networkConfig, useNetworkVariable, useNetworkVariables } =
  createNetworkConfig({
    alphanet: {
      url: NETWORK_URL,
      variables: {
        counterPackageId: PACKAGE_ID,
      },
    },

  });

export { useNetworkVariable, useNetworkVariables, networkConfig };
