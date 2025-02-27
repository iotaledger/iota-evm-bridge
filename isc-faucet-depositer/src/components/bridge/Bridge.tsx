import { DepositLayer1 } from '../';
import { Header } from '@iota/apps-ui-kit';
import { FormProvider, useForm } from 'react-hook-form';
import { useMemo } from 'react';
import { IOTA_DECIMALS } from '@iota/iota-sdk/utils';
import { createBridgeFormSchema, DepositFormData } from '../../lib/schema/bridgeForm.schema';
import { useCurrentAccount } from '@iota/dapp-kit';
import { useBalance } from '../../hooks/useBalance';
import { zodResolver } from '@hookform/resolvers/zod';

export function Bridge() {
    const account = useCurrentAccount();
    const { data: balance } = useBalance(account?.address || '');

    const formSchema = useMemo(
        () => createBridgeFormSchema(BigInt(balance?.totalBalance ?? 0), IOTA_DECIMALS),
        [balance],
    );

    const formMethods = useForm<DepositFormData>({
        mode: 'all',
        resolver: zodResolver(formSchema),
    });

    return (
        <FormProvider {...formMethods}>
            <div className="relative h-full">
                <BackgroundArrows />

                <div className="rounded-3xl bg-shader-primary-light-8 border-shader-inverted-dark-16 dark:bg-shader-inverted-dark-16 dark:border-shader-primary-light-8 h-full relative backdrop-blur-xl border">
                    <div className="[&_>div]:bg-transparent dark:[&_>div]:bg-transparent">
                        <Header title="Send" />
                    </div>

                    <div className="p-md--rs">
                        <DepositLayer1 />
                    </div>
                </div>
            </div>
        </FormProvider>
    );
}

function BackgroundArrows() {
    return (
        <>
            <img
                src="/background-arrow.svg"
                alt="background arrow asset"
                className="absolute top-6 right-0 translate-x-[65%] z-0 pointer-events-none select-none"
            />
            <img
                src="/background-arrow.svg"
                alt="background arrow asset"
                className="absolute rotate-180 bottom-6 left-0 -translate-x-[65%] pointer-events-none select-none"
            />
        </>
    );
}
