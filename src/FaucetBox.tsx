// Copyright (c) Mysten Labs, Inc.
// Modifications Copyright (c) 2024 IOTA Stiftung
// SPDX-License-Identifier: Apache-2.0

import {
  useCurrentAccount,
  useSignAndExecuteTransaction,
  useIotaClient,
  useIotaClientQuery,
} from "@iota/dapp-kit";
import type { IotaObjectData } from "@iota/iota-sdk/client";
import { Button, Flex, Text, TextField } from "@radix-ui/themes";
import { BaseTokenType, createRequest } from "./lib/send_request";
import { CHAIN_ID, FAUCET_URL, PACKAGE_ID } from "./constants";
import { requestIotaFromFaucetV0 } from "@iota/iota-sdk/faucet";
import { ACCOUNTS_TRANSFER_ALLOWANCE_TO, CORE_CONTRACT_ACCOUNTS, IscAgentID } from "./lib/generated";
import { bcs } from "@iota/iota-sdk/bcs";
import { useState } from "react";

export function FaucetBox({ id }: { id: string }) {
  const iotaClient = useIotaClient();
  const currentAccount = useCurrentAccount();
  const [address, setAddress] = useState('');

  const { mutate: signAndExecute } = useSignAndExecuteTransaction({
    execute: async ({ bytes, signature }) =>
      await iotaClient.executeTransactionBlock({
        transactionBlock: bytes,
        signature,
        options: {
          showRawEffects: true,
          showEffects: true,
        },
      }),
  });

  const { data, isPending, error, refetch } = useIotaClientQuery("getObject", {
    id,
    options: {
      showContent: true,
      showOwner: true,
    },
  });

  const sendFunds = async () => {
    const faucetResult = await requestIotaFromFaucetV0({
      host: FAUCET_URL,
      recipient: currentAccount?.address!,
    });

    const amount = faucetResult.transferredGasObjects[0].amount - 10000000;

    console.log(faucetResult, amount)

    const agentID = IscAgentID.serialize({
      EthereumAddressAgentID: {
        chainID: bcs.fixedArray(32, bcs.u8()).fromHex(CHAIN_ID),
        eth: bcs.fixedArray(20, bcs.u8()).fromHex(address)
      },
    }).toBytes();

    console.log(agentID);

    const tx = createRequest({
      anchorId: CHAIN_ID,
      packageID: PACKAGE_ID,
      amountToSend: amount - 10000000,
      message: {
        contract: CORE_CONTRACT_ACCOUNTS,
        function: ACCOUNTS_TRANSFER_ALLOWANCE_TO,
        args: [
          // accounts.transferAllowanceTo expects one argument (The receipient address (This can be a L2 or EVM address))
          agentID,
        ]
      },
      allowanceBalances: [
        amount,
      ],
      allowanceCoinTypes: [
        BaseTokenType
      ],
      onchainGasBudget: 1000000,
    });

    console.log(await tx.toJSON());

    signAndExecute(
      {
        transaction: tx,
      },
      {
        onSuccess: async (data, variables, context) => {
          console.log(data, variables)
          await refetch();
        },
      }
    );
  }

  if (isPending) return <Text>Loading...</Text>;

  if (error) return <Text>Error: {error.message}</Text>;

  if (!data.data) return <Text>Not found</Text>;

  return (
    <>

      <Flex direction="column" gap="2">
        <Flex direction="row" gap="2">
          <TextField.Root placeholder="EVM Address" value={address} onChange={(event) => setAddress(event.target.value)}></TextField.Root>
          <Button onClick={() => sendFunds()}>
            Request funds
          </Button>
        </Flex>

        <Text>Block Index: {getAnchorFields(data.data)?.state_index}</Text>

      </Flex>
    </>
  );
}
function getAnchorFields(data: IotaObjectData) {
  if (data.content?.dataType !== "moveObject") {
    return null;
  }

  return data.content.fields as { state_index: number; owner: string };
}
