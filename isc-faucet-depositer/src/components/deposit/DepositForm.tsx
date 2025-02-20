// Copyright (c) 2025 IOTA Stiftung
// SPDX-License-Identifier: Apache-2.0

import {
    Button,
    ButtonHtmlType,
    ButtonPill,
    ButtonUnstyled,
    Input,
    InputType,
    KeyValueInfo,
} from '@iota/apps-ui-kit';
import { useCurrentAccount, useCurrentWallet } from '@iota/dapp-kit';
import { type ComponentProps, forwardRef, useCallback, useEffect, useState } from 'react';
import { type SubmitHandler, useFormContext } from 'react-hook-form';
import { WalletConnectInput } from '../';
import { useBalance } from '../../hooks/useBalance';
import { DepositFormData } from '../../lib/schema/bridgeForm.schema';
import { formatIOTAFromNanos } from '../../lib/utils';
import BigNumber from 'bignumber.js';
import { useAccount } from 'wagmi';

interface DepositFormProps {
    send: () => void;
    gasEstimation: number | null;
    isPayingAllBalance: boolean;
}
export function DepositForm({ send, gasEstimation, isPayingAllBalance }: DepositFormProps) {
    const { isConnected } = useCurrentWallet();
    const account = useCurrentAccount();
    const { data: balance, isLoading: isLoadingBalance } = useBalance(account?.address || '');

    const {
        trigger,
        register,
        handleSubmit,
        getValues,
        formState: { errors, isValid },
        setValue,
        watch,
    } = useFormContext<DepositFormData>();
    const values = watch();

    useEffect(() => {
        const isFormIncomplete = Object.values(getValues()).some(
            (value) => value === '' || value === undefined,
        );

        // Trigger manual form revalidation if the available balance loaded after the form is already filled
        if (!isLoadingBalance && !isFormIncomplete) {
            trigger();
        }
    }, [isLoadingBalance, trigger, getValues]);

    const onSubmit: SubmitHandler<DepositFormData> = useCallback(() => {
        send();
        setValue('depositAmount', '');
    }, [send, setValue]);

    function handleMaxAmountClick() {
        if (!balance) {
            return;
        }
        setValue('depositAmount', formatIOTAFromNanos(BigInt(balance.totalBalance)), {
            shouldValidate: true,
        });
    }

    const isMaxButtonDisabled = !account?.address;

    const depositAmountErrorMessage =
        values.depositAmount !== '' ? errors['depositAmount']?.message : undefined;

    const receivingAddressErrorMessage =
        values.receivingAddress !== '' ? errors.receivingAddress?.message : undefined;

    const receivingAmountDisplay = (() => {
        if (!values.depositAmount || !gasEstimation) {
            return '--';
        } else if (isPayingAllBalance) {
            const receivingAmount = new BigNumber(values.depositAmount).minus(gasEstimation);
            return receivingAmount.isLessThanOrEqualTo(0) ? null : receivingAmount.toString();
        } else {
            return values.depositAmount;
        }
    })();

    const {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        onBlur: _onBlur,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        onChange: _onChange,
        ...registerDepositAmount
    } = register('depositAmount');
    return (
        <form className="flex flex-col gap-y-md--rs" onSubmit={handleSubmit(onSubmit)}>
            <Input
                label="Amount"
                type={InputType.NumericFormat}
                prefix={isPayingAllBalance ? '~ ' : undefined}
                value={values.depositAmount}
                errorMessage={depositAmountErrorMessage}
                {...registerDepositAmount}
                data-testid="bridge-amount"
                onValueChange={(values) => {
                    setValue('depositAmount', values.value, {
                        shouldValidate: true,
                        shouldTouch: true,
                    });
                }}
                maxLength={20}
                trailingElement={
                    <ButtonPill onClick={handleMaxAmountClick} disabled={isMaxButtonDisabled}>
                        Max
                    </ButtonPill>
                }
            />
            <div className="relative flex flex-col gap-y-md--rs">
                {isConnected ? (
                    <Input
                        type={InputType.Text}
                        label="From IOTA"
                        name="senderAddress"
                        value={account?.address}
                        key={account?.address}
                        readOnly
                    />
                ) : (
                    <WalletConnectInput label="From IOTA" isLayer1 />
                )}

                <DestinationInput
                    type={InputType.Text}
                    errorMessage={receivingAddressErrorMessage}
                    {...register('receivingAddress')}
                    data-testid="receive-address"
                />
            </div>

            <div className="flex flex-col p-md">
                <KeyValueInfo
                    fullwidth
                    keyText="Est. Gas Fees"
                    supportingLabel="IOTA"
                    value={gasEstimation ?? '--'}
                />
                <KeyValueInfo
                    fullwidth
                    keyText="You Receive"
                    supportingLabel="IOTA"
                    value={receivingAmountDisplay}
                />
            </div>

            <Button
                text="Bridge Assets"
                htmlType={ButtonHtmlType.Submit}
                disabled={
                    !isConnected ||
                    !isValid ||
                    !!Object.values(values).some((value) => value === '')
                }
            />
        </form>
    );
}

type InputProps = Omit<ComponentProps<typeof Input>, 'label' | 'caption' | 'required'>;
const DestinationInput = forwardRef<HTMLInputElement, InputProps>(function DestinationInput(
    { ...props },
    ref,
) {
    const { setValue } = useFormContext<DepositFormData>();
    const layer2Account = useAccount();

    const [isManualInput, setManualInput] = useState(false);

    const isLayer2WalletConnected = layer2Account.isConnected;

    useEffect(() => {
        const destinationAddress = layer2Account.address;

        if (!isManualInput) {
            setValue('receivingAddress', destinationAddress ?? '', {
                shouldValidate: !!destinationAddress,
            });
        } else {
            setValue('receivingAddress', '');
        }
    }, [isManualInput, layer2Account, setValue]);

    const TO_LABEL = `To IOTA EVM`;

    return (
        <div className="relative">
            {isManualInput || isLayer2WalletConnected ? (
                <Input ref={ref} {...props} caption={TO_LABEL} readOnly={!isManualInput} />
            ) : (
                <WalletConnectInput label={TO_LABEL} isDestination isLayer1={false} />
            )}

            <ButtonUnstyled
                onClick={() => setManualInput(!isManualInput)}
                className="absolute bottom-0 right-0 group state-layer flex items-center px-xs rounded-full"
                testId="toggle-receiver-address-input"
            >
                <span className="text-body-md text-neutral-40 dark:text-neutral-60">
                    {isManualInput ? 'Connect a wallet' : 'Enter manually'}
                </span>
            </ButtonUnstyled>
        </div>
    );
});
